<script setup lang="ts">
/**
 * @package web
 * @name AppAdminPermissionsPage.vue
 * @version 0.0.3
 * @description Gestiona permisos institucionales por RFC en dominio app.
 * @author @codex
 * @changelog
 * - 0.0.3	(2026-05-05)	Agrega validación inmediata de correo y deshabilita guardado hasta cumplir formato.	@codex
 * - 0.0.2	(2026-05-04)	Reemplaza placeholder por listado, filtros y modales de alta/edicion de permisos.	@codex
 * - 0.0.1	(2026-04-10)	Version inicial del archivo.	@tirsomartinezreyes
 */
import { PERMISSION_STATUS, ROLE, type Permission, type PermissionStatus } from '@shared';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import StatusBadge from '@/components/shared/StatusBadge.vue';
import { useAppAdminInstitutionController } from '@/composables/useDataControllers';
import { useAuthStore } from '@/stores/authStore';

type RoleValue = (typeof ROLE)[keyof typeof ROLE];

const route = useRoute();
const controller = useAppAdminInstitutionController();
const authStore = useAuthStore();
const permissions = ref<Permission[]>([]);
const search = ref('');
const roleFilter = ref('');
const statusFilter = ref('');
const showCreateModal = ref(false);
const showEditModal = ref(false);
const editPermissionId = ref('');
const email = ref('');
const role = ref<RoleValue>(ROLE.INSTITUTION_OPERATOR);
const status = ref<PermissionStatus>(PERMISSION_STATUS.GRANTED);
const routeRfc = computed(() => String(route.params.rfc ?? '').trim().toUpperCase());
const isReadOnly = computed(() => authStore.activeRole !== 'INSTITUTION_ADMIN');
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const canCreatePermission = computed(() => emailRegex.test(email.value.trim().toLowerCase()));

const filteredPermissions = computed(() =>
  permissions.value.filter((item) => {
    const byEmail = item.email.includes(search.value.trim().toLowerCase());
    const byRole = !roleFilter.value || item.role === roleFilter.value;
    const byStatus = !statusFilter.value || item.status === statusFilter.value;
    return byEmail && byRole && byStatus;
  }),
);

function resetForm() {
  email.value = '';
  role.value = ROLE.INSTITUTION_OPERATOR;
  status.value = PERMISSION_STATUS.GRANTED;
}

function openEdit(permission: Permission) {
  editPermissionId.value = permission.permissionId;
  email.value = permission.email;
  role.value = permission.role;
  status.value = permission.status;
  showEditModal.value = true;
}

function openCreate() {
  resetForm();
  showCreateModal.value = true;
}

async function loadPermissions() {
  try {
    permissions.value = await controller.loadPermissionsByRfc(routeRfc.value);
  } catch {
    permissions.value = [];
  }
}

async function createPermission() {
  if (isReadOnly.value || !canCreatePermission.value || controller.isSaving.value) {
    return;
  }
  await controller.createInstitutionPermission(routeRfc.value, {
    email: email.value,
    role: role.value,
    status: PERMISSION_STATUS.GRANTED,
  });
  showCreateModal.value = false;
  resetForm();
  await loadPermissions();
}

async function updatePermission() {
  if (isReadOnly.value || controller.isSaving.value) {
    return;
  }
  await controller.updateInstitutionPermission(routeRfc.value, editPermissionId.value, {
    role: role.value,
    status: status.value,
  });
  showEditModal.value = false;
  resetForm();
  await loadPermissions();
}

onMounted(() => {
  void loadPermissions();
});
</script>

<template>
  <section class="grid gap-4">
    <VaCard>
      <VaCardContent class="grid gap-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <VaCardTitle>Permisos institucionales</VaCardTitle>
          <VaButton :disabled="isReadOnly" @click="openCreate">Nuevo permiso</VaButton>
        </div>
        <p class="text--secondary">RFC {{ routeRfc }}</p>
        <VaAlert v-if="isReadOnly" color="info" dense>
          Modo solo lectura para el rol operador institucional.
        </VaAlert>
        <div class="grid grid-cols-1 gap-2 md:grid-cols-3">
          <VaInput v-model="search" label="Filtrar por correo" />
          <VaSelect v-model="roleFilter" :options="['', ROLE.INSTITUTION_ADMIN, ROLE.INSTITUTION_OPERATOR]" label="Rol" />
          <VaSelect
            v-model="statusFilter"
            :options="['', PERMISSION_STATUS.GRANTED, PERMISSION_STATUS.DENIED, PERMISSION_STATUS.REVOKED]"
            label="Estado"
          />
        </div>
      </VaCardContent>
    </VaCard>

    <VaAlert v-if="controller.errorMessage.value" color="danger" icon="warning">
      {{ controller.errorMessage.value }}
    </VaAlert>

    <VaCard>
      <VaCardContent>
        <p v-if="controller.isLoading.value" class="text--secondary">Cargando permisos...</p>
        <p v-else-if="filteredPermissions.length === 0" class="text--secondary">No hay permisos para mostrar.</p>
        <div v-else class="overflow-x-auto">
          <table class="va-table va-table--hoverable w-full" data-testid="app-admin-permissions-table">
            <thead>
              <tr>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr v-for="permission in filteredPermissions" :key="permission.permissionId">
                <td>{{ permission.email }}</td>
                <td>{{ permission.role }}</td>
                <td><StatusBadge :status="permission.status" /></td>
                <td><VaButton size="small" preset="secondary" :disabled="isReadOnly" @click="openEdit(permission)">Editar</VaButton></td>
              </tr>
            </tbody>
          </table>
        </div>
      </VaCardContent>
    </VaCard>

    <VaModal v-model="showCreateModal" title="Crear permiso" hide-default-actions max-width="34rem">
      <VaForm class="grid gap-2" immediate @submit.prevent="createPermission">
        <VaInput
          v-model="email"
          label="Correo"
          :rules="[
            (v) => !!String(v ?? '').trim() || 'El correo es obligatorio.',
            (v) => emailRegex.test(String(v ?? '').trim().toLowerCase()) || 'Formato de correo inválido.',
          ]"
        />
        <VaSelect v-model="role" :options="[ROLE.INSTITUTION_ADMIN, ROLE.INSTITUTION_OPERATOR]" label="Rol" />
        <VaInput :model-value="PERMISSION_STATUS.GRANTED" label="Estado" readonly />
        <div class="flex justify-end gap-2">
          <VaButton preset="secondary" @click="showCreateModal = false; resetForm()">Cancelar</VaButton>
          <VaButton type="submit" :loading="controller.isSaving.value" :disabled="!canCreatePermission">Guardar</VaButton>
        </div>
      </VaForm>
    </VaModal>

    <VaModal v-model="showEditModal" title="Editar permiso" hide-default-actions max-width="34rem">
      <VaForm class="grid gap-2" immediate @submit.prevent="updatePermission">
        <VaInput v-model="email" label="Correo" readonly />
        <VaSelect v-model="role" :options="[ROLE.INSTITUTION_ADMIN, ROLE.INSTITUTION_OPERATOR]" label="Rol" />
        <VaSelect
          v-model="status"
          :options="[PERMISSION_STATUS.GRANTED, PERMISSION_STATUS.DENIED, PERMISSION_STATUS.REVOKED]"
          label="Estado"
        />
        <div class="flex justify-end gap-2">
          <VaButton preset="secondary" @click="showEditModal = false; resetForm()">Cancelar</VaButton>
          <VaButton type="submit" :loading="controller.isSaving.value">Guardar</VaButton>
        </div>
      </VaForm>
    </VaModal>
  </section>
</template>

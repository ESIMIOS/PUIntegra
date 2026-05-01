<script setup lang="ts">
/**
 * @package web
 * @name AccountInstitutionsPage.vue
 * @version 0.0.1
 * @description Lista instituciones disponibles para la cuenta autenticada según sus permisos.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-04-27)	Mueve la lista institucional al dominio de cuenta y muestra datos de permiso.	@codex
 */
import { computed, onMounted, ref } from 'vue';
import { SYSTEM_RFC, type Institution, type Permission } from '@shared';
import StatusBadge from '@/components/shared/StatusBadge.vue';
import { useInstitutionSelectionController } from '@/composables/useDataControllers';
import { useAuthStore } from '@/stores/authStore';

type AccountInstitutionRow = {
  RFC: string;
  institutionName: string;
  role: Permission['role'];
  email: string;
  status: Permission['status'];
};

const authStore = useAuthStore();
const controller = useInstitutionSelectionController();

const permissions = ref<Permission[]>([]);
const institutions = ref<Institution[]>([]);

const institutionNameByRfc = computed(() =>
  new Map(institutions.value.map((institution) => [institution.RFC, institution.name])),
);
const tenantPermissions = computed(() =>
  permissions.value.filter((permission) => permission.RFC !== SYSTEM_RFC),
);
const rows = computed<AccountInstitutionRow[]>(() =>
  tenantPermissions.value
    .map((permission) => ({
      RFC: permission.RFC,
      institutionName: institutionNameByRfc.value.get(permission.RFC) ?? 'Institucion sin registro',
      role: permission.role,
      email: permission.email,
      status: permission.status,
    }))
    .sort((left, right) => left.RFC.localeCompare(right.RFC)),
);

async function loadInstitutions() {
  if (!authStore.email) {
    permissions.value = [];
    institutions.value = [];
    return;
  }

  try {
    permissions.value = await controller.loadPermissionsByEmail(authStore.email);
    institutions.value = await Promise.all(
      tenantPermissions.value.map((permission) => controller.loadInstitutionByRfc(permission.RFC)),
    );
  } catch {
    permissions.value = [];
    institutions.value = [];
  }
}

onMounted(() => {
  void loadInstitutions();
});
</script>

<template>
  <section class="grid gap-4">
    <VaCard>
      <VaCardContent>
        <VaCardTitle>Instituciones</VaCardTitle>
        <p class="text--secondary mt-1">
          Instituciones asociadas a tu cuenta según permisos vigentes.
        </p>

        <VaAlert
          v-if="controller.errorMessage.value"
          class="mt-4"
          color="danger"
          icon="warning"
          dense
          data-testid="account-institutions-error"
        >
          {{ controller.errorMessage.value }}
        </VaAlert>

        <div v-if="controller.errorMessage.value" class="flex flex-wrap gap-2 mt-3">
          <VaButton
            preset="secondary"
            color="danger"
            data-testid="account-institutions-retry"
            @click="loadInstitutions"
          >
            Reintentar carga
          </VaButton>
        </div>
      </VaCardContent>
    </VaCard>

    <VaCard>
      <VaCardContent>
        <p v-if="controller.isLoading.value" class="text--secondary">Cargando instituciones...</p>

        <p v-else-if="rows.length === 0" class="text--secondary">
          No hay instituciones con permisos visibles para esta cuenta.
        </p>

        <div v-else class="table-responsive">
          <table class="va-table va-table--hoverable w-full" data-testid="account-institutions-table">
            <thead>
              <tr>
                <th>RFC</th>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Correo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="`${row.RFC}-${row.email}-${row.role}`">
                <td class="bold">{{ row.RFC }}</td>
                <td>{{ row.institutionName }}</td>
                <td>{{ row.role }}</td>
                <td>{{ row.email }}</td>
                <td>
                  <StatusBadge :status="row.status" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </VaCardContent>
    </VaCard>
  </section>
</template>

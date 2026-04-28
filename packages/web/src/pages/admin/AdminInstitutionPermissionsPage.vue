<script setup lang="ts">
/**
 * @package web
 * @name AdminInstitutionPermissionsPage.vue
 * @version 0.0.1
 * @description Lista permisos por RFC institucional para inspección de backoffice.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-04-27)	Agrega vista de permisos tenant bajo ruta /admin/:rfc/permissions.	@codex
 */
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Institution, Permission } from '@shared';
import StatusBadge from '@/components/shared/StatusBadge.vue';
import { useAdminTenantPermissionsController } from '@/composables/useDataControllers';
import { routePaths } from '@/shared/constants/routePaths';

const route = useRoute();
const router = useRouter();
const controller = useAdminTenantPermissionsController();
const institution = ref<Institution | null>(null);
const permissions = ref<Permission[]>([]);

const routeRfc = computed(() => String(route.params.rfc ?? '').trim().toUpperCase());

async function loadTenantPermissions() {
  try {
    institution.value = await controller.loadInstitutionByRfc(routeRfc.value);
    permissions.value = await controller.loadPermissionsByRfc(routeRfc.value);
  } catch {
    institution.value = null;
    permissions.value = [];
  }
}

async function goToInstitution() {
  await router.push(routePaths.adminInstitution(routeRfc.value));
}

onMounted(() => {
  void loadTenantPermissions();
});
</script>

<template>
  <section class="grid gap-4">
    <VaCard>
      <VaCardContent>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <VaCardTitle>Permisos institucionales</VaCardTitle>
            <p class="text--secondary mt-1">
              Permisos asignados para la institución tenant en inspección.
            </p>
          </div>
          <VaButton preset="secondary" data-testid="admin-permissions-back" @click="goToInstitution">
            Volver a institución
          </VaButton>
        </div>

        <VaAlert
          v-if="controller.errorMessage.value"
          class="mt-4"
          color="danger"
          icon="warning"
          dense
          data-testid="admin-permissions-error"
        >
          {{ controller.errorMessage.value }}
        </VaAlert>
      </VaCardContent>
    </VaCard>

    <VaCard>
      <VaCardContent>
        <p v-if="controller.isLoading.value" class="text--secondary">Cargando permisos...</p>

        <p v-else-if="permissions.length === 0" class="text--secondary">
          No hay permisos registrados para {{ routeRfc }}.
        </p>

        <div v-else class="table-responsive">
          <table class="va-table va-table--hoverable w-full" data-testid="admin-permissions-table">
            <thead>
              <tr>
                <th>RFC</th>
                <th>Institución</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="permission in permissions" :key="permission.permissionId">
                <td class="bold">{{ permission.RFC }}</td>
                <td>{{ institution?.name ?? 'Institución desconocida' }}</td>
                <td>{{ permission.email }}</td>
                <td>{{ permission.role }}</td>
                <td>
                  <StatusBadge :status="permission.status" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </VaCardContent>
    </VaCard>
  </section>
</template>

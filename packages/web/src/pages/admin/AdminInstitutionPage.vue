<script setup lang="ts">
/**
 * @package web
 * @name AdminInstitutionPage.vue
 * @version 0.0.2
 * @description Muestra detalle read-only de institución tenant para inspección de backoffice.
 * @author @codex
 * @changelog
 * - 0.0.2	(2026-04-26)	Reemplaza placeholder con detalle institucional read-only.	@codex
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Institution } from '@shared';
import StatusBadge from '@/components/shared/StatusBadge.vue';
import UpdateHistoryPanel from '@/components/shared/UpdateHistoryPanel.vue';
import { useAdminInstitutionsController } from '@/composables/useDataControllers';
import { routePaths } from '@/shared/constants/routePaths';
import {
  asHistoryRecord,
  institutionUpdateFieldDefinitions,
} from '@/shared/updateHistory/updateHistoryFieldDefinitions';

const route = useRoute();
const router = useRouter();
const controller = useAdminInstitutionsController();
const institution = ref<Institution | null>(null);

const routeRfc = computed(() => String(route.params.rfc ?? '').trim().toUpperCase());
const hasInstitution = computed(() => institution.value !== null);
const secretStatus = computed(() => (institution.value?.sharedSecret ? 'Secreto configurado' : 'Secreto pendiente'));
const updatesCountText = computed(() => {
  const count = institution.value?.updates?.length ?? 0;
  return count === 1 ? '1 actualización' : `${count} actualizaciones`;
});

function formatDate(value: number) {
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeZone: 'UTC' }).format(value);
}

async function loadInstitution() {
  try {
    institution.value = await controller.loadInstitutionByRfc(routeRfc.value);
  } catch {
    institution.value = null;
  }
}

async function goToList() {
  await router.push(routePaths.adminInstitutions);
}

async function goToRequests() {
  await router.push(routePaths.adminInstitutionRequests(routeRfc.value));
}

async function goToPlan() {
  await router.push(routePaths.adminInstitutionPlan(routeRfc.value));
}

async function goToContacts() {
  await router.push(routePaths.adminInstitutionContacts(routeRfc.value));
}

async function goToPermissions() {
  await router.push(routePaths.adminTenantPermissions(routeRfc.value));
}

onMounted(() => {
  void loadInstitution();
});
</script>

<template>
  <section class="grid gap-4">
    <VaCard>
      <VaCardContent>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <VaCardTitle>Detalle institucional</VaCardTitle>
            <p class="text--secondary mt-1">
              Vista read-only para supervisión de backoffice.
            </p>
          </div>
          <VaButton preset="secondary" data-testid="admin-institution-back" @click="goToList">
            Volver al listado
          </VaButton>
        </div>

        <VaAlert
          v-if="controller.errorMessage.value"
          class="mt-4"
          color="danger"
          icon="warning"
          dense
          data-testid="admin-institution-error"
        >
          {{ controller.errorMessage.value }}
        </VaAlert>

        <p v-if="controller.isLoading.value" class="text--secondary mt-4">Cargando institución...</p>
      </VaCardContent>
    </VaCard>

    <template v-if="hasInstitution && institution">
      <VaCard>
        <VaCardContent>
          <VaCardTitle>{{ institution.name }}</VaCardTitle>
          <div class="row mt-3">
            <div class="flex md6 xs12">
              <p class="text--secondary">RFC</p>
              <p class="bold">{{ institution.RFC }}</p>
            </div>
            <div class="flex md6 xs12">
              <p class="text--secondary">Estado de secreto</p>
              <p class="bold">{{ secretStatus }}</p>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard>
        <VaCardContent>
          <VaCardTitle>Plan comercial</VaCardTitle>
          <table class="va-table va-table--hoverable w-full mt-3">
            <thead>
              <tr>
                <th>Plan</th>
                <th>Estado</th>
                <th>Inicio</th>
                <th>Fin</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{{ institution.plan }}</td>
                <td>
                  <StatusBadge :status="institution.planStatus" />
                </td>
                <td>{{ formatDate(institution.planStartAt) }}</td>
                <td>{{ formatDate(institution.planFinishAt) }}</td>
              </tr>
            </tbody>
          </table>
        </VaCardContent>
      </VaCard>

      <VaCard>
        <VaCardContent>
          <VaCardTitle>Trazabilidad</VaCardTitle>
          <table class="va-table va-table--hoverable w-full mt-3">
            <thead>
              <tr>
                <th>Creada</th>
                <th>Actualizada</th>
                <th>Historial</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{{ formatDate(institution.createdAt) }}</td>
                <td>{{ formatDate(institution.updatedAt) }}</td>
                <td>{{ updatesCountText }}</td>
              </tr>
            </tbody>
          </table>
          <div class="mt-3" data-testid="admin-institution-update-history">
            <UpdateHistoryPanel
              :updates="asHistoryRecord(institution.updates)"
              :field-definitions="institutionUpdateFieldDefinitions"
              mode="inline"
            />
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard>
        <VaCardContent>
          <VaCardTitle>Rutas relacionadas</VaCardTitle>
          <div class="flex flex-wrap gap-2 mt-3">
            <VaButton preset="secondary" data-testid="admin-institution-requests" @click="goToRequests">
              Solicitudes
            </VaButton>
            <VaButton preset="secondary" data-testid="admin-institution-plan" @click="goToPlan">
              Plan
            </VaButton>
            <VaButton preset="secondary" data-testid="admin-institution-contacts" @click="goToContacts">
              Contactos
            </VaButton>
            <VaButton preset="secondary" data-testid="admin-institution-permissions" @click="goToPermissions">
              Permisos
            </VaButton>
          </div>
        </VaCardContent>
      </VaCard>
    </template>
  </section>
</template>

<script setup lang="ts">
/**
 * @package web
 * @name AdminInstitutionRequestsPage.vue
 * @version 0.0.2
 * @description Lista solicitudes tenant de solo lectura para backoffice.
 * @author @codex
 * @changelog
 * - 0.0.2	(2026-04-27)	Reemplaza placeholder por tabla readonly por RFC tenant.	@codex
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Request } from '@shared';
import UpdateHistoryPanel from '@/components/shared/UpdateHistoryPanel.vue';
import { useAdminTenantInspectionController } from '@/composables/useDataControllers';
import { routePaths } from '@/shared/constants/routePaths';
import {
  asHistoryRecord,
  requestUpdateFieldDefinitions,
} from '@/shared/updateHistory/updateHistoryFieldDefinitions';

const route = useRoute();
const router = useRouter();
const controller = useAdminTenantInspectionController();
const requests = ref<Request[]>([]);

const routeRfc = computed(() => String(route.params.rfc ?? '').toUpperCase());

async function loadRequests() {
  try {
    requests.value = await controller.loadRequestsByRfc(routeRfc.value);
  } catch {
    requests.value = [];
  }
}

function goBack() {
  router.push(routePaths.adminInstitution(routeRfc.value));
}

function formatDate(value: number | null) {
  return value ? new Date(value).toISOString().slice(0, 10) : 'Sin fecha';
}

onMounted(loadRequests);
</script>

<template>
  <section class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold">Solicitudes tenant</h1>
        <p class="text--secondary">RFC {{ routeRfc }}</p>
      </div>
      <VaButton preset="secondary" data-testid="admin-requests-back" @click="goBack">
        Volver a institución
      </VaButton>
    </div>

    <VaAlert
      v-if="controller.errorMessage.value"
      color="danger"
      data-testid="admin-requests-error"
    >
      {{ controller.errorMessage.value }}
      <template #append>
        <VaButton size="small" preset="secondary" data-testid="admin-requests-retry" @click="loadRequests">
          Reintentar
        </VaButton>
      </template>
    </VaAlert>

    <VaCard>
      <VaCardContent>
        <p v-if="controller.isLoading.value">Cargando solicitudes...</p>
        <p v-else-if="requests.length === 0" class="text--secondary">No hay solicitudes para este RFC.</p>
        <div v-else class="overflow-x-auto">
          <table class="va-table va-table--hoverable w-full" data-testid="admin-requests-table">
            <thead>
              <tr>
                <th>FUB</th>
                <th>CURP</th>
                <th>Estatus</th>
                <th>Datos básicos</th>
                <th>Histórica</th>
                <th>Continua</th>
                <th>Fecha desaparición</th>
                <th>Historial</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="request in requests" :key="request.requestId">
                <td>{{ request.FUB }}</td>
                <td>{{ request.CURP }}</td>
                <td>{{ request.searchRequestStatus }}</td>
                <td>{{ request.searchRequestBasicDataPhaseStatus }}</td>
                <td>{{ request.searchRequestHistoricalPhaseStatus }}</td>
                <td>{{ request.searchRequestContinuousPhaseStatus }}</td>
                <td>{{ formatDate(request.missingDate) }}</td>
                <td>
                  <UpdateHistoryPanel
                    :updates="asHistoryRecord(request.updates)"
                    :field-definitions="requestUpdateFieldDefinitions"
                    mode="icon"
                    :test-id="`admin-request-history-${request.requestId}`"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </VaCardContent>
    </VaCard>
  </section>
</template>

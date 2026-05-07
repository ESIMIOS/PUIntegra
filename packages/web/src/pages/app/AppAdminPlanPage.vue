<script setup lang="ts">
/**
 * @package web
 * @name AppAdminPlanPage.vue
 * @version 0.0.2
 * @description Renderiza vista readonly del plan institucional en el dominio app.
 * @author @codex
 * @changelog
 * - 0.0.2	(2026-05-04)	Reemplaza placeholder por inspeccion readonly del plan institucional.	@codex
 * - 0.0.1	(2026-04-10)	Version inicial del archivo.	@tirsomartinezreyes
 */
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { friendlyRelativeTimeEs, type Institution } from '@shared';
import { useAppAdminInstitutionController } from '@/composables/useDataControllers';
import { useAuthStore } from '@/stores/authStore';

const route = useRoute();
const controller = useAppAdminInstitutionController();
const authStore = useAuthStore();
const institution = ref<Institution | null>(null);
const routeRfc = computed(() => String(route.params.rfc ?? '').trim().toUpperCase());
const isReadOnly = computed(() => authStore.activeRole !== 'INSTITUTION_ADMIN');

async function loadInstitution() {
  try {
    institution.value = await controller.loadInstitutionByRfc(routeRfc.value);
  } catch {
    institution.value = null;
  }
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

onMounted(() => {
  void loadInstitution();
});
</script>

<template>
  <section class="grid gap-4">
    <VaCard>
      <VaCardContent>
        <VaCardTitle>Plan institucional</VaCardTitle>
        <p class="text--secondary mt-1">RFC {{ routeRfc }}</p>
        <VaAlert v-if="isReadOnly" class="mt-3" color="info" dense>
          Modo solo lectura para el rol operador institucional.
        </VaAlert>
      </VaCardContent>
    </VaCard>

    <VaAlert v-if="controller.errorMessage.value" color="danger" icon="warning" data-testid="app-admin-plan-error">
      {{ controller.errorMessage.value }}
      <template #append>
        <VaButton size="small" preset="secondary" data-testid="app-admin-plan-retry" @click="loadInstitution">
          Reintentar
        </VaButton>
      </template>
    </VaAlert>

    <VaCard>
      <VaCardContent>
        <p v-if="controller.isLoading.value" class="text--secondary">Cargando plan...</p>
        <div v-else-if="institution" class="grid gap-3" data-testid="app-admin-plan-summary">
          <div>
            <p class="text--secondary text-sm">Institución</p>
            <p class="text-xl font-semibold">{{ institution.name }}</p>
          </div>
          <p><strong>Plan:</strong> {{ institution.plan }}</p>
          <p><strong>Estado del plan:</strong> {{ institution.planStatus }}</p>
          <div class="grid gap-2 md:grid-cols-2">
            <div class="rounded bg-[var(--va-background-element)] p-3">
              <p class="text--secondary text-sm">Inicio del plan</p>
              <p class="font-semibold">{{ formatDate(institution.planStartAt) }}</p>
              <p class="text--secondary text-xs">{{ friendlyRelativeTimeEs(institution.planStartAt) }}</p>
            </div>
            <div class="rounded bg-[var(--va-background-element)] p-3">
              <p class="text--secondary text-sm">Fin del plan</p>
              <p class="font-semibold">{{ formatDate(institution.planFinishAt) }}</p>
              <p class="text--secondary text-xs">{{ friendlyRelativeTimeEs(institution.planFinishAt) }}</p>
            </div>
          </div>
          <p class="text--secondary text-sm">
            Última actualización: {{ formatDate(institution.updatedAt) }} ({{ friendlyRelativeTimeEs(institution.updatedAt) }})
          </p>
        </div>
        <p v-else class="text--secondary">No se encontró la institución solicitada.</p>
      </VaCardContent>
    </VaCard>
  </section>
</template>

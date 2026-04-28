<script setup lang="ts">
/**
 * @package web
 * @name AdminInstitutionPlanPage.vue
 * @version 0.0.2
 * @description Edita plan, estado y vigencia institucional desde backoffice.
 * @author @codex
 * @changelog
 * - 0.0.2	(2026-04-27)	Reemplaza placeholder por formulario de edición auditada.	@codex
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */
import {
  COMMERCIAL_PLAN,
  COMMERCIAL_PLAN_STATUS,
  formatUiErrorString,
  type CommercialPlan,
  type CommercialPlanStatus,
  type Institution,
} from '@shared';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAdminTenantInspectionController } from '@/composables/useDataControllers';
import { routePaths } from '@/shared/constants/routePaths';
import { systemMessageTree } from '@/shared/constants/systemMessages';

const route = useRoute();
const router = useRouter();
const controller = useAdminTenantInspectionController();
const formRef = ref<{ validate: () => boolean | Promise<boolean> } | null>(null);
const institution = ref<Institution | null>(null);
const plan = ref<CommercialPlan>(COMMERCIAL_PLAN.PORTAL);
const planStatus = ref<CommercialPlanStatus>(COMMERCIAL_PLAN_STATUS.ACTIVE);
const planStartAt = ref('');
const planFinishAt = ref('');
const localError = ref<string | null>(null);
const successMessage = ref<string | null>(null);

const planOptions = [COMMERCIAL_PLAN.PORTAL, COMMERCIAL_PLAN.CLOUD, COMMERCIAL_PLAN.ENTERPRISE];
const planStatusOptions = [
  COMMERCIAL_PLAN_STATUS.ACTIVE,
  COMMERCIAL_PLAN_STATUS.WARNING,
  COMMERCIAL_PLAN_STATUS.PAUSED,
  COMMERCIAL_PLAN_STATUS.STOPPED,
];
const routeRfc = computed(() => String(route.params.rfc ?? '').toUpperCase());
const errorMessage = computed(() => localError.value ?? controller.errorMessage.value);
const isSubmitDisabled = computed(() => controller.isSaving.value || !isValidPlanDateRange());

function fromUtcMilliseconds(value: number) {
  return new Date(value).toISOString().slice(0, 10);
}

function toUtcMilliseconds(value: string) {
  return Date.parse(`${value}T00:00:00.000Z`);
}

function isValidPlanDateRange() {
  if (!planStartAt.value || !planFinishAt.value) {
    return false;
  }
  const startAt = toUtcMilliseconds(planStartAt.value);
  const finishAt = toUtcMilliseconds(planFinishAt.value);
  return !(Number.isNaN(startAt) || Number.isNaN(finishAt) || startAt > finishAt);
}

const requiredTextRule = (label: string) => (value: string) => value.trim().length > 0 || `${label} es requerido.`;
const dateRangeRule = () => isValidPlanDateRange() || 'Rango de fechas no válido.';

async function loadInstitution() {
  try {
    institution.value = await controller.loadInstitutionByRfc(routeRfc.value);
    plan.value = institution.value.plan;
    planStatus.value = institution.value.planStatus;
    planStartAt.value = fromUtcMilliseconds(institution.value.planStartAt);
    planFinishAt.value = fromUtcMilliseconds(institution.value.planFinishAt);
  } catch {
    institution.value = null;
  }
}

async function handleSubmit() {
  localError.value = null;
  successMessage.value = null;
  controller.retry();
  const isValid = Boolean(await formRef.value?.validate());
  if (!isValid || !isValidPlanDateRange()) {
    localError.value = formatUiErrorString(systemMessageTree.web.ui.data.validation);
    return;
  }

  try {
    const response = await controller.updateInstitutionPlan(routeRfc.value, {
      plan: plan.value,
      planStatus: planStatus.value,
      planStartAt: toUtcMilliseconds(planStartAt.value),
      planFinishAt: toUtcMilliseconds(planFinishAt.value),
    });
    institution.value = response.institution;
    successMessage.value = 'Plan institucional actualizado.';
  } catch {
    // DataStore already exposes normalized error text.
  }
}

function goBack() {
  void router.push(routePaths.adminInstitution(routeRfc.value));
}

onMounted(loadInstitution);
</script>

<template>
  <section class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold">Plan institucional</h1>
        <p class="text--secondary">RFC {{ routeRfc }}</p>
      </div>
      <VaButton preset="secondary" data-testid="admin-plan-back" @click="goBack">
        Volver a institución
      </VaButton>
    </div>

    <VaAlert v-if="errorMessage" color="danger" icon="warning" dense data-testid="admin-plan-error">
      {{ errorMessage }}
      <template #append>
        <VaButton size="small" preset="secondary" data-testid="admin-plan-retry" @click="loadInstitution">
          Reintentar
        </VaButton>
      </template>
    </VaAlert>

    <VaAlert v-if="successMessage" color="success" icon="check" dense data-testid="admin-plan-success">
      {{ successMessage }}
    </VaAlert>

    <VaCard>
      <VaCardContent>
        <p v-if="controller.isLoading.value">Cargando plan...</p>
        <VaForm
          v-else-if="institution"
          ref="formRef"
          class="grid gap-3"
          immediate
          data-testid="admin-plan-form"
          @submit.prevent="handleSubmit"
        >
          <VaInput :model-value="institution.name" label="Institución" readonly data-testid="admin-plan-name" />
          <VaSelect v-model="plan" :options="planOptions" label="Plan" data-testid="admin-plan-plan" />
          <VaSelect
            v-model="planStatus"
            :options="planStatusOptions"
            label="Estado del plan"
            data-testid="admin-plan-status"
          />
          <VaInput
            v-model="planStartAt"
            type="date"
            label="Inicio del plan"
            :rules="[requiredTextRule('Inicio del plan'), dateRangeRule]"
            data-testid="admin-plan-start-at"
          />
          <VaInput
            v-model="planFinishAt"
            type="date"
            label="Fin del plan"
            :rules="[requiredTextRule('Fin del plan'), dateRangeRule]"
            data-testid="admin-plan-finish-at"
          />
          <VaButton
            type="submit"
            :loading="controller.isSaving.value"
            :disabled="isSubmitDisabled"
            data-testid="admin-plan-submit"
          >
            Guardar plan
          </VaButton>
        </VaForm>
      </VaCardContent>
    </VaCard>
  </section>
</template>

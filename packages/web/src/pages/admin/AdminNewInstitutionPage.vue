<script setup lang="ts">
/**
 * @package web
 * @name AdminNewInstitutionPage.vue
 * @version 0.0.2
 * @description Implementa el flujo de alta de institución para backoffice vía API HTTP.
 * @author @codex
 * @changelog
 * - 0.0.2	(2026-04-23)	Reemplaza placeholder con formulario y envío HTTP autenticado.	@codex
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */
import {
  COMMERCIAL_PLAN,
  COMMERCIAL_PLAN_STATUS,
  DEFAULT_RFC,
  SYSTEM_RFC,
  type CommercialPlan,
  type CommercialPlanStatus,
} from "@shared";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useInstitutionOnboardingController } from "@/composables/useDataControllers";
import { routePaths } from "@/shared/constants/routePaths";
import { APP_DATA_ERROR_KIND } from "@/shared/errors/appErrors";
import { webUiDataErrorByKind } from "@/shared/constants/systemMessages";

const router = useRouter();
const controller = useInstitutionOnboardingController();
const formRef = ref<{ validate: () => boolean | Promise<boolean> } | null>(null);

const RFC = ref("");
const name = ref("");
const plan = ref<CommercialPlan>(COMMERCIAL_PLAN.PORTAL);
const planStatus = ref<CommercialPlanStatus>(COMMERCIAL_PLAN_STATUS.ACTIVE);
const planStartAt = ref("");
const planFinishAt = ref("");
const adminEmail = ref("");
const createdInstitutionRfc = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const localError = ref<string | null>(null);
const planOptions = [COMMERCIAL_PLAN.PORTAL, COMMERCIAL_PLAN.CLOUD, COMMERCIAL_PLAN.ENTERPRISE];
const planStatusOptions = [
  COMMERCIAL_PLAN_STATUS.ACTIVE,
  COMMERCIAL_PLAN_STATUS.WARNING,
  COMMERCIAL_PLAN_STATUS.PAUSED,
  COMMERCIAL_PLAN_STATUS.STOPPED,
];

const errorMessage = computed(() => localError.value ?? controller.errorMessage.value);
const normalizedRfc = computed(() => RFC.value.trim().toUpperCase());
const trimmedName = computed(() => name.value.trim());
const trimmedAdminEmail = computed(() => adminEmail.value.trim().toLowerCase());

function isRequiredTextValid(value: string) {
  return value.trim().length > 0;
}

function isAllowedInstitutionRfc(value: string) {
  return value !== SYSTEM_RFC && value !== DEFAULT_RFC;
}

function isValidEmail(value: string) {
  return value.includes("@");
}

function isValidPlanDateRange(startDate: string, finishDate: string) {
  if (!startDate || !finishDate) {
    return false;
  }
  const startAt = toUtcMilliseconds(startDate);
  const finishAt = toUtcMilliseconds(finishDate);
  return !(Number.isNaN(startAt) || Number.isNaN(finishAt) || startAt > finishAt);
}

const isFormReadyToSubmit = computed(() =>
  isRequiredTextValid(normalizedRfc.value)
  && isRequiredTextValid(trimmedName.value)
  && isRequiredTextValid(planStartAt.value)
  && isRequiredTextValid(planFinishAt.value)
  && isRequiredTextValid(trimmedAdminEmail.value)
  && isAllowedInstitutionRfc(normalizedRfc.value)
  && isValidEmail(trimmedAdminEmail.value)
  && isValidPlanDateRange(planStartAt.value, planFinishAt.value)
);
const isSubmitDisabled = computed(() => controller.isSaving.value || !isFormReadyToSubmit.value);
const hasCreatedInstitution = computed(() => createdInstitutionRfc.value !== null);

const requiredTextRule = (label: string) => (value: string) =>
  isRequiredTextValid(value) || `${label} es requerido.`;
const rfcReservedRule = (value: string) => {
  const normalizedRfc = value.trim().toUpperCase();
  return isAllowedInstitutionRfc(normalizedRfc) || "RFC reservado. Usa un RFC institucional real.";
};
const emailRule = (value: string) => isValidEmail(value) || "Correo del administrador invalido.";
const startDateRangeRule = (value: string) => {
  if (!value || !planFinishAt.value) {
    return true;
  }
  return isValidPlanDateRange(value, planFinishAt.value) || "Rango de fechas invalido.";
};
const finishDateRangeRule = (value: string) => {
  if (!planStartAt.value || !value) {
    return true;
  }
  return isValidPlanDateRange(planStartAt.value, value) || "Rango de fechas invalido.";
};

/**
 * @description Convierte fecha yyyy-mm-dd a marca UTC en milisegundos.
 */
function toUtcMilliseconds(value: string) {
  return Date.parse(`${value}T00:00:00.000Z`);
}

async function handleSubmit() {
  localError.value = null;
  successMessage.value = null;
  controller.retry();
  const isValid = Boolean(await formRef.value?.validate());
  if (!isValid) {
    localError.value = webUiDataErrorByKind[APP_DATA_ERROR_KIND.VALIDATION].message;
    return;
  }

  try {
    const created = await controller.create({
      RFC: normalizedRfc.value,
      name: trimmedName.value,
      plan: plan.value,
      planStatus: planStatus.value,
      planStartAt: toUtcMilliseconds(planStartAt.value),
      planFinishAt: toUtcMilliseconds(planFinishAt.value),
      adminEmail: trimmedAdminEmail.value,
    });
    createdInstitutionRfc.value = created.institution.RFC;
    successMessage.value = "Institucion creada correctamente.";
  } catch {
    // DataStore captures normalized user-facing error text; page only keeps local validation errors.
  }
}

function resetOnboardingForm() {
  RFC.value = "";
  name.value = "";
  plan.value = COMMERCIAL_PLAN.PORTAL;
  planStatus.value = COMMERCIAL_PLAN_STATUS.ACTIVE;
  planStartAt.value = "";
  planFinishAt.value = "";
  adminEmail.value = "";
  createdInstitutionRfc.value = null;
  successMessage.value = null;
  localError.value = null;
  controller.retry();
}

async function goToCreatedInstitution() {
  if (!createdInstitutionRfc.value) {
    return;
  }
  await router.push(routePaths.adminInstitution(createdInstitutionRfc.value));
}
</script>

<template>
  <VaCard class="w-full">
    <VaCardContent>
      <VaCardTitle>Nueva institucion</VaCardTitle>

      <section v-if="hasCreatedInstitution" class="grid gap-3 mt-4" data-testid="admin-new-institution-result-success">
        <VaAlert color="success" icon="check" dense data-testid="admin-new-institution-success">
          {{ successMessage }}
        </VaAlert>
        <div class="flex flex-wrap gap-2">
          <VaButton data-testid="admin-new-institution-go-detail" @click="goToCreatedInstitution">
            Ir al detalle institucional
          </VaButton>
          <VaButton
            preset="secondary"
            color="secondary"
            data-testid="admin-new-institution-create-another"
            @click="resetOnboardingForm"
          >
            Crear otra institucion
          </VaButton>
        </div>
      </section>

      <VaForm
        v-else
        ref="formRef"
        class="grid gap-3 mt-4"
        immediate
        data-testid="admin-new-institution-form"
        @submit.prevent="handleSubmit"
      >
        <VaInput
          v-model="RFC"
          label="RFC"
          placeholder="AAA010101AAA"
          :rules="[requiredTextRule('RFC'), rfcReservedRule]"
          data-testid="admin-new-institution-rfc"
        />
        <VaInput
          v-model="name"
          label="Nombre"
          placeholder="Institucion ejemplo"
          :rules="[requiredTextRule('Nombre')]"
          data-testid="admin-new-institution-name"
        />
        <VaSelect
          v-model="plan"
          :options="planOptions"
          label="Plan"
          data-testid="admin-new-institution-plan"
        />
        <VaSelect
          v-model="planStatus"
          :options="planStatusOptions"
          label="Estado del plan"
          data-testid="admin-new-institution-plan-status"
        />
        <VaInput
          v-model="planStartAt"
          type="date"
          label="Inicio del plan"
          :rules="[requiredTextRule('Inicio del plan'), startDateRangeRule]"
          data-testid="admin-new-institution-plan-start-at"
        />
        <VaInput
          v-model="planFinishAt"
          type="date"
          label="Fin del plan"
          :rules="[requiredTextRule('Fin del plan'), finishDateRangeRule]"
          data-testid="admin-new-institution-plan-finish-at"
        />
        <VaInput
          v-model="adminEmail"
          type="email"
          label="Correo del administrador inicial"
          placeholder="admin@institucion.test"
          :rules="[requiredTextRule('Correo del administrador'), emailRule]"
          data-testid="admin-new-institution-admin-email"
        />

        <VaAlert v-if="errorMessage" color="danger" icon="warning" dense data-testid="admin-new-institution-error">
          {{ errorMessage }}
        </VaAlert>
        <div v-if="errorMessage" class="flex flex-wrap gap-2">
          <VaButton
            preset="secondary"
            color="danger"
            :disabled="isSubmitDisabled"
            data-testid="admin-new-institution-retry"
            @click="handleSubmit"
          >
            Reintentar envío
          </VaButton>
        </div>
        <VaButton
          type="submit"
          :loading="controller.isSaving.value"
          :disabled="isSubmitDisabled"
          data-testid="admin-new-institution-submit"
        >
          Crear institucion
        </VaButton>
      </VaForm>
    </VaCardContent>
  </VaCard>
</template>

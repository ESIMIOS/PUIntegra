<script setup lang="ts">
/**
 * @package web
 * @name AdminInstitutionsPage.vue
 * @version 0.0.2
 * @description Lista instituciones tenant para inspección read-only de backoffice.
 * @author @codex
 * @changelog
 * - 0.0.2	(2026-04-26)	Reemplaza placeholder con listado searchable de instituciones.	@codex
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { SYSTEM_RFC, type Institution } from '@shared';
import StatusBadge from '@/components/shared/StatusBadge.vue';
import { useAdminInstitutionsController } from '@/composables/useDataControllers';
import { routePaths } from '@/shared/constants/routePaths';

const router = useRouter();
const controller = useAdminInstitutionsController();
const institutions = ref<Institution[]>([]);
const searchTerm = ref('');

const normalizedSearchTerm = computed(() => searchTerm.value.trim().toLowerCase());
const tenantInstitutions = computed(() => institutions.value.filter((institution) => institution.RFC !== SYSTEM_RFC));
const filteredInstitutions = computed(() => {
  if (!normalizedSearchTerm.value) {
    return tenantInstitutions.value;
  }

  return tenantInstitutions.value.filter((institution) => {
    const searchableText = [
      institution.RFC,
      institution.name,
      institution.plan,
      institution.planStatus,
    ].join(' ').toLowerCase();
    return searchableText.includes(normalizedSearchTerm.value);
  });
});
const hasInstitutions = computed(() => tenantInstitutions.value.length > 0);
const hasVisibleInstitutions = computed(() => filteredInstitutions.value.length > 0);
const emptyMessage = computed(() =>
  hasInstitutions.value ? 'No hay instituciones que coincidan con la búsqueda.' : 'No hay instituciones registradas.',
);

function formatDate(value: number) {
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeZone: 'UTC' }).format(value);
}

async function loadInstitutions() {
  try {
    institutions.value = await controller.loadInstitutions();
  } catch {
    institutions.value = [];
  }
}

async function goToInstitution(rfc: string) {
  await router.push(routePaths.adminInstitution(rfc));
}

async function goToNewInstitution() {
  await router.push(routePaths.adminNewInstitution);
}

onMounted(() => {
  void loadInstitutions();
});
</script>

<template>
  <section class="grid gap-4">
    <VaCard>
      <VaCardContent>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <VaCardTitle>Instituciones</VaCardTitle>
            <p class="text--secondary mt-1">
              Consulta read-only de instituciones tenant registradas en PUIntegra.
            </p>
          </div>
          <VaButton data-testid="admin-institutions-new" @click="goToNewInstitution">
            Nueva institución
          </VaButton>
        </div>

        <VaAlert
          v-if="controller.errorMessage.value"
          class="mt-4"
          color="danger"
          icon="warning"
          dense
          data-testid="admin-institutions-error"
        >
          {{ controller.errorMessage.value }}
        </VaAlert>

        <div v-if="controller.errorMessage.value" class="flex flex-wrap gap-2 mt-3">
          <VaButton
            preset="secondary"
            color="danger"
            data-testid="admin-institutions-retry"
            @click="loadInstitutions"
          >
            Reintentar carga
          </VaButton>
        </div>

        <VaInput
          v-model="searchTerm"
          class="mt-4"
          label="Buscar institución"
          placeholder="RFC, nombre, plan o estado"
          data-testid="admin-institutions-search"
        />
      </VaCardContent>
    </VaCard>

    <VaCard>
      <VaCardContent>
        <p v-if="controller.isLoading.value" class="text--secondary">Cargando instituciones...</p>

        <p v-else-if="!hasVisibleInstitutions" class="text--secondary">
          {{ emptyMessage }}
        </p>

        <div v-else class="table-responsive">
          <table class="va-table va-table--hoverable w-full">
            <thead>
              <tr>
                <th>RFC</th>
                <th>Nombre</th>
                <th>Plan</th>
                <th>Estado</th>
                <th>Vigencia</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="institution in filteredInstitutions" :key="institution.RFC">
                <td class="bold">{{ institution.RFC }}</td>
                <td>{{ institution.name }}</td>
                <td>{{ institution.plan }}</td>
                <td>
                  <StatusBadge :status="institution.planStatus" />
                </td>
                <td>{{ formatDate(institution.planStartAt) }} - {{ formatDate(institution.planFinishAt) }}</td>
                <td>
                  <VaButton
                    preset="secondary"
                    size="small"
                    :data-testid="`admin-institution-detail-${institution.RFC}`"
                    @click="goToInstitution(institution.RFC)"
                  >
                    Ver detalle
                  </VaButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </VaCardContent>
    </VaCard>
  </section>
</template>

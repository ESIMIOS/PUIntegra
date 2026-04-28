<script setup lang="ts">
/**
 * @package web
 * @name AdminInstitutionContactsPage.vue
 * @version 0.0.2
 * @description Lista contactos tenant de solo lectura para backoffice.
 * @author @codex
 * @changelog
 * - 0.0.2	(2026-04-27)	Reemplaza placeholder por tabla readonly por RFC tenant.	@codex
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Contact } from '@shared';
import { useAdminTenantInspectionController } from '@/composables/useDataControllers';
import { routePaths } from '@/shared/constants/routePaths';

const route = useRoute();
const router = useRouter();
const controller = useAdminTenantInspectionController();
const contacts = ref<Contact[]>([]);

const routeRfc = computed(() => String(route.params.rfc ?? '').toUpperCase());

async function loadContacts() {
  try {
    contacts.value = await controller.loadContactsByRfc(routeRfc.value);
  } catch {
    contacts.value = [];
  }
}

function goBack() {
  router.push(routePaths.adminInstitution(routeRfc.value));
}

onMounted(loadContacts);
</script>

<template>
  <section class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold">Contactos tenant</h1>
        <p class="text--secondary">RFC {{ routeRfc }}</p>
      </div>
      <VaButton preset="secondary" data-testid="admin-contacts-back" @click="goBack">
        Volver a institución
      </VaButton>
    </div>

    <VaAlert
      v-if="controller.errorMessage.value"
      color="danger"
      data-testid="admin-contacts-error"
    >
      {{ controller.errorMessage.value }}
      <template #append>
        <VaButton size="small" preset="secondary" data-testid="admin-contacts-retry" @click="loadContacts">
          Reintentar
        </VaButton>
      </template>
    </VaAlert>

    <VaCard>
      <VaCardContent>
        <p v-if="controller.isLoading.value">Cargando contactos...</p>
        <p v-else-if="contacts.length === 0" class="text--secondary">No hay contactos para este RFC.</p>
        <div v-else class="overflow-x-auto">
          <table class="va-table va-table--hoverable w-full" data-testid="admin-contacts-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>CURP</th>
                <th>RFC contacto</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="contact in contacts" :key="contact.contactId">
                <td>{{ contact.type }}</td>
                <td>{{ contact.name }}</td>
                <td>{{ contact.phone }}</td>
                <td>{{ contact.contactCURP }}</td>
                <td>{{ contact.contactRFC ?? 'Sin RFC' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </VaCardContent>
    </VaCard>
  </section>
</template>

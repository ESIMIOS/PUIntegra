<script setup lang="ts">
/**
 * @package web
 * @name AppAdminSettingsPage.vue
 * @version 0.0.2
 * @description Gestiona el secreto compartido institucional sin exponer su valor en claro.
 * @author @codex
 * @changelog
 * - 0.0.2	(2026-05-04)	Reemplaza placeholder por gestion de secreto compartido con confirmacion critica.	@codex
 * - 0.0.1	(2026-04-10)	Version inicial del archivo.	@tirsomartinezreyes
 */
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { Institution } from '@shared';
import { useAppAdminInstitutionController } from '@/composables/useDataControllers';
import { useAuthStore } from '@/stores/authStore';

const route = useRoute();
const controller = useAppAdminInstitutionController();
const authStore = useAuthStore();
const institution = ref<Institution | null>(null);
const sharedSecret = ref('');
const showEditModal = ref(false);
const showConfirmModal = ref(false);
const routeRfc = computed(() => String(route.params.rfc ?? '').trim().toUpperCase());
const isReadOnly = computed(() => authStore.activeRole !== 'INSTITUTION_ADMIN');

const hasSharedSecretConfigured = computed(() => !!institution.value?.sharedSecret);

function resetSecretForm() {
  sharedSecret.value = '';
}

async function loadInstitution() {
  try {
    institution.value = await controller.loadInstitutionByRfc(routeRfc.value);
  } catch {
    institution.value = null;
  }
}

function requestSave() {
  if (isReadOnly.value) {
    return;
  }
  if (!sharedSecret.value.trim()) {
    return;
  }
  if (hasSharedSecretConfigured.value) {
    showConfirmModal.value = true;
    return;
  }
  void submit();
}

async function submit() {
  try {
    await controller.updateInstitutionSharedSecret(routeRfc.value, {
      sharedSecret: sharedSecret.value,
    });
    resetSecretForm();
    await loadInstitution();
  } finally {
    showConfirmModal.value = false;
    showEditModal.value = false;
  }
}

onMounted(() => {
  void loadInstitution();
});
</script>

<template>
  <section class="grid gap-4">
    <VaCard>
      <VaCardContent>
        <VaCardTitle>Configuración institucional</VaCardTitle>
        <p class="text--secondary mt-1">Secreto compartido para RFC {{ routeRfc }}</p>
        <VaAlert v-if="isReadOnly" class="mt-3" color="info" dense>
          Modo solo lectura para el rol operador institucional.
        </VaAlert>
      </VaCardContent>
    </VaCard>

    <VaAlert v-if="controller.errorMessage.value" color="danger" icon="warning">
      {{ controller.errorMessage.value }}
    </VaAlert>

    <VaCard>
      <VaCardContent class="grid gap-2">
        <p><strong>Secreto configurado:</strong> {{ hasSharedSecretConfigured ? 'Sí' : 'No' }}</p>
        <p><strong>SHA256:</strong> {{ institution?.SHA256SharedSecret ?? 'No disponible' }}</p>
        <p class="text--secondary">El valor del secreto compartido nunca se muestra en texto plano.</p>
        <div class="flex justify-end">
          <VaButton
            data-testid="app-admin-settings-open-modal"
            :disabled="isReadOnly"
            @click="showEditModal = true; resetSecretForm()"
          >
            {{ hasSharedSecretConfigured ? 'Actualizar secreto' : 'Configurar secreto' }}
          </VaButton>
        </div>
      </VaCardContent>
    </VaCard>

    <VaModal v-model="showEditModal" title="Secreto compartido" hide-default-actions max-width="36rem">
      <VaForm class="grid gap-2" immediate @submit.prevent="requestSave">
        <VaInput
          v-model="sharedSecret"
          type="password"
          label="Nuevo secreto compartido"
          :rules="[(v) => !!String(v ?? '').trim() || 'El secreto compartido es obligatorio.']"
        />
        <div class="flex justify-end gap-2">
          <VaButton preset="secondary" @click="showEditModal = false; resetSecretForm()">Cancelar</VaButton>
          <VaButton type="submit" :loading="controller.isSaving.value" :disabled="!sharedSecret.trim()">Guardar</VaButton>
        </div>
      </VaForm>
    </VaModal>

    <VaModal v-model="showConfirmModal" title="Confirmar actualización crítica" hide-default-actions max-width="36rem">
      <p>Vas a reemplazar un secreto ya configurado. Esta acción impacta integraciones activas.</p>
      <div class="mt-3 flex justify-end gap-2">
        <VaButton preset="secondary" @click="showConfirmModal = false">Cancelar</VaButton>
        <VaButton color="danger" :loading="controller.isSaving.value" @click="submit">Confirmar actualización</VaButton>
      </div>
    </VaModal>
  </section>
</template>

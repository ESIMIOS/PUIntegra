<script setup lang="ts">
/**
 * @package web
 * @name AppAdminContactsPage.vue
 * @version 0.0.3
 * @description Gestiona los tres contactos canonicos institucionales en /app/:rfc/admin/contacts.
 * @author @codex
 * @changelog
 * - 0.0.3	(2026-05-05)	Endurece validaciones, corrige flujo de certificado legal y elimina doble acción de carga.	@codex
 * - 0.0.2	(2026-05-04)	Reemplaza placeholder por gestion de contactos por slot canonico.	@codex
 * - 0.0.1	(2026-04-10)	Version inicial del archivo.	@tirsomartinezreyes
 */
import { INSTITUTION_CONTACT_TYPE, type Contact } from '@shared';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useAppAdminInstitutionController } from '@/composables/useDataControllers';
import { useAuthStore } from '@/stores/authStore';

type ContactType = (typeof INSTITUTION_CONTACT_TYPE)[keyof typeof INSTITUTION_CONTACT_TYPE];

const contactSlots: Array<{ type: ContactType; title: string }> = [
  { type: INSTITUTION_CONTACT_TYPE.LEGAL, title: 'Contacto legal' },
  { type: INSTITUTION_CONTACT_TYPE.TECHNICAL, title: 'Contacto técnico' },
  { type: INSTITUTION_CONTACT_TYPE.IMMEDIATE_SEARCH, title: 'Contacto búsqueda inmediata' },
];

const route = useRoute();
const controller = useAppAdminInstitutionController();
const authStore = useAuthStore();
const contacts = ref<Contact[]>([]);
const showModal = ref(false);
const activeType = ref<ContactType>(INSTITUTION_CONTACT_TYPE.LEGAL);
const name = ref('');
const phone = ref('');
const contactCURP = ref('');
const contactRFC = ref('');
const efirmaCertificate = ref('');
const certificateFileName = ref('');
const certificateInputRef = ref<HTMLInputElement | null>(null);
const routeRfc = computed(() => String(route.params.rfc ?? '').trim().toUpperCase());
const isReadOnly = computed(() => authStore.activeRole !== 'INSTITUTION_ADMIN');
const isLegalSlot = computed(() => activeType.value === INSTITUTION_CONTACT_TYPE.LEGAL);

const phoneRegex = /^\+[1-9]\d{9,14}$/;
const rfcRegex = /^[A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{3}$/;
const curpRegex = /^[A-Z][AEIOUX][A-Z]{2}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;
const hasStoredLegalCertificate = computed(
  () => isLegalSlot.value && !certificateFileName.value && efirmaCertificate.value.trim().length > 0,
);
const canSubmit = computed(() => {
  const normalizedPhone = normalizePhone(phone.value);
  const required = name.value.trim() && normalizedPhone && contactCURP.value.trim();
  const validPhone = phoneRegex.test(normalizedPhone);
  const hasLegalCert = !isLegalSlot.value || efirmaCertificate.value.trim().length > 0;
  const validContactRfc = !contactRFC.value.trim() || rfcRegex.test(contactRFC.value.trim().toUpperCase());
  return !!required && validPhone && hasLegalCert && validContactRfc;
});

function byType(type: ContactType) {
  return contacts.value.find((contact) => contact.type === type) ?? null;
}

function openModal(type: ContactType) {
  activeType.value = type;
  const current = byType(type);
  name.value = current?.name ?? '';
  phone.value = current?.phone ?? '';
  contactCURP.value = current?.contactCURP ?? '';
  contactRFC.value = current?.contactRFC ?? '';
  efirmaCertificate.value = current?.efirmaCertificate ?? '';
  certificateFileName.value = '';
  showModal.value = true;
}

function resetForm() {
  name.value = '';
  phone.value = '';
  contactCURP.value = '';
  contactRFC.value = '';
  efirmaCertificate.value = '';
  certificateFileName.value = '';
  if (certificateInputRef.value) {
    certificateInputRef.value.value = '';
  }
}

async function loadContacts() {
  try {
    contacts.value = await controller.loadContactsByRfc(routeRfc.value);
  } catch {
    contacts.value = [];
  }
}

async function submit() {
  if (!canSubmit.value) {
    return;
  }
  await controller.upsertInstitutionContact(routeRfc.value, activeType.value, {
    type: activeType.value,
    name: name.value,
    phone: phone.value,
    contactCURP: contactCURP.value,
    contactRFC: contactRFC.value || null,
    efirmaCertificate: efirmaCertificate.value || null,
  });
  showModal.value = false;
  resetForm();
  await loadContacts();
}

function normalizePhone(value: string) {
  return value.trim().replaceAll(' ', '');
}

async function loadCertificateFile(file: File | null) {
  if (!file) {
    efirmaCertificate.value = '';
    certificateFileName.value = '';
    return;
  }
  const text = await file.text();
  efirmaCertificate.value = text.trim();
  certificateFileName.value = file.name;
}

function onCertificateChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0] ?? null;
  void loadCertificateFile(file);
}

function clearCertificate() {
  efirmaCertificate.value = '';
  certificateFileName.value = '';
  if (certificateInputRef.value) {
    certificateInputRef.value.value = '';
  }
}

function openCertificatePicker() {
  certificateInputRef.value?.click();
}

onMounted(() => {
  void loadContacts();
});
</script>

<template>
  <section class="grid gap-4">
    <VaCard>
      <VaCardContent>
        <VaCardTitle>Contactos institucionales</VaCardTitle>
        <p class="text--secondary mt-1">Gestión por slots canónicos para RFC {{ routeRfc }}</p>
        <VaAlert v-if="isReadOnly" class="mt-3" color="info" dense>
          Modo solo lectura para el rol operador institucional.
        </VaAlert>
      </VaCardContent>
    </VaCard>

    <VaAlert v-if="controller.errorMessage.value" color="danger" icon="warning" data-testid="app-admin-contacts-error">
      {{ controller.errorMessage.value }}
      <template #append>
        <VaButton size="small" preset="secondary" data-testid="app-admin-contacts-retry" @click="loadContacts">
          Reintentar
        </VaButton>
      </template>
    </VaAlert>

    <div class="grid gap-3">
      <VaCard v-for="slot in contactSlots" :key="slot.type" :data-testid="`app-admin-contact-slot-${slot.type}`">
        <VaCardContent class="grid gap-2">
          <div class="flex items-center justify-between gap-2">
            <h3 class="text-lg font-semibold">{{ slot.title }}</h3>
            <VaButton size="small" :disabled="isReadOnly" @click="openModal(slot.type)">
              {{ byType(slot.type) ? 'Editar' : 'Agregar' }}
            </VaButton>
          </div>
          <template v-if="byType(slot.type)">
            <p><strong>Nombre:</strong> {{ byType(slot.type)?.name }}</p>
            <p><strong>Teléfono:</strong> {{ byType(slot.type)?.phone }}</p>
            <p><strong>CURP:</strong> {{ byType(slot.type)?.contactCURP }}</p>
            <p><strong>RFC:</strong> {{ byType(slot.type)?.contactRFC ?? 'Sin RFC' }}</p>
          </template>
          <VaAlert v-else color="warning" dense>
            Información no proporcionada para este slot.
          </VaAlert>
        </VaCardContent>
      </VaCard>
    </div>

    <VaModal v-model="showModal" :title="`Contacto ${activeType}`" hide-default-actions max-width="40rem">
      <VaForm class="grid gap-2" immediate @submit.prevent="submit">
        <VaInput v-model="name" label="Nombre" :rules="[(v) => !!String(v ?? '').trim() || 'El nombre es obligatorio.']" />
        <VaInput
          v-model="phone"
          label="Teléfono"
          :rules="[
            (v) => !!normalizePhone(String(v ?? '')) || 'El teléfono es obligatorio.',
            (v) => phoneRegex.test(normalizePhone(String(v ?? ''))) || 'Formato inválido. Usa prefijo internacional, por ejemplo +525533748806.',
          ]"
        />
        <VaInput
          v-model="contactCURP"
          label="CURP"
          :rules="[
            (v) => !!String(v ?? '').trim() || 'La CURP es obligatoria.',
            (v) => curpRegex.test(String(v ?? '').trim().toUpperCase()) || 'Formato CURP inválido.',
          ]"
        />
        <VaInput
          v-model="contactRFC"
          label="RFC del contacto (opcional)"
          :rules="[(v) => !String(v ?? '').trim() || rfcRegex.test(String(v).trim().toUpperCase()) || 'Formato RFC inválido.']"
        />
        <div v-if="isLegalSlot" class="grid gap-2">
          <p class="text--secondary text-sm">
            El contacto legal debe incluir certificado .cer (DER o PEM).
          </p>
          <p v-if="hasStoredLegalCertificate" class="text--secondary text-sm">
            Ya hay un certificado legal cargado.
          </p>
          <input
            ref="certificateInputRef"
            type="file"
            accept=".cer,.pem"
            style="display: none;"
            data-testid="app-admin-contact-certificate-file"
            @change="onCertificateChange"
          >
          <VaButton v-if="!certificateFileName && !hasStoredLegalCertificate" preset="secondary" size="small" @click="openCertificatePicker">
            {{ hasStoredLegalCertificate ? 'Reemplazar certificado' : 'Seleccionar archivo' }}
          </VaButton>
          <p v-if="certificateFileName" class="text--secondary text-xs">Archivo cargado: {{ certificateFileName }}</p>
          <VaButton
            v-if="certificateFileName || hasStoredLegalCertificate"
            size="small"
            preset="secondary"
            @click="clearCertificate"
          >
            Quitar certificado seleccionado
          </VaButton>
        </div>
        <div class="flex justify-end gap-2">
          <VaButton preset="secondary" @click="showModal = false; resetForm()">Cancelar</VaButton>
          <VaButton type="submit" :loading="controller.isSaving.value" :disabled="!canSubmit">Guardar</VaButton>
        </div>
      </VaForm>
    </VaModal>
  </section>
</template>

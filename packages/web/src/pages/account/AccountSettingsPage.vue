<script setup lang="ts">
/**
 * @package web
 * @name AccountSettingsPage.vue
 * @version 0.0.2
 * @description Permite editar identidad de cuenta autenticada y sincronizar perfil de sesión visible.
 * @author @codex
 * @changelog
 * - 0.0.2	(2026-05-01)	Reemplaza placeholder por formulario de edición de nombre, emoji y teléfono.	@codex
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */
import { formatUiErrorString, SystemError, sharedSystemMessages } from '@shared';
import { computed, onMounted, ref } from 'vue';
import { useAccountSettingsController } from '@/composables/useDataControllers';
import { useAuthStore } from '@/stores/authStore';

const EMOJI_OPTIONS = [
  '😀',
  '😁',
  '😂',
  '🤣',
  '😃',
  '😄',
  '😅',
  '😆',
  '😉',
  '😊',
  '😇',
  '🙂',
  '🙃',
  '😍',
  '😘',
  '😋',
  '😎',
  '🤓',
  '🧐',
  '🤠',
  '🥳',
  '🤩',
  '😏',
  '😌',
  '😺',
  '😸',
  '😹',
  '😻',
  '😼',
  '🙈',
  '🙉',
  '🙊',
  '🐵',
  '🐒',
  '🦍',
  '🦧',
  '👻',
  '🤖',
  '🧠',
  '🚀',
] as const;
const DEFAULT_PHONE_PREFIX = '+52';

const authStore = useAuthStore();
const controller = useAccountSettingsController();
const formRef = ref<{ validate: () => boolean | Promise<boolean> } | null>(null);

const name = ref('');
const emojiIcon = ref<string>(EMOJI_OPTIONS[0]);
const phone = ref(DEFAULT_PHONE_PREFIX);
const showEmojiModal = ref(false);
const showCancelConfirmModal = ref(false);
const successMessage = ref<string | null>(null);
const localError = ref<string | null>(null);
const initialFormState = ref({
  name: '',
  emojiIcon: EMOJI_OPTIONS[0] as string,
  phone: DEFAULT_PHONE_PREFIX,
});

const errorMessage = computed(() => localError.value ?? controller.errorMessage.value);
const canSubmit = computed(() => !controller.isSaving.value && !controller.isLoading.value);
const displayEmail = computed(() => authStore.email ?? 'Sin correo');
const normalizedCurrentPhone = computed(() => normalizePhone(phone.value));
const hasChanges = computed(
  () =>
    name.value.trim() !== initialFormState.value.name.trim() ||
    emojiIcon.value !== initialFormState.value.emojiIcon ||
    normalizedCurrentPhone.value !== normalizePhone(initialFormState.value.phone),
);

function normalizePhone(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }
  return trimmed.replaceAll(/\s+/g, '').replaceAll('-', '').replaceAll('(', '').replaceAll(')', '');
}

function validatePhoneRule(value: string) {
  const normalized = normalizePhone(value);
  if (!normalized) {
    return true;
  }
  if (normalized === DEFAULT_PHONE_PREFIX) {
    return 'Completa el número telefónico o limpia el campo.';
  }
  if (!normalized.startsWith('+') || !/^\+\d{8,15}$/.test(normalized)) {
    return 'El teléfono debe incluir prefijo internacional válido.';
  }
  return true;
}

const requiredNameRule = (value: string) => value.trim().length > 0 || 'El nombre es requerido.';

async function loadProfile() {
  localError.value = null;
  successMessage.value = null;
  controller.retry();
  if (!authStore.uid) {
    return;
  }
  try {
    const profile = await controller.loadUserById(authStore.uid);
    name.value = profile.name;
    emojiIcon.value = profile.emojiIcon ?? EMOJI_OPTIONS[0];
    phone.value = profile.phone ?? DEFAULT_PHONE_PREFIX;
    initialFormState.value = {
      name: name.value,
      emojiIcon: emojiIcon.value,
      phone: phone.value,
    };
  } catch {
    // DataStore exposes normalized error state.
  }
}

function selectEmoji(nextEmoji: string) {
  emojiIcon.value = nextEmoji;
  showEmojiModal.value = false;
}

async function saveProfile() {
  localError.value = null;
  successMessage.value = null;
  controller.retry();
  const isValid = Boolean(await formRef.value?.validate());
  if (!isValid) {
    localError.value = formatUiErrorString(sharedSystemMessages.data.operation.validationFailed);
    return;
  }
  const normalizedPhone = normalizePhone(phone.value);
  if (validatePhoneRule(normalizedPhone) !== true) {
    localError.value = formatUiErrorString(
      new SystemError(sharedSystemMessages.data.operation.validationFailed.code, {
        displayMessage: 'El formato del teléfono no es válido.',
      }),
    );
    return;
  }

  try {
    const updated = await controller.updateAccountProfile({
      name: name.value.trim(),
      emojiIcon: emojiIcon.value.trim(),
      phone: normalizedPhone || null,
    });
    authStore.setIdentity({
      uid: updated.userId,
      email: updated.email,
      name: updated.name,
      emojiIcon: updated.emojiIcon,
    });
    phone.value = updated.phone ?? DEFAULT_PHONE_PREFIX;
    initialFormState.value = {
      name: updated.name,
      emojiIcon: updated.emojiIcon ?? emojiIcon.value,
      phone: phone.value,
    };
    successMessage.value = 'Configuración de cuenta guardada.';
  } catch {
    // DataStore exposes normalized error state.
  }
}

function cancelChanges() {
  name.value = initialFormState.value.name;
  emojiIcon.value = initialFormState.value.emojiIcon;
  phone.value = initialFormState.value.phone;
  showCancelConfirmModal.value = false;
  localError.value = null;
  successMessage.value = null;
}

onMounted(() => {
  void loadProfile();
});
</script>

<template>
  <div class="account-settings-page">
    <section class="grid gap-4">
      <VaCard>
        <VaCardContent>
          <VaCardTitle>Configuración de cuenta</VaCardTitle>
          <p class="text--secondary mt-1">Edita cómo se muestra tu identidad en PUIntegra.</p>
        </VaCardContent>
      </VaCard>

      <VaAlert v-if="errorMessage" color="danger" icon="warning" dense data-testid="account-settings-error">
        {{ errorMessage }}
      </VaAlert>
      <VaAlert v-if="successMessage" color="success" icon="check" dense data-testid="account-settings-success">
        {{ successMessage }}
      </VaAlert>

      <VaCard>
        <VaCardContent>
          <VaForm
            ref="formRef"
            class="grid gap-3"
            immediate
            data-testid="account-settings-form"
            @submit.prevent="saveProfile"
          >
            <VaInput
              :model-value="displayEmail"
              readonly
              label="Correo de cuenta (solo lectura)"
              class="account-settings__email-readonly bg-border p2"
              data-testid="account-settings-email"
            />
            <div class="account-settings__emoji-preview">
              <span class="account-settings__emoji">{{ emojiIcon }}</span>
              <VaButton
                preset="secondary"
                size="small"
                data-testid="account-settings-open-emoji"
                @click="showEmojiModal = true"
              >
                Cambiar emoji
              </VaButton>
            </div>

            <VaInput v-model="name" label="Nombre" :rules="[requiredNameRule]" data-testid="account-settings-name" />
            <VaInput
              v-model="phone"
              label="Teléfono"
              :rules="[validatePhoneRule]"
              data-testid="account-settings-phone"
            />
            <p class="text--secondary text-sm">Usa prefijo internacional. El campo inicia con +52 para México.</p>
            <div v-if="hasChanges" class="flex gap-2">
              <VaButton
                type="submit"
                :loading="controller.isSaving.value"
                :disabled="!canSubmit"
                data-testid="account-settings-submit"
              >
                Guardar cambios
              </VaButton>
              <VaButton
                color="danger"
                preset="secondary"
                :disabled="controller.isSaving.value"
                data-testid="account-settings-cancel"
                @click="showCancelConfirmModal = true"
              >
                Cancelar
              </VaButton>
            </div>
          </VaForm>
        </VaCardContent>
      </VaCard>
    </section>

    <VaModal v-model="showEmojiModal" title="Selecciona tu emoji" hide-default-actions max-width="32rem">
      <div class="account-settings__emoji-grid">
        <button
          v-for="option in EMOJI_OPTIONS"
          :key="option"
          class="account-settings__emoji-option"
          type="button"
          :data-testid="`account-settings-emoji-${option}`"
          @click="selectEmoji(option)"
        >
          {{ option }}
        </button>
      </div>
      <template #footer>
        <div class="flex justify-end">
          <VaButton preset="secondary" @click="showEmojiModal = false">Cerrar</VaButton>
        </div>
      </template>
    </VaModal>

    <VaModal
      v-model="showCancelConfirmModal"
      title="Descartar cambios"
      color="danger"
      hide-default-actions
      max-width="28rem"
    >
      <p>Si continúas, se perderán los cambios no guardados.</p>
      <template #footer>
        <div class="flex justify-end gap-2">
          <VaButton preset="secondary" @click="showCancelConfirmModal = false">Seguir editando</VaButton>
          <VaButton color="danger" @click="cancelChanges">Sí, descartar</VaButton>
        </div>
      </template>
    </VaModal>
  </div>
</template>

<style scoped>
.account-settings-page {
  display: block;
}

.account-settings__emoji-preview {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.account-settings__emoji {
  font-size: 2.2rem;
  line-height: 1;
}

.account-settings__emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 0.6rem;
}

.account-settings__emoji-option {
  font-size: 1.7rem;
  padding: 0.45rem;
  border: 1px solid var(--va-background-border);
  border-radius: 8px;
  background: var(--va-background-primary);
  cursor: pointer;
}

.account-settings__email-readonly {
  opacity: 0.9;
}
</style>

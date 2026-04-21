<script setup lang="ts">
/**
 * @package web
 * @name SessionContextModal.vue
 * @version 0.0.1
 * @description Modal reutilizable para selección de contexto de sesión (rol + RFC).
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-04-19)	Versión inicial con validación y confirmación centralizadas.	@codex
 */

import { computed, ref, watch } from 'vue';
import { RoleSchema } from '@shared';
import { z } from 'zod';

type SessionContext = {
  role: z.infer<typeof RoleSchema>;
  rfc: string;
};

const props = withDefaults(defineProps<{
  modelValue: boolean;
  contexts: SessionContext[];
  loading?: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  allowCancel?: boolean;
  initialContext?: SessionContext | null;
  noOutsideDismiss?: boolean;
  noEscDismiss?: boolean;
  selectTestId?: string | null;
}>(), {
  loading: false,
  title: 'Seleccionar contexto',
  description: 'Selecciona el contexto con el que deseas continuar.',
  confirmText: 'Aplicar contexto',
  cancelText: 'Cancelar',
  allowCancel: true,
  initialContext: null,
  noOutsideDismiss: false,
  noEscDismiss: false,
  selectTestId: null
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [value: SessionContext];
  cancel: [];
}>();

const selectedContextValue = ref<string | null>(null);
const contextOptions = computed(() =>
  props.contexts.map((context) => ({
    text: `${context.role} · ${context.rfc}`,
    value: `${context.role}::${context.rfc}`
  }))
);

function parseSelectedContext(value: string | null): SessionContext | null {
  if (!value) {
    return null;
  }
  const [role, rfc] = value.split('::');
  const parsedRole = RoleSchema.safeParse(role);
  if (!parsedRole.success || !rfc) {
    return null;
  }
  return {
    role: parsedRole.data,
    rfc
  };
}

function toContextValue(context: SessionContext | null): string | null {
  if (!context) {
    return null;
  }
  return `${context.role}::${context.rfc}`;
}

function syncSelection() {
  const preferredValue = toContextValue(props.initialContext);
  if (preferredValue && props.contexts.some((context) => `${context.role}::${context.rfc}` === preferredValue)) {
    selectedContextValue.value = preferredValue;
    return;
  }
  selectedContextValue.value = props.contexts.length === 1
    ? `${props.contexts[0].role}::${props.contexts[0].rfc}`
    : null;
}

function handleConfirm() {
  const parsed = parseSelectedContext(selectedContextValue.value);
  if (!parsed) {
    return;
  }
  emit('confirm', parsed);
}

function handleCancel() {
  emit('cancel');
  emit('update:modelValue', false);
}

watch(
  () => [props.modelValue, props.contexts, props.initialContext] as const,
  ([isOpen]) => {
    if (!isOpen) {
      return;
    }
    syncSelection();
  },
  { immediate: true }
);
</script>

<template>
  <VaModal
    :model-value="modelValue"
    :title="title"
    hide-default-actions
    :no-outside-dismiss="noOutsideDismiss"
    :no-esc-dismiss="noEscDismiss"
    max-width="28rem"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="mb3">{{ description }}</div>
    <VaSelect
      v-model="selectedContextValue"
      :options="contextOptions"
      text-by="text"
      value-by="value"
      track-by="value"
      label=""
      :data-testid="selectTestId ?? undefined"
    />
    <template #footer>
      <div class="session-context-modal__actions">
        <VaButton v-if="allowCancel" preset="primary" color="danger" @click="handleCancel">
          {{ cancelText }}
        </VaButton>
        <VaButton :disabled="!selectedContextValue" :loading="loading" @click="handleConfirm">
          {{ confirmText }}
        </VaButton>
      </div>
    </template>
  </VaModal>
</template>

<style scoped>
.session-context-modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
}
</style>

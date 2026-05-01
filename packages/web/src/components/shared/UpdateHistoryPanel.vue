<script setup lang="ts">
/**
 * @package web
 * @name UpdateHistoryPanel.vue
 * @version 0.0.1
 * @description Renderiza historial de cambios en formato timeline o tabla, inline o modal.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-05-01)	Version inicial del archivo.	@codex
 */
import { computed, ref } from 'vue';
import type { UpdateOrigin } from '@shared';
import {
  buildUpdateHistoryEvents,
  formatAbsoluteTimeEsMx,
  formatHistoryValue,
  formatRelativeTimeEsMx,
  type UpdateHistoryFieldDefinition,
} from '@/shared/updateHistory/updateHistoryUtils';

type UpdateHistoryMode = 'inline' | 'icon';
type UpdateHistoryView = 'timeline' | 'table';

const props = withDefaults(
  defineProps<{
    updates: Record<string, unknown>[];
    fieldDefinitions: UpdateHistoryFieldDefinition[];
    mode?: UpdateHistoryMode;
    defaultView?: UpdateHistoryView;
    title?: string;
    emptyText?: string;
    iconAriaLabel?: string;
    testId?: string;
  }>(),
  {
    mode: 'inline',
    defaultView: 'timeline',
    title: 'Historial de actualizaciones',
    emptyText: 'No hay cambios registrados.',
    iconAriaLabel: 'Ver historial de actualizaciones',
    testId: undefined,
  },
);

const isOpen = ref(false);
const activeView = ref<UpdateHistoryView>(props.defaultView);

const events = computed(() => buildUpdateHistoryEvents(props.updates, props.fieldDefinitions));

function openModal() {
  isOpen.value = true;
}

function updateOriginLabel(value: UpdateOrigin) {
  if (value === 'USER') {
    return 'Usuario';
  }
  if (value === 'PUI') {
    return 'PUI';
  }
  return 'Sistema';
}

const hasEvents = computed(() => events.value.length > 0);
</script>

<template>
  <div v-if="props.mode === 'icon'" :data-testid="props.testId">
    <VaButton
      preset="secondary"
      size="small"
      :aria-label="props.iconAriaLabel"
      data-testid="update-history-icon-trigger"
      @click="openModal"
    >
      <VaIcon name="history" />
    </VaButton>
    <VaModal v-model="isOpen" hide-default-actions :title="props.title" max-width="56rem">
      <div class="update-history__body" data-testid="update-history-modal">
        <div class="update-history__view-switch">
          <VaButton
            size="small"
            preset="secondary"
            data-testid="update-history-view-timeline"
            @click="activeView = 'timeline'"
          >
            Timeline
          </VaButton>
          <VaButton
            size="small"
            preset="secondary"
            data-testid="update-history-view-table"
            @click="activeView = 'table'"
          >
            Tabla
          </VaButton>
        </div>

        <p v-if="!hasEvents" class="text--secondary" data-testid="update-history-empty">{{ props.emptyText }}</p>

        <div v-else-if="activeView === 'timeline'" class="update-history__timeline" data-testid="update-history-timeline">
          <article v-for="(event, index) in events" :key="`${event.metadata.updatedAt}-${index}`" class="update-history__event">
            <header class="update-history__event-header">
              <p class="bold">{{ formatRelativeTimeEsMx(event.metadata.updatedAt) }}</p>
              <p class="text--secondary">{{ formatAbsoluteTimeEsMx(event.metadata.updatedAt) }}</p>
            </header>
            <p class="text--secondary">
              {{ updateOriginLabel(event.metadata.updateOrigin) }}
              <span v-if="event.metadata.updatedByUserEmail"> · {{ event.metadata.updatedByUserEmail }}</span>
            </p>
            <ul>
              <li v-for="change in event.changes" :key="change.key">
                <span class="bold">{{ change.label }}</span>:
                {{ formatHistoryValue(change.previousValue) }}
                →
                {{ formatHistoryValue(change.updatedValue) }}
              </li>
            </ul>
          </article>
        </div>

        <div v-else class="table-responsive">
          <table class="va-table va-table--hoverable w-full" data-testid="update-history-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Origen</th>
                <th>Usuario</th>
                <th>Campo</th>
                <th>Anterior</th>
                <th>Actual</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(event, eventIndex) in events" :key="`${event.metadata.updatedAt}-${eventIndex}`">
                <tr v-for="change in event.changes" :key="`${event.metadata.updatedAt}-${change.key}`">
                  <td>{{ formatAbsoluteTimeEsMx(event.metadata.updatedAt) }}</td>
                  <td>{{ updateOriginLabel(event.metadata.updateOrigin) }}</td>
                  <td>{{ event.metadata.updatedByUserEmail ?? event.metadata.updatedByUserId ?? 'N/A' }}</td>
                  <td>{{ change.label }}</td>
                  <td>{{ formatHistoryValue(change.previousValue) }}</td>
                  <td>{{ formatHistoryValue(change.updatedValue) }}</td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </VaModal>
  </div>

  <div v-else :data-testid="props.testId || 'update-history-inline'">
    <div class="update-history__view-switch">
      <VaButton
        size="small"
        preset="secondary"
        data-testid="update-history-view-timeline"
        @click="activeView = 'timeline'"
      >
        Timeline
      </VaButton>
      <VaButton
        size="small"
        preset="secondary"
        data-testid="update-history-view-table"
        @click="activeView = 'table'"
      >
        Tabla
      </VaButton>
    </div>

    <p v-if="!hasEvents" class="text--secondary" data-testid="update-history-empty">{{ props.emptyText }}</p>

    <div v-else-if="activeView === 'timeline'" class="update-history__timeline" data-testid="update-history-timeline">
      <article v-for="(event, index) in events" :key="`${event.metadata.updatedAt}-${index}`" class="update-history__event">
        <header class="update-history__event-header">
          <p class="bold">{{ formatRelativeTimeEsMx(event.metadata.updatedAt) }}</p>
          <p class="text--secondary">{{ formatAbsoluteTimeEsMx(event.metadata.updatedAt) }}</p>
        </header>
        <p class="text--secondary">
          {{ updateOriginLabel(event.metadata.updateOrigin) }}
          <span v-if="event.metadata.updatedByUserEmail"> · {{ event.metadata.updatedByUserEmail }}</span>
        </p>
        <ul>
          <li v-for="change in event.changes" :key="change.key">
            <span class="bold">{{ change.label }}</span>:
            {{ formatHistoryValue(change.previousValue) }}
            →
            {{ formatHistoryValue(change.updatedValue) }}
          </li>
        </ul>
      </article>
    </div>

    <div v-else class="table-responsive">
      <table class="va-table va-table--hoverable w-full" data-testid="update-history-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Origen</th>
            <th>Usuario</th>
            <th>Campo</th>
            <th>Anterior</th>
            <th>Actual</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(event, eventIndex) in events" :key="`${event.metadata.updatedAt}-${eventIndex}`">
            <tr v-for="change in event.changes" :key="`${event.metadata.updatedAt}-${change.key}`">
              <td>{{ formatAbsoluteTimeEsMx(event.metadata.updatedAt) }}</td>
              <td>{{ updateOriginLabel(event.metadata.updateOrigin) }}</td>
              <td>{{ event.metadata.updatedByUserEmail ?? event.metadata.updatedByUserId ?? 'N/A' }}</td>
              <td>{{ change.label }}</td>
              <td>{{ formatHistoryValue(change.previousValue) }}</td>
              <td>{{ formatHistoryValue(change.updatedValue) }}</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.update-history__body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.update-history__view-switch {
  display: flex;
  gap: 0.5rem;
}

.update-history__timeline {
  display: grid;
  gap: 0.75rem;
}

.update-history__event {
  border: 1px solid var(--va-background-border);
  border-radius: 8px;
  padding: 0.75rem;
}

.update-history__event-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}
</style>

<script setup lang="ts">
/**
 * @package web
 * @name LogsExplorer.vue
 * @version 0.0.1
 * @description Tabla densa y filtros compartidos para inspección de logs por dominio.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-04-27)	Implementa explorador readonly de logs admin, tenant y cuenta.	@codex
 */
import { computed, onMounted, ref, watch } from 'vue';
import { DEFAULT_RFC, type Institution, type Log, type LogCategory, type LogOrigin } from '@shared';
import { useLogsController } from '@/bom';
import { getLogDatePresetOptions, resolveLogDateRange, type LogDatePreset } from '@/shared/logInspection/logDateRanges';
import {
  LOG_PAGE_SIZE_OPTIONS,
  buildLogCsv,
  getAvailableLogColumns,
  getLogCategoryFamily,
  getLogCategoryOptions,
  getLogOriginOptions,
  readVisibleLogColumns,
  requiredLogColumnKeys,
  writeVisibleLogColumns,
  type LogColumnKey,
  type LogPageSize,
  type LogScope,
} from '@/shared/logInspection/logTable';
import type { ListLogsFilters } from '@/gateways/firebaseDataGateway';

const props = defineProps<{
  scope: LogScope;
  title: string;
  description: string;
  fixedRfc?: string | null;
  userId?: string | null;
}>();

type TenantOption = {
  value: string | null | undefined;
  text: string;
};

const controller = useLogsController();
const logs = ref<Log[]>([]);
const selectedColumns = ref<LogColumnKey[]>(readVisibleLogColumns(props.scope));
const selectedCategory = ref<LogCategory | null>(null);
const selectedOrigin = ref<LogOrigin | null>(null);
const selectedTenant = ref<string | null | undefined>(props.scope === 'admin' ? undefined : props.fixedRfc);
const selectedPreset = ref<LogDatePreset>('all');
const selectedOrder = ref<'asc' | 'desc'>('desc');
const selectedPageSize = ref<LogPageSize>(20);
const customStartDate = ref('');
const customEndDate = ref('');
const customRangeError = ref<string | null>(null);
const exportWarning = ref<string | null>(null);
const hasMore = ref(false);
const isLoadingMore = ref(false);
const isExporting = ref(false);
const showSettings = ref(false);
const tenantOptions = ref<TenantOption[]>([{ value: undefined, text: 'Todos los alcances' }]);

const availableColumns = computed(() => getAvailableLogColumns(props.scope));
const visibleColumns = computed(() => {
  const visible = new Set(selectedColumns.value);
  return availableColumns.value.filter((column) => visible.has(column.key));
});
const categoryOptions = computed(() => [
  { value: null, text: 'Todas' },
  ...getLogCategoryOptions(props.scope).map((category) => ({ value: category, text: category })),
]);
const originOptions = [
  { value: null, text: 'Todos' },
  ...getLogOriginOptions().map((origin) => ({ value: origin, text: origin })),
];
const pageSizeOptions = [...LOG_PAGE_SIZE_OPTIONS];
const datePresetOptions = getLogDatePresetOptions();
const showCustomDates = computed(() => selectedPreset.value === 'custom');
const hasVisibleRows = computed(() => logs.value.length > 0);

function formatCell(value: string | number | null | undefined) {
  return value == null || value === '' ? '—' : value;
}

function pageSizeLimit() {
  return selectedPageSize.value === 'All' ? 100 : selectedPageSize.value;
}

function buildFilters(cursor?: ListLogsFilters['cursor'], overridePageSize?: number): ListLogsFilters | null {
  customRangeError.value = null;
  const dateRange = resolveLogDateRange(selectedPreset.value, new Date(), {
    startDate: customStartDate.value,
    endDate: customEndDate.value,
  });
  if (selectedPreset.value === 'custom' && (!customStartDate.value || !customEndDate.value)) {
    logs.value = [];
    hasMore.value = false;
    return null;
  }
  if (selectedPreset.value === 'custom' && dateRange && dateRange.endAt < dateRange.startAt) {
    customRangeError.value = 'La fecha final debe ser mayor o igual a la fecha inicial.';
    throw new RangeError(customRangeError.value);
  }
  const filters: ListLogsFilters = {
    order: selectedOrder.value,
    pageSize: overridePageSize ?? pageSizeLimit(),
  };
  if (dateRange) {
    filters.createdAtStart = dateRange.startAt;
    filters.createdAtEnd = dateRange.endAt;
  }

  if (props.scope === 'app') {
    filters.RFC = props.fixedRfc;
  } else if (props.scope === 'account') {
    filters.RFC = null;
    filters.userId = props.userId ?? undefined;
  } else if (selectedTenant.value !== undefined) {
    filters.RFC = selectedTenant.value;
  }

  if (selectedCategory.value) {
    filters.category = selectedCategory.value;
  }
  if (selectedOrigin.value) {
    filters.origin = selectedOrigin.value;
  }
  if (cursor) {
    filters.cursor = cursor;
  }
  return filters;
}

function lastCursor() {
  const lastLog = logs.value.at(-1);
  if (!lastLog) {
    return undefined;
  }
  return {
    createdAt: lastLog.createdAt,
    id: lastLog.id,
  };
}

async function loadLogs() {
  try {
    const filters = buildFilters();
    if (!filters) {
      return;
    }
    const result = await controller.load(filters);
    logs.value = result;
    hasMore.value = result.length === pageSizeLimit();
  } catch {
    if (customRangeError.value) {
      return;
    }
    logs.value = [];
    hasMore.value = false;
  }
}

async function loadMore() {
  if (!hasMore.value || isLoadingMore.value) {
    return;
  }
  const cursor = lastCursor();
  if (cursor == null) {
    return;
  }
  isLoadingMore.value = true;
  try {
    const filters = buildFilters(cursor);
    if (!filters) {
      return;
    }
    const result = await controller.load(filters);
    logs.value = [...logs.value, ...result];
    hasMore.value = result.length === pageSizeLimit();
  } catch {
    hasMore.value = false;
  } finally {
    isLoadingMore.value = false;
  }
}

function toggleColumn(column: LogColumnKey, isChecked: boolean) {
  if (requiredLogColumnKeys.includes(column)) {
    return;
  }
  const nextColumns = isChecked
    ? [...selectedColumns.value, column]
    : selectedColumns.value.filter((selectedColumn) => selectedColumn !== column);
  selectedColumns.value = [
    ...requiredLogColumnKeys,
    ...nextColumns.filter((selectedColumn) => !requiredLogColumnKeys.includes(selectedColumn)),
  ];
}

function handleScroll(event: Event) {
  if (selectedPageSize.value !== 'All') {
    return;
  }
  const target = event.currentTarget as HTMLElement;
  if (target.scrollTop + target.clientHeight >= target.scrollHeight - 24) {
    void loadMore();
  }
}

async function exportCsv() {
  isExporting.value = true;
  try {
    const filters = buildFilters(undefined, 1001);
    if (!filters) {
      return;
    }
    const exportLogs = await controller.load(filters);
    const result = buildLogCsv(exportLogs);
    const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `puintegra-${props.scope}-logs.csv`;
    link.click();
    URL.revokeObjectURL(url);
    exportWarning.value = result.truncated
      ? `Se exportaron los primeros ${result.exportedCount} registros por el límite de CSV.`
      : null;
  } catch {
    if (!customRangeError.value) {
      exportWarning.value = 'No fue posible exportar los logs con los filtros actuales.';
    }
  } finally {
    isExporting.value = false;
  }
}

function sortedTenantOptions(institutions: Institution[]) {
  const byRfc = new Map<string, Institution>();
  institutions.forEach((institution) => byRfc.set(institution.RFC, institution));
  const options = [...byRfc.values()]
    .sort((left, right) => left.name.localeCompare(right.name) || left.RFC.localeCompare(right.RFC))
    .map((institution) => ({
      value: institution.RFC,
      text: `${institution.name} (${institution.RFC})`,
    }));
  if (!byRfc.has(DEFAULT_RFC)) {
    options.unshift({ value: DEFAULT_RFC, text: `Institución por defecto (${DEFAULT_RFC})` });
  }
  return [
    { value: undefined, text: 'Todos los alcances' },
    { value: null, text: 'Cuenta / sin RFC (GLOBAL)' },
    ...options,
  ];
}

async function loadAdminTenantOptions() {
  if (props.scope !== 'admin') {
    return;
  }
  try {
    tenantOptions.value = sortedTenantOptions(await controller.loadInstitutions());
  } catch {
    tenantOptions.value = [{ value: undefined, text: 'Todos los alcances' }];
  }
}

watch(selectedColumns, (columns) => writeVisibleLogColumns(props.scope, columns), { deep: true });
watch(
  [
    selectedCategory,
    selectedOrigin,
    selectedTenant,
    selectedPreset,
    selectedOrder,
    selectedPageSize,
    customStartDate,
    customEndDate,
  ],
  () => {
    void loadLogs();
  },
);

onMounted(async () => {
  await loadAdminTenantOptions();
  await loadLogs();
});
</script>

<template>
  <section class="logs-explorer space-y-4 pt-2">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold">{{ title }}</h1>
        <p class="text--secondary pt-2">{{ description }}</p>
      </div>
      <VaButton preset="secondary" :loading="isExporting" data-testid="logs-export-csv" @click="exportCsv">
        Exportar CSV
      </VaButton>
      <VaButton round icon="settings" data-testid="logs-settings" @click="showSettings = !showSettings" />
    </div>

    <VaAlert v-if="controller.errorMessage.value" color="danger" dense data-testid="logs-error">
      {{ controller.errorMessage.value }}
      <template #append>
        <VaButton size="small" preset="secondary" data-testid="logs-retry" @click="loadLogs">Reintentar</VaButton>
      </template>
    </VaAlert>
    <VaAlert v-if="exportWarning" color="warning" dense data-testid="logs-export-warning">
      {{ exportWarning }}
    </VaAlert>
    <VaAlert v-if="customRangeError" color="danger" dense data-testid="logs-custom-range-error">
      {{ customRangeError }}
    </VaAlert>

    <VaDivider />
    <div class="logs-toolbar mt-3">
      <VaSelect
        v-if="scope === 'admin'"
        v-model="selectedTenant"
        :options="tenantOptions"
        text-by="text"
        value-by="value"
        label="Tenant"
        class="fs-xs bold"
        content-class="fs-xs"
        data-testid="logs-tenant-filter"
      />
      <VaSelect
        v-model="selectedCategory"
        :options="categoryOptions"
        text-by="text"
        value-by="value"
        label="Categoría"
        data-testid="logs-category-filter"
        class="fs-xs bold"
        content-class="fs-xs"
      />
      <VaSelect
        v-model="selectedOrigin"
        :options="originOptions"
        text-by="text"
        value-by="value"
        label="Origen"
        data-testid="logs-origin-filter"
        class="fs-xs bold"
        content-class="fs-xs"
      />
      <VaSelect
        v-model="selectedPreset"
        :options="datePresetOptions"
        text-by="text"
        value-by="value"
        label="Rango de tiempo"
        class="fs-xs bold"
        content-class="fs-xs"
        data-testid="logs-date-preset"
      />
      <VaInput
        v-if="showCustomDates"
        v-model="customStartDate"
        type="date"
        label="Inicio"
        class="fs-xs bold"
        content-class="fs-xs"
        data-testid="logs-start-date"
      />
      <VaInput
        v-if="showCustomDates"
        v-model="customEndDate"
        type="date"
        label="Fin"
        data-testid="logs-end-date"
        class="fs-xs bold"
        content-class="fs-xs"
      />
    </div>
    <VaDivider />

    <div
      class="logs-table-shell mt-2"
      :class="{ 'logs-table-shell--all': selectedPageSize === 'All' }"
      @scroll="handleScroll"
    >
      <p v-if="controller.isLoading.value && !hasVisibleRows" class="logs-status">Cargando logs...</p>
      <p v-else-if="!hasVisibleRows" class="logs-status text--secondary">No hay logs para los filtros seleccionados.</p>
      <table v-else class="va-table va-table--hoverable logs-table" data-testid="logs-table">
        <thead>
          <tr>
            <th v-for="column in visibleColumns" :key="column.key">{{ column.label }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="log in logs"
            :key="log.id"
            :class="`fs-xs logs-table__row logs-table__row--${getLogCategoryFamily(log.category)}`"
          >
            <td
              v-for="column in visibleColumns"
              :key="`${log.id}-${column.key}`"
              :class="{ 'logs-table__mono': column.monospace }"
            >
              {{ formatCell(column.read(log)) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="selectedPageSize !== 'All' && hasMore" class="flex justify-center">
      <VaButton preset="secondary" :loading="isLoadingMore" data-testid="logs-load-more" @click="loadMore">
        Cargar más
      </VaButton>
    </div>
    <VaModal
      v-model="showSettings"
      title="Configuración de columnas"
      data-testid="logs-settings-modal"
      hide-default-actions
    >
      <div class="logs-columns__grid">
        <label v-for="column in availableColumns" :key="column.key" class="logs-columns__option">
          <input
            type="checkbox"
            :checked="selectedColumns.includes(column.key)"
            :disabled="requiredLogColumnKeys.includes(column.key)"
            @change="toggleColumn(column.key, ($event.target as HTMLInputElement).checked)"
          >
          <span>{{ column.label }}</span>
        </label>
      </div>
      <VaDivider />
      <VaSelect
        v-model="selectedOrder"
        :options="['desc', 'asc']"
        label="Orden"
        data-testid="logs-order"
        class="fs-xs bold mr-2"
        content-class="fs-xs"
      />
      <VaSelect
        v-model="selectedPageSize"
        :options="pageSizeOptions"
        label="Tamaño de página"
        data-testid="logs-page-size"
        class="fs-xs bold mr-2"
        content-class="fs-xs"
      />
      <template #footer>
        <va-button @click="showSettings = false">Cerrar</va-button>
      </template>
    </VaModal>
  </section>
</template>

<style scoped>
.logs-toolbar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
  align-items: end;
}

.logs-filter-select {
  font-size: 0.82rem;
  background-color: red;
}

.logs-filter-select :deep(.va-input-wrapper__field),
.logs-filter-select :deep(.va-select-content__placeholder),
.logs-filter-select :deep(.va-select-option) {
  font-size: 0.82rem;
}

.logs-columns {
  border: 1px solid var(--va-background-border);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  background: var(--va-background-secondary);
}

.logs-columns > summary {
  cursor: pointer;
  font-weight: 700;
}

.logs-columns__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.logs-columns__option {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.86rem;
}

.logs-table-shell {
  overflow: auto;
  border: 1px solid var(--va-background-border);
  border-radius: 14px;
  background: var(--va-background-secondary);
}

.logs-table-shell--all {
  max-height: 68vh;
}

.logs-table {
  min-width: 960px;
  width: 100%;
  table-layout: fixed;
  font-size: 0.82rem;
}

.logs-table th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--va-background-element);
  color: var(--va-text-primary);
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.logs-table td,
.logs-table th {
  padding: 0.42rem 0.55rem;
  vertical-align: top;
  overflow-wrap: anywhere;
}

.logs-table__row:nth-child(even) {
  background: color-mix(in srgb, var(--va-background-primary) 58%, transparent);
}

.logs-table__row {
  border-left: 4px solid transparent;
}

.logs-table__row--account {
  border-left-color: var(--va-info);
}

.logs-table__row--pui {
  border-left-color: var(--va-warning);
}

.logs-table__row--plan {
  border-left-color: var(--va-success);
}

.logs-table__row--institution {
  border-left-color: var(--va-primary);
}

.logs-table__mono {
  font-family: 'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace;
  font-size:x-small;
}

.logs-status {
  margin: 0;
  padding: 1.25rem;
}
</style>

<script setup lang="ts">
/**
 * @package web
 * @name StatusBadge.vue
 * @version 0.0.1
 * @description Centraliza el badge visual para estados de dominio con vocabularios pequeños.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-04-27)	Versión inicial del archivo.	@codex
 */
import {
  COMMERCIAL_PLAN_STATUS,
  FINDING_PUI_SYNC_STATUS,
  PERMISSION_STATUS,
  SEARCH_REQUEST_PHASE_STATUS,
  SEARCH_REQUEST_STATUS,
  type CommercialPlanStatus,
  type FindingPuiSyncStatus,
  type PermissionStatus,
  type SearchRequestPhaseStatus,
  type SearchRequestStatus,
} from '@shared';

type StatusBadgeValue =
  | CommercialPlanStatus
  | PermissionStatus
  | SearchRequestStatus
  | SearchRequestPhaseStatus
  | FindingPuiSyncStatus;

type BadgeColor = 'primary' | 'danger' | 'success' | 'warning';

const props = defineProps<{
  status: StatusBadgeValue;
}>();

const statusColorByValue = {
  [COMMERCIAL_PLAN_STATUS.ACTIVE]: 'success',
  [COMMERCIAL_PLAN_STATUS.WARNING]: 'warning',
  [COMMERCIAL_PLAN_STATUS.PAUSED]: 'primary',
  [COMMERCIAL_PLAN_STATUS.STOPPED]: 'danger',
  [PERMISSION_STATUS.GRANTED]: 'success',
  [PERMISSION_STATUS.DENIED]: 'danger',
  [SEARCH_REQUEST_STATUS.REVOKED]: 'danger',
  [SEARCH_REQUEST_PHASE_STATUS.PENDING]: 'primary',
  [SEARCH_REQUEST_PHASE_STATUS.IN_PROGRESS]: 'warning',
  [SEARCH_REQUEST_PHASE_STATUS.DONE]: 'success',
  [FINDING_PUI_SYNC_STATUS.PROGRESS]: 'warning',
  [FINDING_PUI_SYNC_STATUS.SUCCESS]: 'success',
  [FINDING_PUI_SYNC_STATUS.ERROR]: 'danger',
} as const satisfies Record<StatusBadgeValue, BadgeColor>;
</script>

<template>
  <VaBadge :text="props.status" :color="statusColorByValue[props.status]" />
</template>

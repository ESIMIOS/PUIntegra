import { describe, expect, it } from 'vitest';
import { UPDATE_ORIGIN } from '@shared';
import UpdateHistoryPanel from '@/components/shared/UpdateHistoryPanel.vue';
import { mountWithVuestic } from './utils/mount';

const updates = [
  {
    previousPlanStatus: 'ACTIVE',
    updatedPlanStatus: 'WARNING',
    updateOrigin: UPDATE_ORIGIN.USER,
    updatedAt: 1767312000000,
    updatedByUserEmail: 'owner@example.test',
  },
  {
    previousPlanStatus: 'WARNING',
    updatedPlanStatus: 'PAUSED',
    updateOrigin: UPDATE_ORIGIN.SYSTEM,
    updatedAt: 1767315600000,
  },
];

function mountInline() {
  return mountWithVuestic(UpdateHistoryPanel, {
    props: {
      updates,
      fieldDefinitions: [{ key: 'planStatus', dataKey: 'PlanStatus', label: 'Estado del plan' }],
      mode: 'inline',
    },
  });
}

describe('UpdateHistoryPanel', () => {
  it('renders inline timeline by default', () => {
    const wrapper = mountInline();

    expect(wrapper.find('[data-testid="update-history-inline"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="update-history-timeline"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Estado del plan');
  });

  it('switches to table view', async () => {
    const wrapper = mountInline();

    await wrapper.get('[data-testid="update-history-view-table"]').trigger('click');

    expect(wrapper.find('[data-testid="update-history-table"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('owner@example.test');
  });

  it('supports icon mode with modal details', async () => {
    const wrapper = mountWithVuestic(UpdateHistoryPanel, {
      props: {
        updates,
        fieldDefinitions: [{ key: 'planStatus', dataKey: 'PlanStatus', label: 'Estado del plan' }],
        mode: 'icon',
      },
    });

    expect(document.body.querySelector('[data-testid="update-history-modal"]')).toBeNull();
    await wrapper.get('[data-testid="update-history-icon-trigger"]').trigger('click');
    expect(document.body.querySelector('[data-testid="update-history-modal"]')).not.toBeNull();
  });

  it('renders empty state when no updates are available', () => {
    const wrapper = mountWithVuestic(UpdateHistoryPanel, {
      props: {
        updates: [],
        fieldDefinitions: [{ key: 'planStatus', dataKey: 'PlanStatus', label: 'Estado del plan' }],
      },
    });

    expect(wrapper.find('[data-testid="update-history-empty"]').exists()).toBe(true);
  });
});

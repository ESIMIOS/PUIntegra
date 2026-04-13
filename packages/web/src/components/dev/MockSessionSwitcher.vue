<script setup lang="ts">
/**
 * @package web
 * @name MockSessionSwitcher.vue
 * @version 0.0.1
 * @description Panel de desarrollo para alternar sesión, rol, seguridad y contexto institucional.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */
import { computed, ref, watchEffect } from 'vue'
import { z } from 'zod'
import { ROLE, roleValues, RoleSchema } from '@shared'
import {
  DOMAIN,
  domainValues,
  domainOptions,
} from '@/shared/constants/domains'
import { DEFAULT_RFC, DEFAULT_FUB } from '@/shared/constants/routePaths'
import { buildNavigationLinks } from '@/shared/constants/navigationCatalog'
import { useMockSession } from '@/composables/useMockSession'
import { useSessionInactivity } from '@/composables/useSessionInactivity'
import { useRoute } from 'vue-router'

const route = useRoute()
const { roleModel, securityModel, rfcModel } = useMockSession()
const { secondsRemaining, isAlerting } = useSessionInactivity()

const roleOptions = roleValues.map((role) => ({
	text: role,
	value: role
}))

const roleSelectModel = computed<z.infer<typeof RoleSchema> | null>({
	get: () => {
		const parsed = RoleSchema.safeParse(roleModel.value)
		return parsed.success ? parsed.data : null
	},
	set: (value) => {
		if (value) {
			roleModel.value = value
		}
	}
})

const selectedDomain = ref<(typeof domainValues)[number]>(DOMAIN.SITE)

const isAuthenticated = computed(() => roleModel.value !== ROLE.ANONYMOUS)
const isSystemRole = computed(() => roleModel.value === ROLE.SYSTEM_ADMINISTRATOR)
const isInstitutionRole = computed(() => roleModel.value === ROLE.INSTITUTION_ADMIN || roleModel.value === ROLE.INSTITUTION_OPERATOR)
const isInstitutionAdmin = computed(() => roleModel.value === ROLE.INSTITUTION_ADMIN)

const availableDomains = computed(() =>
	domainOptions.map((domain) => ({
		...domain,
		disabled: (domain.key === DOMAIN.APP && !isInstitutionRole.value) || (domain.key === DOMAIN.ADMIN && !isSystemRole.value) || (domain.key === DOMAIN.ACCOUNT && !isAuthenticated.value)
	}))
)

watchEffect(() => {
	const selected = availableDomains.value.find((domain) => domain.key === selectedDomain.value)
	if (!selected || selected.disabled) {
		const firstEnabled = availableDomains.value.find((domain) => !domain.disabled)
		if (firstEnabled) {
			selectedDomain.value = firstEnabled.key
		}
	}
})

const contextualLinks = computed(() => {
	return buildNavigationLinks(selectedDomain.value, {
		activeRfc: rfcModel.value,
		adminInspectionRfc: DEFAULT_RFC,
		defaultFub: DEFAULT_FUB,
		isAuthenticated: isAuthenticated.value,
		isInstitutionRole: isInstitutionRole.value,
		isInstitutionAdmin: isInstitutionAdmin.value,
		isSystemRole: isSystemRole.value
	})
})
</script>

<template>
  <VaCard class="mock-switcher">
    <VaCardTitle>Mock Session Switcher</VaCardTitle>
    <VaCardContent>
      <VaSelect
        v-model="roleSelectModel"
        :options="roleOptions"
        text-by="text"
        value-by="value"
        track-by="value"
        label="Rol activo"
        teleport="body"
        content-class="mock-switcher__select-dropdown"
        :max-visible-options="8"
      />
      <div class="mock-switcher__switch-row">
        <VaSwitch
          v-model="securityModel"
          color="warning"
          label="Requiere security setup"
          size="small"
        />
      </div>
      <VaInput :model-value="rfcModel" label="RFC activo" readonly />
      <div v-if="isAuthenticated" class="mt-2">
        <VaChip :color="isAlerting ? 'danger' : 'info'" size="small">
          Session ends in: {{ secondsRemaining }}s
        </VaChip>
      </div>
      <VaDivider />
      <section class="mock-switcher__section" aria-label="Layout">
        <span class="mock-switcher__section-label">Layout</span>
        <div class="d-flex flex-wrap ga-2">
          <VaButton
            v-for="domain in availableDomains"
            :key="domain.key"
            size="small"
            :preset="selectedDomain === domain.key ? 'primary' : 'secondary'"
            color="primary"
            :disabled="domain.disabled"
            @click="selectedDomain = domain.key"
          >
            {{ domain.label }}
          </VaButton>
        </div>
      </section>
      <VaDivider />
      <section class="mock-switcher__section" aria-label="Page">
        <span class="mock-switcher__section-label">Page</span>
        <div class="d-flex flex-wrap ga-2">
          <VaButton
            v-for="link in contextualLinks"
            :key="link.id"
            size="small"
            :preset="link.to === route.path ? 'primary' : 'secondary'"
            :to="link.to"
            :disabled="link.disabled"
          >
            {{ link.label }}
          </VaButton>
        </div>
      </section>
    </VaCardContent>
  </VaCard>
</template>

<style scoped>
.mock-switcher {
	position: fixed;
	right: 1rem;
	bottom: 1rem;
	width: min(28rem, calc(100vw - 2rem));
  border: 1px solid var(--va-background-border);
  box-shadow: 0 12px 36px var(--va-shadow);
	z-index: 1000;
}

.mock-switcher__switch-row {
  margin: 0.75rem 0;
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--va-background-border);
  border-radius: 6px;
  background: color-mix(in srgb, var(--va-background-primary) 88%, var(--va-primary));
}

.mock-switcher__section {
  display: grid;
  gap: 0.45rem;
}

.mock-switcher__section-label {
  color: var(--va-text-secondary);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1;
  text-transform: uppercase;
}

:global(.mock-switcher__select-dropdown) {
  z-index: 1200 !important;
}
</style>

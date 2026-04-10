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
import { computed, ref, watchEffect, DOMAIN, domainValues, domainOptions, z, ROLE, roleValues, RoleSchema, DEFAULT_RFC, DEFAULT_FUB, buildNavigationLinks, useMockSession } from '@/bom'

const { roleModel, securityModel, rfcModel } = useMockSession()

const roleOptions = [...roleValues]

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
  <v-card class="mock-switcher" elevation="8">
    <v-card-title class="text-subtitle-1">Mock Session Switcher</v-card-title>
    <v-card-text>
      <v-select v-model="roleSelectModel" :items="roleOptions" label="Rol activo" density="compact" hide-details />
      <v-switch v-model="securityModel" color="orange" label="Requiere security setup" hide-details density="compact" />
      <v-text-field :model-value="rfcModel" label="RFC activo" readonly density="compact" hide-details />
      <v-divider class="my-3" />
      <div class="d-flex flex-wrap ga-2">
        <v-btn
          v-for="domain in availableDomains"
          :key="domain.key"
          size="small"
          :variant="selectedDomain === domain.key ? 'flat' : 'outlined'"
          color="primary"
          :disabled="domain.disabled"
          @click="selectedDomain = domain.key"
        >
          {{ domain.label }}
        </v-btn>
      </div>
      <v-divider class="my-3" />
      <div class="d-flex flex-wrap ga-2">
        <v-btn v-for="link in contextualLinks" :key="link.id" size="small" variant="tonal" :to="link.to" :disabled="link.disabled">
          {{ link.label }}
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.mock-switcher {
	position: fixed;
	right: 1rem;
	bottom: 1rem;
	width: min(28rem, calc(100vw - 2rem));
	z-index: 1000;
}
</style>

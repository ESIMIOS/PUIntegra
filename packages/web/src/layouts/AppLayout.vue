<script setup lang="ts">
/**
 * @package web
 * @name AppLayout.vue
 * @version 0.0.1
 * @description Layout del dominio institucional `/app` sin navegación interna en el shell.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */
import { domainShell, useInstitutionStore, DOMAIN } from '@/bom'

const institutionStore = useInstitutionStore()
</script>

<template>
  <v-layout class="layout-shell">
    <v-main>
      <v-app-bar :color="domainShell[DOMAIN.APP].appBarColor" density="comfortable">
        <v-app-bar-title>{{ domainShell[DOMAIN.APP].title }}</v-app-bar-title>
        <template #append>
          <v-chip class="mr-4" color="white" variant="outlined"> {{ domainShell[DOMAIN.APP].chipLabel }}: {{ institutionStore.activeRfc }} </v-chip>
        </template>
      </v-app-bar>
      <router-view />
    </v-main>
  </v-layout>
</template>

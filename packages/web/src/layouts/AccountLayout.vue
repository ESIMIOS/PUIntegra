<script setup lang="ts">
/**
 * @package web
 * @name AccountLayout.vue
 * @version 0.0.1
 * @description Layout del dominio de cuenta `/account` sin navegación interna en el shell.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */
import { DOMAIN, domainShell } from '@/bom';
</script>

<template>
  <v-layout class="layout-shell">
    <v-app-bar :color="domainShell[DOMAIN.ACCOUNT].appBarColor" density="comfortable">
      <v-app-bar-title>{{ domainShell[DOMAIN.ACCOUNT].title }}</v-app-bar-title>
    </v-app-bar>
    <v-main>
      <router-view />
    </v-main>
  </v-layout>
</template>

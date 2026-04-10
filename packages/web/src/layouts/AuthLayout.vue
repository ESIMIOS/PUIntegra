<script setup lang="ts">
/**
 * @package web
 * @name AuthLayout.vue
 * @version 0.0.1
 * @description Layout del dominio de autenticación `/auth` sin navegación interna en el shell.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */
import { DOMAIN, domainShell } from '@/bom';
</script>

<template>
  <v-layout class="layout-shell">
    <v-app-bar :color="domainShell[DOMAIN.AUTH].appBarColor" density="comfortable">
      <v-app-bar-title>{{ domainShell[DOMAIN.AUTH].title }}</v-app-bar-title>
    </v-app-bar>
    <v-main>
      <router-view />
    </v-main>
  </v-layout>
</template>

/**
 * @package web
 * @name main.ts
 * @version 0.0.6
 * @description Entry point: initializes styles, runs runtime bootstrap, and mounts the app.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.6	(2026-04-20)	Removes top-level await by wrapping startup in async function for es2020 targets.	@codex
 * - 0.0.5	(2026-04-17)	Explicit context cleanup if activeRfc is missing during bootstrap.	@tirsomartinezreyes
 * - 0.0.4	(2026-04-17)	Added resilience to hydration failure; falls back to anonymous session.	@tirsomartinezreyes
 * - 0.0.3	(2026-04-17)	Simplified bootstrap to use modern Top-Level Await.	@tirsomartinezreyes
 * - 0.0.2	(2026-04-14)	Replaced top-level await with promise chain (es2020 target compatibility).	@tirsomartinezreyes
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import "@/styles/main.css";
import { createWebApp } from "@/app/createWebApp";
import { bootstrapRuntime } from "@/app/bootstrapRuntime";
import { registerServiceWorker } from "@/app/registerServiceWorker";
import { logSystemMessageError, systemMessageTree } from "./bom";

/**
 * Resilient startup procedure: ensures app mounting and institution-context integrity.
 */
async function startApplication() {
  try {
    const { app, router, pinia } = createWebApp();
    await bootstrapRuntime(router, pinia);
    app.mount("#app");
    registerServiceWorker();
  } catch (criticalError) {
    logSystemMessageError(systemMessageTree.web.app.routerInitializationFailed, criticalError);
  }
}

void startApplication(); //NOSONAR

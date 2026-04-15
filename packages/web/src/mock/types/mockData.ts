/**
 * @package web
 * @name mockData.ts
 * @version 0.0.1
 * @description Declara el contrato agregado del dataset mock persistido.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-14)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import type {
  Contact,
  Finding,
  Institution,
  Log,
  Permission,
  Request,
  User
} from '@shared';

export type ProviderContext = {
  RFC: string;
  label: string;
};

export type MockDataset = {
  users: User[];
  institutions: Institution[];
  providerContexts: ProviderContext[];
  permissions: Permission[];
  contacts: Contact[];
  requests: Request[];
  findings: Finding[];
  logs: Log[];
};

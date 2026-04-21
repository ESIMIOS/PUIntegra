/**
 * @package web
 * @name firebaseDataGateway.ts
 * @version 0.0.1
 * @description Lee y muta datos de dominio desde Firestore usando contratos compartidos.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-04-18)	Agrega gateway Firestore para datos de dominio.	@codex
 */

import {
  ContactSchema,
  FindingSchema,
  InstitutionSchema,
  LogSchema,
  PermissionSchema,
  RequestSchema,
  SYSTEM_RFC,
  UserSchema,
  type Contact,
  type Finding,
  type Institution,
  type Log,
  type Permission,
  type Request,
  type User
} from '@shared';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { z } from 'zod';
import { getFirebaseRuntime } from '@/plugins/firebase';
import { nowUtcMilliseconds } from '@/shared/utils/dateUtils';
import { AppDataError, APP_DATA_ERROR_KIND } from '@/shared/errors/appErrors';

type CollectionName = 'users' | 'institutions' | 'permissions' | 'contacts' | 'requests' | 'findings' | 'logs';

/**
 * @description Resuelve referencia de colección Firestore por nombre permitido.
 */
function collectionRef(name: CollectionName) {
  return collection(getFirebaseRuntime().firestore, name);
}

/**
 * @description Resuelve referencia de documento Firestore por colección e identificador.
 */
function documentRef(name: CollectionName, id: string) {
  return doc(getFirebaseRuntime().firestore, name, id);
}

function parseEntity<T>(schema: z.ZodTypeAny, value: unknown, entityType: string): T {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    throw new AppDataError(APP_DATA_ERROR_KIND.VALIDATION, `Invalid ${entityType} payload.`, {
      entityType,
      issues: parsed.error.issues
    });
  }
  return parsed.data as T;
}

async function readCollection<T>(name: CollectionName, schema: z.ZodTypeAny) {
  const snapshot = await getDocs(collectionRef(name));
  return snapshot.docs.map((item) => parseEntity<T>(schema, item.data(), name));
}

export async function getUserById(userId: string): Promise<User> {
  const snapshot = await getDoc(documentRef('users', userId));
  if (!snapshot.exists()) {
    throw new AppDataError(APP_DATA_ERROR_KIND.NOT_FOUND, 'User not found.', { userId });
  }
  return parseEntity<User>(UserSchema, snapshot.data(), 'user');
}

export async function listInstitutions(): Promise<Institution[]> {
  const institutions = await readCollection<Institution>('institutions', InstitutionSchema);
  return institutions.filter((institution) => institution.RFC !== SYSTEM_RFC);
}

export async function listPermissionsByEmail(email: string): Promise<Permission[]> {
  const normalizedEmail = email.trim().toLowerCase();
  const snapshot = await getDocs(query(collectionRef('permissions'), where('email', '==', normalizedEmail)));
  return snapshot.docs.map((item) => parseEntity<Permission>(PermissionSchema, item.data(), 'permission'));
}

export async function listPermissionsByUser(userId: string): Promise<Permission[]> {
  const snapshot = await getDocs(query(collectionRef('permissions'), where('userId', '==', userId)));
  return snapshot.docs.map((item) => parseEntity<Permission>(PermissionSchema, item.data(), 'permission'));
}

export async function getPermissionById(permissionId: string): Promise<Permission> {
  const snapshot = await getDoc(documentRef('permissions', permissionId));
  if (!snapshot.exists()) {
    throw new AppDataError(APP_DATA_ERROR_KIND.NOT_FOUND, 'Permission not found.', { permissionId });
  }
  return parseEntity<Permission>(PermissionSchema, snapshot.data(), 'permission');
}

export async function listContactsByRfc(rfc: string): Promise<Contact[]> {
  const snapshot = await getDocs(query(collectionRef('contacts'), where('RFC', '==', rfc)));
  return snapshot.docs.map((item) => parseEntity<Contact>(ContactSchema, item.data(), 'contact'));
}

export async function getContactById(contactId: string): Promise<Contact> {
  const snapshot = await getDoc(documentRef('contacts', contactId));
  if (!snapshot.exists()) {
    throw new AppDataError(APP_DATA_ERROR_KIND.NOT_FOUND, 'Contact not found.', { contactId });
  }
  return parseEntity<Contact>(ContactSchema, snapshot.data(), 'contact');
}

export async function listRequestsByRfc(rfc: string): Promise<Request[]> {
  const snapshot = await getDocs(query(collectionRef('requests'), where('RFC', '==', rfc)));
  return snapshot.docs.map((item) => parseEntity<Request>(RequestSchema, item.data(), 'request'));
}

export async function listFindingsByRfc(rfc: string): Promise<Finding[]> {
  const snapshot = await getDocs(query(collectionRef('findings'), where('RFC', '==', rfc)));
  return snapshot.docs.map((item) => parseEntity<Finding>(FindingSchema, item.data(), 'finding'));
}

export async function listLogs(filters: { RFC?: string; userId?: string } = {}): Promise<Log[]> {
  const constraints = [
    ...(filters.RFC ? [where('RFC', '==', filters.RFC)] : []),
    ...(filters.userId ? [where('userId', '==', filters.userId)] : []),
    orderBy('createdAt', 'desc')
  ];
  const snapshot = await getDocs(query(collectionRef('logs'), ...constraints));
  return snapshot.docs.map((item) => parseEntity<Log>(LogSchema, item.data(), 'log'));
}

export async function updateUser(nextUser: User): Promise<User> {
  const parsed = parseEntity<User>(UserSchema, nextUser, 'user');
  await setDoc(documentRef('users', parsed.userId), parsed);
  return parsed;
}

export async function updateInstitution(nextInstitution: Institution): Promise<Institution> {
  const parsed = parseEntity<Institution>(InstitutionSchema, nextInstitution, 'institution');
  await setDoc(documentRef('institutions', parsed.RFC), parsed);
  return parsed;
}

export async function createPermission(input: Permission): Promise<Permission> {
  const parsed = parseEntity<Permission>(PermissionSchema, input, 'permission');
  await setDoc(documentRef('permissions', parsed.permissionId), parsed);
  return parsed;
}

export async function updatePermission(nextPermission: Permission): Promise<Permission> {
  const parsed = parseEntity<Permission>(PermissionSchema, nextPermission, 'permission');
  await setDoc(documentRef('permissions', parsed.permissionId), parsed);
  return parsed;
}

export async function createContact(input: Contact): Promise<Contact> {
  const parsed = parseEntity<Contact>(ContactSchema, input, 'contact');
  await setDoc(documentRef('contacts', parsed.contactId), parsed);
  return parsed;
}

export async function updateContact(nextContact: Contact): Promise<Contact> {
  const parsed = parseEntity<Contact>(ContactSchema, nextContact, 'contact');
  await setDoc(documentRef('contacts', parsed.contactId), parsed);
  return parsed;
}

export async function appendLog(input: Omit<Log, 'id' | 'createdAt'> & { id?: string; createdAt?: number }) {
  const createdAt = input.createdAt ?? nowUtcMilliseconds();
  const id = input.id ?? `log-${createdAt}`;
  const parsed = parseEntity<Log>(LogSchema, { ...input, id, createdAt }, 'log');
  await setDoc(documentRef('logs', parsed.id), parsed);
  return parsed;
}

export async function patchDocument(name: CollectionName, id: string, value: Record<string, unknown>) {
  await updateDoc(documentRef(name, id), value);
}

export async function createGeneratedDocument(name: CollectionName, value: Record<string, unknown>) {
  return addDoc(collectionRef(name), value);
}

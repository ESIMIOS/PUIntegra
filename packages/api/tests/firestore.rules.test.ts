/// <reference types="node" />

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import {
  DEFAULT_RFC,
  PERMISSION_STATUS,
  ROLE,
  SYSTEM_RFC
} from "@puintegra/shared";

const RULES_PATH = resolve(dirname(fileURLToPath(import.meta.url)), "../../../firebase/firestore/firestore.rules");
const FIRESTORE_RULES = readFileSync(RULES_PATH, "utf8");
const NOW = 1710000000000;
const TENANT_OWNER_RFC = DEFAULT_RFC;
const TENANT_OTHER_RFC = "ABCD010203EF4";

let testEnv: RulesTestEnvironment;
type PermissionStatus = (typeof PERMISSION_STATUS)[keyof typeof PERMISSION_STATUS];
type Role = (typeof ROLE)[keyof typeof ROLE];

function resolveEmulatorHost() {
  const [host = "127.0.0.1", portValue = "8081"] = (process.env.FIRESTORE_EMULATOR_HOST ?? "127.0.0.1:8081").split(":");
  const port = Number.parseInt(portValue, 10);
  if (!Number.isInteger(port)) {
    throw new TypeError(`Invalid FIRESTORE_EMULATOR_HOST: ${process.env.FIRESTORE_EMULATOR_HOST}`);
  }
  return { host, port };
}

function userFixture(userId: string, email: string) {
  return {
    userId,
    name: `User ${userId}`,
    email,
    updates: [],
    createdAt: NOW,
    updatedAt: NOW,
  };
}

function makePermissionDocumentId(email: string, rfc: string) {
  return `${email.toLowerCase()}__${rfc.toLowerCase()}`;
}

function permissionFixture(
  permissionId: string,
  email: string,
  RFC: string,
  status: PermissionStatus = PERMISSION_STATUS.GRANTED,
  role: Role = ROLE.INSTITUTION_ADMIN,
) {
  return {
    permissionId,
    RFC,
    email,
    role,
    status,
    updates: [],
    createdAt: NOW,
    updatedAt: NOW,
  };
}

describe("firestore security rules", () => {
  beforeAll(async () => {
    const { host, port } = resolveEmulatorHost();
    testEnv = await initializeTestEnvironment({
      projectId: "puintegra-dev",
      firestore: {
        host,
        port,
        rules: FIRESTORE_RULES,
      },
    });
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, "users", "uid-owner"), userFixture("uid-owner", "owner@example.test"));
      await setDoc(doc(db, "users", "uid-other"), userFixture("uid-other", "other@example.test"));
      await setDoc(
        doc(db, "permissions", makePermissionDocumentId("owner@example.test", TENANT_OWNER_RFC)),
        permissionFixture(
          "perm-owner-granted",
          "owner@example.test",
          TENANT_OWNER_RFC,
          PERMISSION_STATUS.GRANTED,
          ROLE.INSTITUTION_ADMIN
        ),
      );
      await setDoc(
        doc(db, "permissions", makePermissionDocumentId("owner@example.test", TENANT_OTHER_RFC)),
        permissionFixture(
          "perm-owner-denied",
          "owner@example.test",
          TENANT_OTHER_RFC,
          PERMISSION_STATUS.DENIED,
          ROLE.INSTITUTION_ADMIN
        ),
      );
      await setDoc(
        doc(db, "permissions", makePermissionDocumentId("owner@example.test", SYSTEM_RFC)),
        permissionFixture(
          "perm-owner-system",
          "owner@example.test",
          SYSTEM_RFC,
          PERMISSION_STATUS.GRANTED,
          ROLE.SYSTEM_ADMINISTRATOR
        ),
      );
      await setDoc(
        doc(db, "permissions", makePermissionDocumentId("other@example.test", TENANT_OTHER_RFC)),
        permissionFixture(
          "perm-other-granted",
          "other@example.test",
          TENANT_OTHER_RFC,
          PERMISSION_STATUS.GRANTED,
          ROLE.INSTITUTION_ADMIN
        ),
      );
      await setDoc(
        doc(db, "permissions", makePermissionDocumentId("other@example.test", TENANT_OWNER_RFC)),
        permissionFixture(
          "perm-other-denied",
          "other@example.test",
          TENANT_OWNER_RFC,
          PERMISSION_STATUS.DENIED,
          ROLE.INSTITUTION_ADMIN
        ),
      );
      await setDoc(
        doc(db, "permissions", makePermissionDocumentId("collaborator@example.test", TENANT_OWNER_RFC)),
        permissionFixture(
          "perm-collaborator-granted",
          "collaborator@example.test",
          TENANT_OWNER_RFC,
          PERMISSION_STATUS.GRANTED,
          ROLE.INSTITUTION_OPERATOR,
        ),
      );
      await setDoc(doc(db, "institutions", TENANT_OWNER_RFC), { RFC: TENANT_OWNER_RFC });
      await setDoc(doc(db, "institutions", TENANT_OTHER_RFC), { RFC: TENANT_OTHER_RFC });
      await setDoc(doc(db, "contacts", "contact-owner"), { contactId: "contact-owner", RFC: TENANT_OWNER_RFC });
      await setDoc(doc(db, "contacts", "contact-other"), { contactId: "contact-other", RFC: TENANT_OTHER_RFC });
      await setDoc(doc(db, "requests", "request-owner"), { requestId: "request-owner", RFC: TENANT_OWNER_RFC });
      await setDoc(doc(db, "requests", "request-other"), { requestId: "request-other", RFC: TENANT_OTHER_RFC });
      await setDoc(doc(db, "findings", "finding-owner"), { findingId: "finding-owner", RFC: TENANT_OWNER_RFC });
      await setDoc(doc(db, "findings", "finding-other"), { findingId: "finding-other", RFC: TENANT_OTHER_RFC });
      await setDoc(doc(db, "logs", "log-owner"), { id: "log-owner", RFC: TENANT_OWNER_RFC });
      await setDoc(doc(db, "logs", "log-other"), { id: "log-other", RFC: TENANT_OTHER_RFC });
      await setDoc(doc(db, "logs", "log-account-owner"), { id: "log-account-owner", RFC: null, userId: "uid-owner" });
      await setDoc(doc(db, "logs", "log-account-other"), { id: "log-account-other", RFC: null, userId: "uid-other" });
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  describe("users collection", () => {
    it("allows authenticated users to read only their own user document", async () => {
      const ownerDb = testEnv.authenticatedContext("uid-owner", { email: "owner@example.test" }).firestore();
      await assertSucceeds(getDoc(doc(ownerDb, "users", "uid-owner")));
      await assertFails(getDoc(doc(ownerDb, "users", "uid-other")));
    });

    it("denies unauthenticated reads", async () => {
      const anonymousDb = testEnv.unauthenticatedContext().firestore();
      await assertFails(getDoc(doc(anonymousDb, "users", "uid-owner")));
    });

    it("denies client writes for authenticated users", async () => {
      const ownerDb = testEnv.authenticatedContext("uid-owner", { email: "owner@example.test" }).firestore();
      await assertFails(setDoc(doc(ownerDb, "users", "uid-owner"), userFixture("uid-owner", "owner@example.test")));
    });
  });

  describe("permissions collection", () => {
    it("allows reading own permission when tenant grant is valid", async () => {
      const ownerDb = testEnv.authenticatedContext("uid-owner", { email: "owner@example.test" }).firestore();
      await assertSucceeds(getDoc(doc(ownerDb, "permissions", makePermissionDocumentId("owner@example.test", TENANT_OWNER_RFC))));
    });

    it("allows reading another user's permission when RFC is granted to authenticated user", async () => {
      const ownerDb = testEnv.authenticatedContext("uid-owner", { email: "owner@example.test" }).firestore();
      await assertSucceeds(
        getDoc(doc(ownerDb, "permissions", makePermissionDocumentId("collaborator@example.test", TENANT_OWNER_RFC))),
      );
    });

    it("allows reading own permission when tenant grant is not valid but email matches", async () => {
      const otherDb = testEnv.authenticatedContext("uid-other", { email: "other@example.test" }).firestore();
      await assertSucceeds(
        getDoc(doc(otherDb, "permissions", makePermissionDocumentId("other@example.test", TENANT_OWNER_RFC))),
      );
    });

    it("allows system administrator reading another user's permission across tenants", async () => {
      const ownerDb = testEnv.authenticatedContext("uid-owner", { email: "owner@example.test" }).firestore();
      await assertSucceeds(getDoc(doc(ownerDb, "permissions", makePermissionDocumentId("other@example.test", TENANT_OTHER_RFC))));
    });

    it("denies reading another user's permission when there is no tenant grant and email does not match", async () => {
      const otherDb = testEnv.authenticatedContext("uid-other", { email: "other@example.test" }).firestore();
      await assertFails(
        getDoc(doc(otherDb, "permissions", makePermissionDocumentId("collaborator@example.test", TENANT_OWNER_RFC))),
      );
    });

    it("denies unauthenticated reads", async () => {
      const anonymousDb = testEnv.unauthenticatedContext().firestore();
      await assertFails(
        getDoc(doc(anonymousDb, "permissions", makePermissionDocumentId("owner@example.test", TENANT_OWNER_RFC))),
      );
    });

    it("denies client writes for authenticated users", async () => {
      const ownerDb = testEnv.authenticatedContext("uid-owner", { email: "owner@example.test" }).firestore();
      await assertFails(
        setDoc(
          doc(ownerDb, "permissions", makePermissionDocumentId("owner@example.test", TENANT_OWNER_RFC)),
          permissionFixture("perm-owner-granted", "owner@example.test", TENANT_OWNER_RFC),
        ),
      );
    });
  });

  describe("tenant collections", () => {
    const tenantCollections = [
      ["contacts", "contact-owner", "contact-other"],
      ["requests", "request-owner", "request-other"],
      ["findings", "finding-owner", "finding-other"],
      ["logs", "log-owner", "log-other"],
    ] as const;

    for (const [collectionName, ownerDocId, otherDocId] of tenantCollections) {
      it(`allows read for granted tenant RFC on ${collectionName}`, async () => {
        const ownerDb = testEnv.authenticatedContext("uid-owner", { email: "owner@example.test" }).firestore();
        await assertSucceeds(getDoc(doc(ownerDb, collectionName, ownerDocId)));
      });

      it(`allows read for system administrator on ${collectionName}`, async () => {
        const ownerDb = testEnv.authenticatedContext("uid-owner", { email: "owner@example.test" }).firestore();
        await assertSucceeds(getDoc(doc(ownerDb, collectionName, otherDocId)));
      });

      it(`denies read when no granted tenant permission exists on ${collectionName}`, async () => {
        const otherDb = testEnv.authenticatedContext("uid-other", { email: "other@example.test" }).firestore();
        await assertFails(getDoc(doc(otherDb, collectionName, ownerDocId)));
      });

      it(`denies write access to ${collectionName}`, async () => {
        const ownerDb = testEnv.authenticatedContext("uid-owner", { email: "owner@example.test" }).firestore();
        await assertFails(setDoc(doc(ownerDb, collectionName, ownerDocId), { id: `${collectionName}-blocked` }));
      });
    }

    it("allows read for institutions when document key RFC is granted", async () => {
      const ownerDb = testEnv.authenticatedContext("uid-owner", { email: "owner@example.test" }).firestore();
      await assertSucceeds(getDoc(doc(ownerDb, "institutions", TENANT_OWNER_RFC)));
    });

    it("allows read for institutions when user is system administrator", async () => {
      const ownerDb = testEnv.authenticatedContext("uid-owner", { email: "owner@example.test" }).firestore();
      await assertSucceeds(getDoc(doc(ownerDb, "institutions", TENANT_OTHER_RFC)));
    });

    it("allows list read for institutions when user is system administrator", async () => {
      const ownerDb = testEnv.authenticatedContext("uid-owner", { email: "owner@example.test" }).firestore();
      await assertSucceeds(getDocs(collection(ownerDb, "institutions")));
    });

    it("denies read for institutions without granted permission", async () => {
      const otherDb = testEnv.authenticatedContext("uid-other", { email: "other@example.test" }).firestore();
      await assertFails(getDoc(doc(otherDb, "institutions", TENANT_OWNER_RFC)));
    });

    it("denies write access to institutions", async () => {
      const ownerDb = testEnv.authenticatedContext("uid-owner", { email: "owner@example.test" }).firestore();
      await assertFails(setDoc(doc(ownerDb, "institutions", TENANT_OWNER_RFC), { RFC: TENANT_OWNER_RFC }));
    });

    it("allows users to read only their own account logs", async () => {
      const otherDb = testEnv.authenticatedContext("uid-other", { email: "other@example.test" }).firestore();
      await assertSucceeds(getDoc(doc(otherDb, "logs", "log-account-other")));
      await assertFails(getDoc(doc(otherDb, "logs", "log-account-owner")));
    });

    it("allows system administrators to read account logs", async () => {
      const ownerDb = testEnv.authenticatedContext("uid-owner", { email: "owner@example.test" }).firestore();
      await assertSucceeds(getDoc(doc(ownerDb, "logs", "log-account-other")));
    });

    it("denies anonymous users reading account logs", async () => {
      const anonymousDb = testEnv.unauthenticatedContext().firestore();
      await assertFails(getDoc(doc(anonymousDb, "logs", "log-account-owner")));
    });
  });
});

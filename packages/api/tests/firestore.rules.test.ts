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
import { doc, getDoc, setDoc } from "firebase/firestore";

const RULES_PATH = resolve(dirname(fileURLToPath(import.meta.url)), "../../../firebase/firestore/firestore.rules");
const FIRESTORE_RULES = readFileSync(RULES_PATH, "utf8");
const NOW = 1710000000000;

let testEnv: RulesTestEnvironment;

function resolveEmulatorHost() {
  const [host = "127.0.0.1", portValue = "8081"] = (process.env.FIRESTORE_EMULATOR_HOST ?? "127.0.0.1:8081").split(":");
  const port = Number.parseInt(portValue, 10);
  if (!Number.isInteger(port)) {
    throw new Error(`Invalid FIRESTORE_EMULATOR_HOST: ${process.env.FIRESTORE_EMULATOR_HOST}`);
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

function permissionFixture(permissionId: string, email: string) {
  return {
    permissionId,
    RFC: "XAXX010101000",
    email,
    role: "INSTITUTION_ADMIN",
    status: "GRANTED",
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
      await setDoc(doc(db, "permissions", "perm-owner"), permissionFixture("perm-owner", "owner@example.test"));
      await setDoc(doc(db, "permissions", "perm-other"), permissionFixture("perm-other", "other@example.test"));
      await setDoc(doc(db, "institutions", "XAXX010101000"), { RFC: "XAXX010101000" });
      await setDoc(doc(db, "contacts", "contact-001"), { contactId: "contact-001" });
      await setDoc(doc(db, "requests", "request-001"), { requestId: "request-001" });
      await setDoc(doc(db, "findings", "finding-001"), { findingId: "finding-001" });
      await setDoc(doc(db, "logs", "log-001"), { id: "log-001" });
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
    it("allows reading permissions only when permission email matches authenticated email", async () => {
      const ownerDb = testEnv.authenticatedContext("uid-owner", { email: "owner@example.test" }).firestore();
      await assertSucceeds(getDoc(doc(ownerDb, "permissions", "perm-owner")));
      await assertFails(getDoc(doc(ownerDb, "permissions", "perm-other")));
    });

    it("denies unauthenticated reads", async () => {
      const anonymousDb = testEnv.unauthenticatedContext().firestore();
      await assertFails(getDoc(doc(anonymousDb, "permissions", "perm-owner")));
    });

    it("denies client writes for authenticated users", async () => {
      const ownerDb = testEnv.authenticatedContext("uid-owner", { email: "owner@example.test" }).firestore();
      await assertFails(
        setDoc(doc(ownerDb, "permissions", "perm-owner"), permissionFixture("perm-owner", "owner@example.test")),
      );
    });
  });

  describe("unused collections", () => {
    const blockedCollections = [
      ["institutions", "XAXX010101000"],
      ["contacts", "contact-001"],
      ["requests", "request-001"],
      ["findings", "finding-001"],
      ["logs", "log-001"],
    ] as const;

    for (const [collectionName, docId] of blockedCollections) {
      it(`denies read access to ${collectionName}`, async () => {
        const ownerDb = testEnv.authenticatedContext("uid-owner", { email: "owner@example.test" }).firestore();
        await assertFails(getDoc(doc(ownerDb, collectionName, docId)));
      });

      it(`denies write access to ${collectionName}`, async () => {
        const ownerDb = testEnv.authenticatedContext("uid-owner", { email: "owner@example.test" }).firestore();
        await assertFails(setDoc(doc(ownerDb, collectionName, docId), { id: `${collectionName}-blocked` }));
      });
    }
  });
});

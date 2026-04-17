import { randomUUID } from "node:crypto";
import { firestoreDb } from "@/lib/firebase-admin";
import type { PropertyInput, TransactionInput } from "@/lib/validations";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export type AppProperty = PropertyInput & {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type AppTransaction = TransactionInput & {
  id: string;
  userId: string;
  createdAt: string;
  property?: { name: string };
};

export type AppPropertyWithTransactions = AppProperty & {
  transactions: AppTransaction[];
};

function nowIso() {
  return new Date().toISOString();
}

function byNewestCreated<T extends { createdAt: string }>(a: T, b: T) {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

function byNewestDate<T extends { date: string }>(a: T, b: T) {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function userFromDoc(
  doc: FirebaseFirestore.QueryDocumentSnapshot | FirebaseFirestore.DocumentSnapshot
) {
  if (!doc.exists) return null;

  const data = doc.data() as Omit<AppUser, "id">;
  return { id: doc.id, ...data };
}

function propertyFromDoc(
  doc: FirebaseFirestore.QueryDocumentSnapshot | FirebaseFirestore.DocumentSnapshot
) {
  if (!doc.exists) return null;

  const data = doc.data() as Omit<AppProperty, "id">;
  return { id: doc.id, ...data };
}

function transactionFromDoc(
  doc: FirebaseFirestore.QueryDocumentSnapshot | FirebaseFirestore.DocumentSnapshot
) {
  if (!doc.exists) return null;

  const data = doc.data() as Omit<AppTransaction, "id">;
  return { id: doc.id, ...data };
}

async function deleteTransactionDocs(docs: FirebaseFirestore.QueryDocumentSnapshot[]) {
  const db = firestoreDb();

  for (let i = 0; i < docs.length; i += 450) {
    const batch = db.batch();
    docs.slice(i, i + 450).forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
}

export const store = {
  async findUserByEmail(email: string) {
    const snapshot = await firestoreDb()
      .collection("users")
      .where("email", "==", normalizeEmail(email))
      .limit(1)
      .get();

    return snapshot.empty ? null : userFromDoc(snapshot.docs[0]);
  },

  async findUserById(id: string) {
    const doc = await firestoreDb().collection("users").doc(id).get();
    return userFromDoc(doc);
  },

  async createUser({
    name,
    email,
    passwordHash,
  }: {
    name: string;
    email: string;
    passwordHash: string;
  }) {
    const id = randomUUID();
    const user: AppUser = {
      id,
      name,
      email: normalizeEmail(email),
      passwordHash,
      createdAt: nowIso(),
    };

    await firestoreDb().collection("users").doc(id).set(user);
    return user;
  },

  async listProperties(userId: string) {
    const snapshot = await firestoreDb()
      .collection("properties")
      .where("userId", "==", userId)
      .get();

    return snapshot.docs
      .map(propertyFromDoc)
      .filter((property): property is AppProperty => Boolean(property))
      .sort(byNewestCreated);
  },

  async createProperty(userId: string, input: PropertyInput) {
    const id = randomUUID();
    const timestamp = nowIso();
    const property: AppProperty = {
      ...input,
      id,
      userId,
      purchaseDate: new Date(input.purchaseDate).toISOString(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await firestoreDb().collection("properties").doc(id).set(property);
    return property;
  },

  async findProperty(userId: string, id: string) {
    const doc = await firestoreDb().collection("properties").doc(id).get();
    const property = propertyFromDoc(doc);

    if (!property || property.userId !== userId) return null;
    return property;
  },

  async findPropertyWithTransactions(userId: string, id: string) {
    const property = await this.findProperty(userId, id);
    if (!property) return null;

    const transactions = await this.listTransactions(userId, id);
    return { ...property, transactions };
  },

  async updateProperty(userId: string, id: string, input: PropertyInput) {
    const existing = await this.findProperty(userId, id);
    if (!existing) return null;

    const property: AppProperty = {
      ...existing,
      ...input,
      purchaseDate: new Date(input.purchaseDate).toISOString(),
      updatedAt: nowIso(),
    };

    await firestoreDb().collection("properties").doc(id).set(property);
    return property;
  },

  async deleteProperty(userId: string, id: string) {
    const existing = await this.findProperty(userId, id);
    if (!existing) return false;

    const db = firestoreDb();
    const transactionSnapshot = await db
      .collection("transactions")
      .where("userId", "==", userId)
      .where("propertyId", "==", id)
      .get();

    await deleteTransactionDocs(transactionSnapshot.docs);
    await db.collection("properties").doc(id).delete();
    return true;
  },

  async listTransactions(userId: string, propertyId?: string) {
    let query: FirebaseFirestore.Query = firestoreDb()
      .collection("transactions")
      .where("userId", "==", userId);

    if (propertyId) {
      query = query.where("propertyId", "==", propertyId);
    }

    const [transactionSnapshot, properties] = await Promise.all([
      query.get(),
      this.listProperties(userId),
    ]);
    const propertyNames = new Map(
      properties.map((property) => [property.id, property.name])
    );

    return transactionSnapshot.docs
      .map(transactionFromDoc)
      .filter(
        (transaction): transaction is AppTransaction => Boolean(transaction)
      )
      .map((transaction) => ({
        ...transaction,
        property: { name: propertyNames.get(transaction.propertyId) || "Unknown" },
      }))
      .sort(byNewestDate);
  },

  async createTransaction(userId: string, input: TransactionInput) {
    const property = await this.findProperty(userId, input.propertyId);
    if (!property) return null;

    const id = randomUUID();
    const transaction: AppTransaction = {
      ...input,
      id,
      userId,
      date: new Date(input.date).toISOString(),
      createdAt: nowIso(),
    };

    await firestoreDb().collection("transactions").doc(id).set(transaction);
    return transaction;
  },

  async deleteTransaction(userId: string, id: string) {
    const doc = await firestoreDb().collection("transactions").doc(id).get();
    const transaction = transactionFromDoc(doc);

    if (!transaction || transaction.userId !== userId) return false;

    await doc.ref.delete();
    return true;
  },

  async listPropertiesWithTransactions(userId: string) {
    const [properties, transactions] = await Promise.all([
      this.listProperties(userId),
      this.listTransactions(userId),
    ]);

    return properties.map((property) => ({
      ...property,
      transactions: transactions.filter(
        (transaction) => transaction.propertyId === property.id
      ),
    }));
  },
};

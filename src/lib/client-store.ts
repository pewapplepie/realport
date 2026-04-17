import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type {
  PropertyInput,
  PropertyRecord,
  PropertyWithTransactions,
  TransactionInput,
  TransactionRecord,
} from "@/lib/types";

function nowIso() {
  return new Date().toISOString();
}

function byNewestCreated<T extends { createdAt: string }>(a: T, b: T) {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

function byNewestDate<T extends { date: string }>(a: T, b: T) {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

function asProperty(id: string, data: Record<string, unknown>) {
  return { id, ...data } as PropertyRecord;
}

function asTransaction(id: string, data: Record<string, unknown>) {
  return { id, ...data } as TransactionRecord;
}

export async function listProperties(userId: string) {
  const snapshot = await getDocs(
    query(collection(db, "properties"), where("userId", "==", userId))
  );

  return snapshot.docs
    .map((item) => asProperty(item.id, item.data()))
    .sort(byNewestCreated);
}

export async function createProperty(userId: string, input: PropertyInput) {
  const timestamp = nowIso();
  const docRef = await addDoc(collection(db, "properties"), {
    ...input,
    userId,
    purchaseDate: new Date(input.purchaseDate).toISOString(),
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  return getProperty(userId, docRef.id);
}

export async function getProperty(userId: string, id: string) {
  const snapshot = await getDoc(doc(db, "properties", id));
  if (!snapshot.exists()) return null;

  const property = asProperty(snapshot.id, snapshot.data());
  return property.userId === userId ? property : null;
}

export async function getPropertyWithTransactions(
  userId: string,
  id: string
): Promise<PropertyWithTransactions | null> {
  const property = await getProperty(userId, id);
  if (!property) return null;

  const transactions = await listTransactions(userId, id);
  return { ...property, transactions };
}

export async function updateProperty(
  userId: string,
  id: string,
  input: PropertyInput
) {
  const existing = await getProperty(userId, id);
  if (!existing) return null;

  const property: PropertyRecord = {
    ...existing,
    ...input,
    purchaseDate: new Date(input.purchaseDate).toISOString(),
    updatedAt: nowIso(),
  };

  await setDoc(doc(db, "properties", id), property);
  return property;
}

export async function deleteProperty(userId: string, id: string) {
  const existing = await getProperty(userId, id);
  if (!existing) return false;

  const transactions = await listTransactions(userId, id);
  await Promise.all(
    transactions.map((transaction) =>
      deleteDoc(doc(db, "transactions", transaction.id))
    )
  );
  await deleteDoc(doc(db, "properties", id));
  return true;
}

export async function listTransactions(userId: string, propertyId?: string) {
  const constraints = [where("userId", "==", userId)];
  if (propertyId) constraints.push(where("propertyId", "==", propertyId));

  const [snapshot, properties] = await Promise.all([
    getDocs(query(collection(db, "transactions"), ...constraints)),
    listProperties(userId),
  ]);
  const propertyNames = new Map(
    properties.map((property) => [property.id, property.name])
  );

  return snapshot.docs
    .map((item) => asTransaction(item.id, item.data()))
    .map((transaction) => ({
      ...transaction,
      property: { name: propertyNames.get(transaction.propertyId) || "Unknown" },
    }))
    .sort(byNewestDate);
}

export async function createTransaction(
  userId: string,
  input: TransactionInput
) {
  const property = await getProperty(userId, input.propertyId);
  if (!property) return null;

  const docRef = await addDoc(collection(db, "transactions"), {
    ...input,
    userId,
    date: new Date(input.date).toISOString(),
    createdAt: nowIso(),
  });

  const snapshot = await getDoc(docRef);
  return asTransaction(snapshot.id, snapshot.data() || {});
}

export async function deleteTransaction(userId: string, id: string) {
  const snapshot = await getDoc(doc(db, "transactions", id));
  if (!snapshot.exists()) return false;

  const transaction = asTransaction(snapshot.id, snapshot.data());
  if (transaction.userId !== userId) return false;

  await deleteDoc(doc(db, "transactions", id));
  return true;
}

export async function listPropertiesWithTransactions(userId: string) {
  const [properties, transactions] = await Promise.all([
    listProperties(userId),
    listTransactions(userId),
  ]);

  return properties.map((property) => ({
    ...property,
    transactions: transactions.filter(
      (transaction) => transaction.propertyId === property.id
    ),
  }));
}

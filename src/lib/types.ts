export type AppUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type PropertyInput = {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: "residential" | "commercial" | "land" | "multi-family";
  purchasePrice: number;
  currentValue: number;
  purchaseDate: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  monthlyRent: number;
  notes: string;
};

export type PropertyRecord = PropertyInput & {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type TransactionInput = {
  propertyId: string;
  type: "income" | "expense";
  category: "rent" | "maintenance" | "tax" | "insurance" | "mortgage" | "other";
  amount: number;
  description: string;
  date: string;
};

export type TransactionRecord = TransactionInput & {
  id: string;
  userId: string;
  createdAt: string;
  property?: { name: string };
};

export type PropertyWithTransactions = PropertyRecord & {
  transactions: TransactionRecord[];
};

import { z } from "zod/v4";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const propertySchema = z.object({
  name: z.string().min(1, "Property name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  propertyType: z.enum(["residential", "commercial", "land", "multi-family"]),
  purchasePrice: z.number().positive("Purchase price must be positive"),
  currentValue: z.number().positive("Current value must be positive"),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  bedrooms: z.number().int().min(0).default(0),
  bathrooms: z.number().min(0).default(0),
  squareFeet: z.number().int().min(0).default(0),
  monthlyRent: z.number().min(0).default(0),
  notes: z.string().default(""),
});

export const transactionSchema = z.object({
  propertyId: z.string().min(1, "Property is required"),
  type: z.enum(["income", "expense"]),
  category: z.enum([
    "rent",
    "maintenance",
    "tax",
    "insurance",
    "mortgage",
    "other",
  ]),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().default(""),
  date: z.string().min(1, "Date is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PropertyInput = z.infer<typeof propertySchema>;
export type TransactionInput = z.infer<typeof transactionSchema>;

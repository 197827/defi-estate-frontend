import { z } from "zod";

export const propertyTypeSchema = z.enum([
  "residential",
  "commercial",
  "industrial",
  "land",
  "mixed",
]);

export type PropertyType = z.infer<typeof propertyTypeSchema>;

export const createPropertySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(200, "Name must be at most 200 characters"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(5000, "Description must be at most 5000 characters"),
  type: propertyTypeSchema,
  location: z
    .string()
    .trim()
    .min(1, "Location is required")
    .max(500, "Location must be at most 500 characters"),
  valuation: z
    .number({ invalid_type_error: "Valuation must be a number" })
    .int("Valuation must be a whole number of cents")
    .positive("Valuation must be greater than zero"),
  totalShares: z
    .number({ invalid_type_error: "Total shares must be a number" })
    .int("Total shares must be a whole number")
    .positive("Total shares must be greater than zero"),
  expectedYieldBps: z
    .number({ invalid_type_error: "Expected yield must be a number" })
    .int("Expected yield must be a whole number of basis points")
    .min(0, "Expected yield cannot be negative")
    .max(10000, "Expected yield must be at most 10000 basis points"),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
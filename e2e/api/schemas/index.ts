import { z } from "zod";

// ---------- Shared primitives ----------

export const ErrorResponseSchema = z.object({
  error: z.string().min(1),
});

const TierSchema = z.enum(["SEEKER", "ELITE", "PROFESSIONAL"]);
const JobStatusSchema = z.enum([
  "WISHLIST",
  "APPLIED",
  "INTERVIEWING",
  "OFFER",
  "REJECTED",
]);

// ---------- POST /api/auth/register ----------

export const RegisterSuccessSchema = z.object({
  message: z.string(),
  userId: z.string().min(1),
});

// ---------- GET /api/user/usage ----------

export const UsageResponseSchema = z.object({
  usage: z.object({
    optimizationCount: z.number().int().nonnegative(),
    briefCount: z.number().int().nonnegative(),
    scanCount: z.number().int().nonnegative(),
    tier: TierSchema,
    // TIER_LIMITS shape — kept loose so a new limit field doesn't break the contract,
    // but the object itself must exist.
    limits: z.record(z.string(), z.unknown()),
  }),
});

// ---------- GET /api/jobs/tracked ----------

export const JobSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  company: z.string(),
  location: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  matchScore: z.number().nullable().optional(),
  status: JobStatusSchema,
  isDeleted: z.boolean(),
  isSaved: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const TrackedJobsResponseSchema = z.object({
  jobs: z.array(JobSchema),
});

// ---------- POST /api/jobs/update-status ----------

export const UpdateStatusResponseSchema = z.object({
  success: z.literal(true),
  job: JobSchema.partial().nullable().optional(),
});

import { z } from 'zod';

// ── Primitives ──────────────────────────────────────────────────────

export const CentroidSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

// ── Fire Event (list endpoint: /api/v1/fire-events/current) ─────────

export const FireEventSummarySchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['active', 'contained', 'extinguished']),
  municipality: z.string().nullable(),
  state: z.string().length(2).nullable(),
  centroid: CentroidSchema,
  first_detected_at: z.string(),
  last_detected_at: z.string(),
  anomaly_count: z.number().int().nonnegative(),
  max_frp: z.number().nullable(),
  total_frp: z.number().nullable(),
  satellites: z.array(z.string()).nullable(),
});

export const FireEventsListSchema = z.array(FireEventSummarySchema);

// ── Fire Event Detail (detail endpoint: /api/v1/fire-events/:id) ────

export const AnomalyPointSchema = z.object({
  id: z.union([z.string(), z.number()]),
  latitude: z.number(),
  longitude: z.number(),
  detected_at: z.string(),
  satellite: z.string().nullable(),
  source: z.string().nullable(),
  confidence: z.string().nullable(),
  frp: z.number().nullable(),
});

export const FireEventDetailSchema = z.object({
  id: z.string().uuid(),
  municipality: z.string().nullable(),
  state: z.string().length(2).nullable(),
  centroid: CentroidSchema,
  anomaly_count: z.number().int().nonnegative(),
  anomalies: z.array(AnomalyPointSchema),
});

// ── Weather (point-level: /api/v1/weather/snapshot) ─────────────────

export const WeatherSnapshotSchema = z.object({
  temperature_c: z.number().nullable().optional(),
  relative_humidity_pct: z.number().nullable().optional(),
  wind_speed_kmh: z.number().nullable().optional(),
  precipitation_mm: z.number().nullable().optional(),
});

// ── Inferred Types ──────────────────────────────────────────────────

export type Centroid = z.infer<typeof CentroidSchema>;
export type FireEventSummary = z.infer<typeof FireEventSummarySchema>;
export type FireEventDetail = z.infer<typeof FireEventDetailSchema>;
export type AnomalyPoint = z.infer<typeof AnomalyPointSchema>;
export type WeatherSnapshot = z.infer<typeof WeatherSnapshotSchema>;

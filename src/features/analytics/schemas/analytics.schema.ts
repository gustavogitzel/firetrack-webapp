import { z } from 'zod';

export const HotspotSeriesPointSchema = z.object({
  period: z.string(),
  hotspots: z.number(),
});

export const HotspotSeriesSchema = z.object({
  granularity: z.enum(['month', 'year']),
  satellite: z.string(),
  first_month: z.string().nullable(),
  last_month: z.string().nullable(),
  points: z.array(HotspotSeriesPointSchema),
});

export const CAUSE_CLASSES = ['intentional', 'accidental', 'natural', 'indeterminate'] as const;
export const CauseClassSchema = z.enum(CAUSE_CLASSES);

export const CauseBreakdownSchema = z.object({
  total_occurrences: z.number(),
  indeterminate_occurrences: z.number(),
  single_cause_occurrences: z.number(),
  multiple_cause_occurrences: z.number(),
  classes: z.array(z.object({ cause_class: CauseClassSchema, occurrences: z.number() })),
  causes: z.array(
    z.object({
      cause_code: z.string(),
      cause_label: z.string(),
      category_label: z.string().nullable(),
      cause_class: CauseClassSchema.exclude(['indeterminate']),
      occurrences: z.number(),
      burned_area_ha: z.number().nullable(),
    }),
  ),
});

export const MunicipalityListSchema = z.array(
  z.object({ ibge_code: z.string(), name: z.string(), state: z.string() }),
);

export type HotspotSeries = z.infer<typeof HotspotSeriesSchema>;
export type HotspotSeriesPoint = z.infer<typeof HotspotSeriesPointSchema>;
export type CauseClass = z.infer<typeof CauseClassSchema>;
export type CauseBreakdown = z.infer<typeof CauseBreakdownSchema>;
export type MunicipalityList = z.infer<typeof MunicipalityListSchema>;

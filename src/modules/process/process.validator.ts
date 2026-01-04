import { z } from 'zod';

export const processFeedbackRawSchema = z.object({
  body: z.object({
    batchSize: z.number().int().min(1).max(1000).optional().default(100),
  }),
});

export const processFamepilotFeedbackRawSchema = z.object({
  body: z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be in YYYY-MM-DD format'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be in YYYY-MM-DD format'),
    batchSize: z.number().int().min(1).max(1000).optional().default(100),
  }),
});

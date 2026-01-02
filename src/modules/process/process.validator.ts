import { z } from 'zod';

export const processFeedbackRawSchema = z.object({
  body: z.object({
    batchSize: z.number().int().min(1).max(1000).optional().default(100),
  }),
});

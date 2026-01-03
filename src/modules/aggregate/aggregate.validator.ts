import { z } from 'zod';

export const dailyAggregateSchema = z.object({
  body: z.object({
    fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'fromDate must be in YYYY-MM-DD format'),
    toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'toDate must be in YYYY-MM-DD format'),
  }).refine(
    (data) => {
      const from = new Date(data.fromDate);
      const to = new Date(data.toDate);
      return from <= to;
    },
    {
      message: 'fromDate must be less than or equal to toDate',
    }
  ),
});

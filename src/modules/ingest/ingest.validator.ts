import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const ingestInstoreSchema = z.object({
  body: z.object({
    fromDate: z
      .string()
      .regex(dateRegex, 'fromDate must be in YYYY-MM-DD format')
      .refine((date) => !isNaN(Date.parse(date)), {
        message: 'fromDate must be a valid date',
      }),
    toDate: z
      .string()
      .regex(dateRegex, 'toDate must be in YYYY-MM-DD format')
      .refine((date) => !isNaN(Date.parse(date)), {
        message: 'toDate must be a valid date',
      }),
  }).refine(
    (data) => {
      const from = new Date(data.fromDate);
      const to = new Date(data.toDate);
      return from <= to;
    },
    {
      message: 'fromDate must be before or equal to toDate',
      path: ['fromDate'],
    }
  ),
});

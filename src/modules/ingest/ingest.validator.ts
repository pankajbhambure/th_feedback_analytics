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

export const ingestFamepilotSchema = z.object({
  body: z.object({
    startDate: z
      .string()
      .regex(dateRegex, 'startDate must be in YYYY-MM-DD format')
      .refine((date) => !isNaN(Date.parse(date)), {
        message: 'startDate must be a valid date',
      }),
    endDate: z
      .string()
      .regex(dateRegex, 'endDate must be in YYYY-MM-DD format')
      .refine((date) => !isNaN(Date.parse(date)), {
        message: 'endDate must be a valid date',
      }),
  }).refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return start <= end;
    },
    {
      message: 'startDate must be before or equal to endDate',
      path: ['startDate'],
    }
  ),
});

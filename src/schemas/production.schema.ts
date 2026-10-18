import { z } from 'zod';

export const productionBodySchema = z.object({
  itemId: z.string().uuid('Barang tidak valid'),
  quantity: z.coerce.number().int('Harus bilangan bulat').positive('Jumlah harus lebih dari 0').max(1_000_000),
  worker: z.string().trim().min(1, 'Nama pekerja wajib diisi').max(80),
  note: z.string().trim().max(500).optional().nullable(),
});

export const productionQuerySchema = z.object({
  since: z.string().datetime({ offset: true }).optional(),
});

export type ProductionBody = z.infer<typeof productionBodySchema>;

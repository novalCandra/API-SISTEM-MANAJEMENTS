import { z } from 'zod';

export const photoBodySchema = z.object({
  itemId: z.preprocess(
    (value) => (value === '' || value === undefined || value === null ? undefined : value),
    z.string().uuid('Barang tidak valid').optional(),
  ),
  itemName: z.preprocess(
    (value) => (value === '' || value === undefined || value === null ? undefined : value),
    z.string().trim().max(120).optional(),
  ),
  quantity: z.coerce.number().int('Harus bilangan bulat').min(0).max(1_000_000),
  worker: z.string().trim().min(1, 'Nama pekerja wajib diisi').max(80),
});

export type PhotoBody = z.infer<typeof photoBodySchema>;

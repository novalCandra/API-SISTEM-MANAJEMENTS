import { z } from 'zod';

const money = z.coerce.number().finite().min(0, 'Harga tidak boleh negatif').max(1_000_000_000_000);
const quantity = z.coerce.number().int('Harus bilangan bulat').min(0, 'Tidak boleh negatif').max(1_000_000_000);

export const itemBodySchema = z.object({
  name: z.string().trim().min(1, 'Nama barang wajib diisi').max(120),
  sku: z.string().trim().max(60).optional().nullable(),
  unit: z.string().trim().min(1, 'Satuan wajib diisi').max(20),
  stock: quantity,
  minStock: quantity,
  cost: money,
  price: money,
});

export const itemUpdateSchema = itemBodySchema.partial();

export const itemListQuerySchema = z.object({
  q: z.string().trim().max(80).optional(),
});

export type ItemBody = z.infer<typeof itemBodySchema>;
export type ItemUpdateBody = z.infer<typeof itemUpdateSchema>;

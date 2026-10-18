import { z } from 'zod';

export const noteBodySchema = z.object({
  title: z.string().trim().min(1, 'Judul wajib diisi').max(120),
  content: z.string().trim().min(1, 'Isi catatan wajib diisi').max(5000),
});

export const noteUpdateSchema = noteBodySchema.partial();

export type NoteBody = z.infer<typeof noteBodySchema>;
export type NoteUpdateBody = z.infer<typeof noteUpdateSchema>;

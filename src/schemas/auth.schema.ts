import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().trim().email('Email tidak valid').max(254),
  password: z.string().min(8, 'Kata sandi minimal 8 karakter').max(128),
  name: z.string().trim().min(1, 'Nama wajib diisi').max(80),
  businessName: z.string().trim().min(1, 'Nama usaha wajib diisi').max(80),
  dailyTarget: z.coerce.number().int().min(0, 'Target tidak boleh negatif').max(1_000_000).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Email tidak valid').max(254),
  password: z.string().min(1, 'Kata sandi wajib diisi').max(128),
});

export const idParamSchema = z.object({
  id: z.string().uuid('ID tidak valid'),
});

export type RegisterBody = z.infer<typeof registerSchema>;
export type LoginBody = z.infer<typeof loginSchema>;

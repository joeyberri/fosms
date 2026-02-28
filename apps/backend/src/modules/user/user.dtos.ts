import { z } from 'zod';

export const createUserSchema = z.object({
  employeeId: z.string(),
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.number().int().default(0),
  department: z.string(),
  currentShift: z.string(),
});

export const updateUserSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  role: z.number().int().optional(),
  department: z.string().optional(),
  currentShift: z.string().optional(),
  status: z.string().optional(),
});

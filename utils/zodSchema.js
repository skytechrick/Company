import z from 'zod';

export const signupSchema = z.object({
    firstName: z.string().min(3).max(255),
    lastName: z.string().min(3).max(255).optional(),
    email: z.string().email().max(255),
    mobileNumber: z.string().min(10).max(10),
    password: z.string().min(8).max(255),
});

export const loginSchema = z.object({
    email: z.string().email().max(255),
    password: z.string().min(8).max(255),
});

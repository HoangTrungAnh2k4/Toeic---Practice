import { z } from 'zod';

const email = z.string().trim().min(1, 'Vui lòng nhập email').pipe(z.email('Email chưa đúng định dạng'));

export const loginSchema = z.object({
    email,
    password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
    remember: z.boolean(),
});

export const registerSchema = z.object({
    fullName: z.string().trim().min(1, 'Vui lòng nhập họ và tên').max(50, 'Họ và tên tối đa 50 ký tự'),
    email,
    password: z
        .string()
        .min(8, 'Mật khẩu cần tối thiểu 8 ký tự')
        .regex(/[A-Za-z]/, 'Mật khẩu cần có ít nhất 1 chữ cái')
        .regex(/\d/, 'Mật khẩu cần có ít nhất 1 chữ số'),
    acceptTerms: z.boolean().refine((accepted) => accepted, 'Bạn cần đồng ý với điều khoản để tiếp tục'),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;

export const otpSchema = z.object({
    token: z.string().trim().regex(/^\d{6}$/, 'Mã xác thực gồm 6 chữ số'),
});

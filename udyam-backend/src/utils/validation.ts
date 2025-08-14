import { z } from 'zod';

// Step 1: Aadhaar verification schema
export const step1Schema = z.object({
  aadhaar: z.string()
    .length(12, 'Aadhaar number must be exactly 12 digits')
    .regex(/^[0-9]{12}$/, 'Aadhaar number must contain only digits'),
  aadhaarName: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be at most 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name must contain only letters and spaces')
});

// OTP verification schema
export const otpVerificationSchema = z.object({
  aadhaar: z.string()
    .length(12, 'Aadhaar number must be exactly 12 digits')
    .regex(/^[0-9]{12}$/, 'Aadhaar number must contain only digits'),
  otp: z.string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^[0-9]{6}$/, 'OTP must contain only digits')
});

// Step 2: Business details schema
export const step2Schema = z.object({
  registrationId: z.string()
    .min(1, 'Registration ID is required'),
  businessName: z.string()
    .min(1, 'Business name is required')
    .max(200, 'Business name must be at most 200 characters'),
  businessType: z.string()
    .min(1, 'Business type is required'),
  pan: z.string()
    .length(10, 'PAN must be exactly 10 characters')
    .regex(/^[A-Za-z]{5}[0-9]{4}[A-Za-z]$/, 'PAN format is invalid')
    .optional(),
  pincode: z.string()
    .length(6, 'PIN code must be exactly 6 digits')
    .regex(/^[0-9]{6}$/, 'PIN code must contain only digits'),
  city: z.string()
    .min(1, 'City is required')
    .max(50, 'City must be at most 50 characters'),
  state: z.string()
    .min(1, 'State is required'),
  address: z.string()
    .min(1, 'Address is required')
    .max(500, 'Address must be at most 500 characters'),
  email: z.string()
    .email('Invalid email format')
    .max(100, 'Email must be at most 100 characters')
    .optional()
});

// PIN code lookup schema
export const pincodeLookupSchema = z.object({
  pincode: z.string()
    .length(6, 'PIN code must be exactly 6 digits')
    .regex(/^[0-9]{6}$/, 'PIN code must contain only digits')
});

// Registration status schema
export const registrationStatusSchema = z.object({
  registrationId: z.string()
    .min(1, 'Registration ID is required')
});

// Export types
export type Step1Data = z.infer<typeof step1Schema>;
export type OtpVerificationData = z.infer<typeof otpVerificationSchema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type PincodeLookupData = z.infer<typeof pincodeLookupSchema>;
export type RegistrationStatusData = z.infer<typeof registrationStatusSchema>;





import { describe, it, expect } from '@jest/globals';
import { 
  step1Schema, 
  step2Schema, 
  otpVerificationSchema,
  pincodeLookupSchema 
} from '../utils/validation';

describe('Validation Schemas', () => {
  describe('Step 1 Schema (Aadhaar verification)', () => {
    it('should validate correct data', () => {
      const validData = {
        aadhaar: '123456789012',
        aadhaarName: 'John Doe'
      };
      
      const result = step1Schema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid Aadhaar number', () => {
      const invalidData = {
        aadhaar: '12345678901', // 11 digits
        aadhaarName: 'John Doe'
      };
      
      const result = step1Schema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('exactly 12 digits');
      }
    });

    it('should reject Aadhaar with letters', () => {
      const invalidData = {
        aadhaar: '12345678901a',
        aadhaarName: 'John Doe'
      };
      
      const result = step1Schema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Step 2 Schema (Business details)', () => {
    it('should validate correct data', () => {
      const validData = {
        registrationId: 'mock-reg-1234567890',
        businessName: 'Test Business',
        businessType: 'Proprietorship',
        pincode: '123456',
        city: 'Test City',
        state: 'Test State',
        address: 'Test Address'
      };
      
      const result = step2Schema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate data without optional fields', () => {
      const validData = {
        registrationId: 'mock-reg-1234567890',
        businessName: 'Test Business',
        businessType: 'Proprietorship',
        pincode: '123456',
        city: 'Test City',
        state: 'Test State',
        address: 'Test Address'
      };
      
      const result = step2Schema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid PAN format', () => {
      const invalidData = {
        registrationId: 'mock-reg-1234567890',
        businessName: 'Test Business',
        businessType: 'Proprietorship',
        pan: 'ABCD12345', // Invalid format
        pincode: '123456',
        city: 'Test City',
        state: 'Test State',
        address: 'Test Address'
      };
      
      const result = step2Schema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept valid PAN format', () => {
      const validData = {
        registrationId: 'mock-reg-1234567890',
        businessName: 'Test Business',
        businessType: 'Proprietorship',
        pan: 'ABCDE1234F', // Valid format
        pincode: '123456',
        city: 'Test City',
        state: 'Test State',
        address: 'Test Address'
      };
      
      const result = step2Schema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('OTP Verification Schema', () => {
    it('should validate correct data', () => {
      const validData = {
        aadhaar: '123456789012',
        otp: '123456'
      };
      
      const result = otpVerificationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid OTP length', () => {
      const invalidData = {
        aadhaar: '123456789012',
        otp: '12345' // 5 digits
      };
      
      const result = otpVerificationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('PIN Code Lookup Schema', () => {
    it('should validate correct PIN code', () => {
      const validData = {
        pincode: '123456'
      };
      
      const result = pincodeLookupSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid PIN code length', () => {
      const invalidData = {
        pincode: '12345' // 5 digits
      };
      
      const result = pincodeLookupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject PIN code with letters', () => {
      const invalidData = {
        pincode: '12345a'
      };
      
      const result = pincodeLookupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});





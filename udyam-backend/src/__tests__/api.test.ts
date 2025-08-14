import request from 'supertest';
import express from 'express';
import { Express } from 'express-serve-static-core';
import { jest, describe, it, expect, beforeAll } from '@jest/globals';

// Import your app setup
let app: Express;

// Mock the database and external services
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    // Mock Prisma client methods
  })),
}));

// Setup test app
beforeAll(async () => {
  // Import your app configuration
  const { default: createApp } = await import('../index');
  app = createApp;
});

describe('API Endpoints', () => {
  describe('POST /api/registration/step1', () => {
    it('should return 200 for valid Aadhaar verification data', async () => {
      const validData = {
        aadhaar: '123456789012',
        aadhaarName: 'John Doe'
      };

      const response = await request(app)
        .post('/api/registration/step1')
        .send(validData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Aadhaar verification successful');
      expect(response.body.data.registrationId).toBeDefined();
      expect(response.body.data.otp).toBeDefined();
    });

    it('should return 400 for missing aadhaar field', async () => {
      const invalidData = {
        aadhaarName: 'John Doe'
      };

      const response = await request(app)
        .post('/api/registration/step1')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should return 400 for missing aadhaarName field', async () => {
      const invalidData = {
        aadhaar: '123456789012'
      };

      const response = await request(app)
        .post('/api/registration/step1')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should return 400 for invalid Aadhaar format (11 digits)', async () => {
      const invalidData = {
        aadhaar: '12345678901',
        aadhaarName: 'John Doe'
      };

      const response = await request(app)
        .post('/api/registration/step1')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should return 400 for Aadhaar with letters', async () => {
      const invalidData = {
        aadhaar: '12345678901a',
        aadhaarName: 'John Doe'
      };

      const response = await request(app)
        .post('/api/registration/step1')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });
  });

  describe('POST /api/registration/verify-otp', () => {
    it('should return 200 for valid OTP verification', async () => {
      const validData = {
        aadhaar: '123456789012',
        otp: '123456'
      };

      const response = await request(app)
        .post('/api/registration/verify-otp')
        .send(validData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('OTP verified successfully');
      expect(response.body.data.aadhaar).toBe('123456789012');
      expect(response.body.data.verified).toBe(true);
    });

    it('should return 400 for missing aadhaar field', async () => {
      const invalidData = {
        otp: '123456'
      };

      const response = await request(app)
        .post('/api/registration/verify-otp')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should return 400 for missing otp field', async () => {
      const invalidData = {
        aadhaar: '123456789012'
      };

      const response = await request(app)
        .post('/api/registration/verify-otp')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should return 400 for invalid OTP', async () => {
      const invalidData = {
        aadhaar: '123456789012',
        otp: '000000'
      };

      const response = await request(app)
        .post('/api/registration/verify-otp')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Invalid OTP');
    });

    it('should return 400 for OTP with wrong length', async () => {
      const invalidData = {
        aadhaar: '123456789012',
        otp: '12345'
      };

      const response = await request(app)
        .post('/api/registration/verify-otp')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/registration/step2', () => {
    it('should return 200 for valid business details', async () => {
      const validData = {
        registrationId: 'mock-reg-1234567890',
        businessName: 'Test Business',
        businessType: 'Proprietorship',
        pincode: '123456',
        city: 'Test City',
        state: 'Test State',
        address: 'Test Address'
      };

      const response = await request(app)
        .post('/api/registration/step2')
        .send(validData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Business details submitted successfully');
      expect(response.body.data.registrationId).toBe('mock-reg-1234567890');
      expect(response.body.data.completed).toBe(true);
      expect(response.body.data.udyamNumber).toMatch(/^UDYAM-/);
    });

    it('should return 400 for missing registrationId', async () => {
      const invalidData = {
        businessName: 'Test Business',
        businessType: 'Proprietorship',
        pincode: '123456',
        city: 'Test City',
        state: 'Test State',
        address: 'Test Address'
      };

      const response = await request(app)
        .post('/api/registration/step2')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should return 400 for missing businessName', async () => {
      const invalidData = {
        registrationId: 'mock-reg-1234567890',
        businessType: 'Proprietorship',
        pincode: '123456',
        city: 'Test City',
        state: 'Test State',
        address: 'Test Address'
      };

      const response = await request(app)
        .post('/api/registration/step2')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should return 400 for missing businessType', async () => {
      const invalidData = {
        registrationId: 'mock-reg-1234567890',
        businessName: 'Test Business',
        pincode: '123456',
        city: 'Test City',
        state: 'Test State',
        address: 'Test Address'
      };

      const response = await request(app)
        .post('/api/registration/step2')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should return 400 for missing pincode', async () => {
      const invalidData = {
        registrationId: 'mock-reg-1234567890',
        businessName: 'Test Business',
        businessType: 'Proprietorship',
        city: 'Test City',
        state: 'Test State',
        address: 'Test Address'
      };

      const response = await request(app)
        .post('/api/registration/step2')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should return 400 for missing city', async () => {
      const invalidData = {
        registrationId: 'mock-reg-1234567890',
        businessName: 'Test Business',
        businessType: 'Proprietorship',
        pincode: '123456',
        state: 'Test State',
        address: 'Test Address'
      };

      const response = await request(app)
        .post('/api/registration/step2')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should return 400 for missing state', async () => {
      const invalidData = {
        registrationId: 'mock-reg-1234567890',
        businessName: 'Test Business',
        businessType: 'Proprietorship',
        pincode: '123456',
        city: 'Test City',
        address: 'Test Address'
      };

      const response = await request(app)
        .post('/api/registration/step2')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should return 400 for missing address', async () => {
      const invalidData = {
        registrationId: 'mock-reg-1234567890',
        businessName: 'Test Business',
        businessType: 'Proprietorship',
        pincode: '123456',
        city: 'Test City',
        state: 'Test State'
      };

      const response = await request(app)
        .post('/api/registration/step2')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should accept valid PAN format', async () => {
      const validData = {
        registrationId: 'mock-reg-1234567890',
        businessName: 'Test Business',
        businessType: 'Proprietorship',
        pan: 'ABCDE1234F',
        pincode: '123456',
        city: 'Test City',
        state: 'Test State',
        address: 'Test Address'
      };

      const response = await request(app)
        .post('/api/registration/step2')
        .send(validData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should accept valid email format', async () => {
      const validData = {
        registrationId: 'mock-reg-1234567890',
        businessName: 'Test Business',
        businessType: 'Proprietorship',
        pincode: '123456',
        city: 'Test City',
        state: 'Test State',
        address: 'Test Address',
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/registration/step2')
        .send(validData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/pincode/:pincode', () => {
    it('should return 200 for valid 6-digit pincode', async () => {
      const response = await request(app)
        .get('/api/pincode/123456')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pincode).toBe('123456');
      expect(response.body.data.city).toBeDefined();
      expect(response.body.data.state).toBeDefined();
    });

    it('should return 400 for invalid pincode length (5 digits)', async () => {
      const response = await request(app)
        .get('/api/pincode/12345')
        .expect(400);

      expect(response.body.error).toBe('Invalid PIN code');
    });

    it('should return 400 for invalid pincode length (7 digits)', async () => {
      const response = await request(app)
        .get('/api/pincode/1234567')
        .expect(400);

      expect(response.body.error).toBe('Invalid PIN code');
    });

    it('should return 400 for pincode with letters', async () => {
      const response = await request(app)
        .get('/api/pincode/12345a')
        .expect(400);

      expect(response.body.error).toBe('Invalid PIN code');
    });
  });

  describe('GET /health', () => {
    it('should return 200 for health check', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.message).toContain('Udyam Backend is running');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/non-existent-endpoint')
        .expect(404);

      expect(response.body.error).toBe('Endpoint not found');
    });

    it('should return 404 for POST to non-existent endpoints', async () => {
      const response = await request(app)
        .post('/non-existent-endpoint')
        .send({ test: 'data' })
        .expect(404);

      expect(response.body.error).toBe('Endpoint not found');
    });
  });

  describe('POST /api/verification/pan', () => {
    it('should return 200 for valid PAN verification', async () => {
      const validData = {
        pan: 'ABCDE1234F'
      };

      const response = await request(app)
        .post('/api/verification/pan')
        .send(validData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('PAN verification successful');
      expect(response.body.data.pan).toBe('ABCDE1234F');
      expect(response.body.data.name).toBeDefined();
      expect(response.body.data.dateOfBirth).toBeDefined();
      expect(response.body.data.verified).toBe(true);
    });

    it('should return 400 for missing PAN field', async () => {
      const invalidData = {};

      const response = await request(app)
        .post('/api/verification/pan')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Missing required fields');
      expect(response.body.required).toContain('pan');
    });

    it('should return 400 for invalid PAN format (wrong length)', async () => {
      const invalidData = {
        pan: 'ABCD12345'
      };

      const response = await request(app)
        .post('/api/verification/pan')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Invalid PAN format');
      expect(response.body.details).toContain('ABCDE1234F');
    });

    it('should return 400 for invalid PAN format (letters in wrong places)', async () => {
      const invalidData = {
        pan: '12345ABCDE'
      };

      const response = await request(app)
        .post('/api/verification/pan')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Invalid PAN format');
    });

    it('should return 400 for PAN with special characters', async () => {
      const invalidData = {
        pan: 'ABCD@1234F'
      };

      const response = await request(app)
        .post('/api/verification/pan')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Invalid PAN format');
    });

    it('should convert PAN to uppercase', async () => {
      const validData = {
        pan: 'abcde1234f'
      };

      const response = await request(app)
        .post('/api/verification/pan')
        .send(validData)
        .expect(200);

      expect(response.body.data.pan).toBe('ABCDE1234F');
    });
  });
});

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { step1Schema, step2Schema, otpVerificationSchema, pincodeLookupSchema } from './utils/validation';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.CORS_ORIGIN || 'http://localhost:3000',
    'https://openbizregistration.netlify.app',
    'https://openbizregistration.netlify.app/*'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Udyam Backend is running (development mode)'
  });
});

// Mock registration endpoints for development
app.post('/api/registration/step1', (req, res) => {
  try {
    const validationResult = step1Schema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validationResult.error.issues
      });
    }

    const { aadhaar, aadhaarName } = validationResult.data;
    
    // Mock Aadhaar verification
    const mockOtp = '123456';
    
    res.json({
      success: true,
      message: 'Aadhaar verification successful. Please enter OTP.',
      data: {
        registrationId: 'mock-reg-' + Date.now(),
        otp: mockOtp, // In production, this would be sent via SMS
        expiresIn: '10 minutes'
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/registration/verify-otp', (req, res) => {
  try {
    const validationResult = otpVerificationSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validationResult.error.issues
      });
    }

    const { aadhaar, otp } = validationResult.data;
    
    // Mock OTP verification
    if (otp === '123456') {
      res.json({
        success: true,
        message: 'OTP verified successfully',
        data: {
          aadhaar,
          verified: true
        }
      });
    } else {
      res.status(400).json({ error: 'Invalid OTP' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/registration/step2', (req, res) => {
  try {
    const validationResult = step2Schema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validationResult.error.issues
      });
    }

    const { registrationId, businessName, businessType, pan, pincode, city, state, address, email } = validationResult.data;
    
    res.json({
      success: true,
      message: 'Business details submitted successfully',
      data: {
        registrationId,
        completed: true,
        udyamNumber: 'UDYAM-' + Math.random().toString(36).substr(2, 9).toUpperCase()
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mock PIN code lookup
app.get('/api/pincode/:pincode', (req, res) => {
  try {
    const validationResult = pincodeLookupSchema.safeParse(req.params);
    
    if (!validationResult.success) {
      return res.status(400).json({ error: 'Invalid PIN code' });
    }

    const { pincode } = validationResult.data;
    
    // Mock PIN code data
    const mockData = {
      pincode,
      city: 'Mumbai',
      state: 'Maharashtra',
      district: 'Mumbai City',
      country: 'India'
    };

    res.json({
      success: true,
      data: mockData
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PAN Verification endpoint
app.post('/api/verification/pan', (req, res) => {
  try {
    const { pan } = req.body;
    
    if (!pan) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['pan']
      });
    }

    // Validate PAN format
    const panRegex = /^[A-Za-z]{5}[0-9]{4}[A-Za-z]$/;
    if (!panRegex.test(pan)) {
      return res.status(400).json({ 
        error: 'Invalid PAN format',
        details: 'PAN must be in format: ABCDE1234F'
      });
    }

    // Mock PAN verification (in production, this would call government API)
    const mockPanData = {
      pan: pan.toUpperCase(),
      name: 'Syed Mohd Zama Mehdi',
      dateOfBirth: '09/02/2002',
      type: 'Individual',
      status: 'Active',
      verified: true
    };

    res.json({
      success: true,
      message: 'PAN verification successful',
      data: mockPanData
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(`Frontend should connect to: http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Export app for testing
export default app;

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

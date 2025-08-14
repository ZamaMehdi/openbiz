import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://openbiz-production-ac4c.up.railway.app';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const apiEndpoints = {
  // Step 1: Aadhaar verification
  step1: '/api/registration/step1',
  
  // OTP verification
  verifyOtp: '/api/registration/verify-otp',
  
  // Step 2: Business details
  step2: '/api/registration/step2',
  
  // PIN code lookup for city/state
  pincodeLookup: '/api/pincode',
  
  // Get registration status
  status: '/api/registration/status',
};

// API functions
export const registrationAPI = {
  // Submit Step 1 (Aadhaar verification)
  async submitStep1(data: {
    aadhaar: string;
    aadhaarName: string;
  }) {
    const response = await api.post(apiEndpoints.step1, data);
    return response.data;
  },

  // Verify OTP
  async verifyOtp(data: {
    aadhaar: string;
    otp: string;
  }) {
    const response = await api.post(apiEndpoints.verifyOtp, data);
    return response.data;
  },

  // Submit Step 2 (Business details)
  async submitStep2(data: {
    registrationId: string;
    businessName: string;
    businessType: string;
    pan?: string;
    pincode: string;
    city: string;
    state: string;
    address: string;
    email?: string;
  }) {
    const response = await api.post(apiEndpoints.step2, data);
    return response.data;
  },

  // Verify PAN
  async verifyPan(data: {
    pan: string;
  }) {
    const response = await api.post('/api/verification/pan', data);
    return response.data;
  },

  // Get PIN code details
  async getPincodeDetails(pincode: string) {
    const response = await api.get(`/api/pincode/${pincode}`);
    return response.data;
  }
};

// PIN code lookup API
export const pincodeAPI = {
  async lookupPincode(pincode: string) {
    try {
      // Try our backend first
      const response = await api.get(`${apiEndpoints.pincodeLookup}/${pincode}`);
      return response.data;
    } catch (error) {
      // Fallback to public API
      const publicResponse = await axios.get(
        `https://api.postalpincode.in/pincode/${pincode}`,
        { timeout: 5000 }
      );
      
      if (publicResponse.data && publicResponse.data[0]?.PostOffice) {
        const postOffice = publicResponse.data[0].PostOffice[0];
        return {
          city: postOffice.Block || postOffice.Division,
          state: postOffice.State,
          district: postOffice.District,
          success: true,
        };
      }
      
      throw new Error('Invalid PIN code');
    }
  },
};

// Mock OTP for development
export const mockOtpAPI = {
  // In development, we'll use a fixed OTP
  getMockOtp(): string {
    if (process.env.NODE_ENV === 'development') {
      return '123456';
    }
    return '';
  },

  // Check if mock OTP is enabled
  isMockEnabled(): boolean {
    return process.env.NODE_ENV === 'development';
  },
};

export default api;





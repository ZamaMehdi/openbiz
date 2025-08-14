# Testing Guide for Udyam Registration System

This guide covers testing strategies for the complete Udyam registration system, including frontend, backend, and end-to-end testing.

## 🧪 Testing Strategy Overview

### Testing Pyramid
```
    /\
   /  \     E2E Tests (Few, Critical Paths)
  /____\    
 /      \   Integration Tests (API, Database)
/________\  Unit Tests (Components, Functions)
```

### Test Types
1. **Unit Tests**: Individual functions and components
2. **Integration Tests**: API endpoints and database interactions
3. **E2E Tests**: Complete user workflows
4. **Performance Tests**: Load and stress testing

## 🎯 Frontend Testing (Next.js)

### Setup
```bash
cd udyam-ui
npm install --save-dev @testing-library/jest-dom @testing-library/react @testing-library/user-event
```

### Test Files Structure
```
src/
├── __tests__/
│   ├── components/
│   │   ├── DynamicForm.test.tsx
│   │   ├── TextField.test.tsx
│   │   ├── SelectField.test.tsx
│   │   ├── OTPField.test.tsx
│   │   └── ProgressBar.test.tsx
│   ├── lib/
│   │   ├── validation.test.ts
│   │   └── api.test.ts
│   └── utils/
│       └── test-utils.tsx
```

### Example Component Test
```typescript
// src/__tests__/components/TextField.test.tsx
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import TextField from '@/components/fields/TextField';

const TestWrapper = ({ field, defaultValues = {} }) => {
  const { control } = useForm({ defaultValues });
  return <TextField field={field} control={control} />;
};

describe('TextField', () => {
  it('renders with correct label', () => {
    const field = {
      name: 'test',
      id: 'test',
      label: 'Test Field',
      type: 'text',
      required: true
    };
    
    render(<TestWrapper field={field} />);
    expect(screen.getByText('Test Field')).toBeInTheDocument();
  });

  it('shows required indicator for required fields', () => {
    const field = {
      name: 'test',
      id: 'test',
      label: 'Test Field',
      type: 'text',
      required: true
    };
    
    render(<TestWrapper field={field} />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });
});
```

### Form Testing
```typescript
// src/__tests__/components/DynamicForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DynamicForm from '@/components/DynamicForm';
import { mockSchema } from '../utils/test-utils';

describe('DynamicForm', () => {
  it('renders step 1 fields correctly', () => {
    render(<DynamicForm schema={mockSchema} />);
    
    expect(screen.getByLabelText(/Aadhaar Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Name as per Aadhaar/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mobile Number/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<DynamicForm schema={mockSchema} />);
    
    const submitButton = screen.getByText(/Verify Aadhaar/i);
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Aadhaar number is required/i)).toBeInTheDocument();
    });
  });

  it('advances to step 2 after successful step 1', async () => {
    const user = userEvent.setup();
    render(<DynamicForm schema={mockSchema} />);
    
    // Fill step 1
    await user.type(screen.getByLabelText(/Aadhaar Number/i), '123456789012');
    await user.type(screen.getByLabelText(/Name as per Aadhaar/i), 'John Doe');
    await user.type(screen.getByLabelText(/Mobile Number/i), '9876543210');
    
    // Submit step 1
    await user.click(screen.getByText(/Verify Aadhaar/i));
    
    // Should show OTP step
    await waitFor(() => {
      expect(screen.getByText(/OTP Verification/i)).toBeInTheDocument();
    });
  });
});
```

## 🔧 Backend Testing (Express + Prisma)

### Setup
```bash
cd udyam-backend
npm install --save-dev jest ts-jest supertest @types/supertest
```

### Test Files Structure
```
src/
├── __tests__/
│   ├── routes/
│   │   ├── registration.test.ts
│   │   └── pincode.test.ts
│   ├── services/
│   │   ├── registrationService.test.ts
│   │   ├── otpService.test.ts
│   │   └── pincodeService.test.ts
│   ├── middleware/
│   │   └── validation.test.ts
│   ├── utils/
│   │   └── encryption.test.ts
│   └── setup.ts
```

### Example Route Test
```typescript
// src/__tests__/routes/registration.test.ts
import request from 'supertest';
import app from '../index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Registration Routes', () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.registration.deleteMany();
    await prisma.otpLog.deleteMany();
  });

  describe('POST /api/registration/step1', () => {
    it('should create new registration', async () => {
      const response = await request(app)
        .post('/api/registration/step1')
        .send({
          aadhaar: '123456789012',
          aadhaarName: 'John Doe',
          mobile: '9876543210'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.requiresOtp).toBe(true);
    });

    it('should reject invalid Aadhaar number', async () => {
      const response = await request(app)
        .post('/api/registration/step1')
        .send({
          aadhaar: '12345678901', // 11 digits
          aadhaarName: 'John Doe',
          mobile: '9876543210'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation failed');
    });
  });

  describe('POST /api/registration/verify-otp', () => {
    it('should verify valid OTP', async () => {
      // First create registration
      await request(app)
        .post('/api/registration/step1')
        .send({
          aadhaar: '123456789012',
          aadhaarName: 'John Doe',
          mobile: '9876543210'
        });

      // Then verify OTP
      const response = await request(app)
        .post('/api/registration/verify-otp')
        .send({
          aadhaar: '123456789012',
          otp: '123456'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
```

### Service Testing
```typescript
// src/__tests__/services/registrationService.test.ts
import { RegistrationService } from '../../services/registrationService';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client');

describe('RegistrationService', () => {
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
  });

  describe('processStep1', () => {
    it('should create new registration successfully', async () => {
      const mockData = {
        aadhaar: '123456789012',
        aadhaarName: 'John Doe',
        mobile: '9876543210'
      };

      mockPrisma.registration.findUnique.mockResolvedValue(null);
      mockPrisma.registration.create.mockResolvedValue({
        id: 'test-id',
        ...mockData,
        step1Completed: true
      } as any);

      const result = await RegistrationService.processStep1(mockData);

      expect(result.success).toBe(true);
      expect(result.requiresOtp).toBe(true);
    });
  });
});
```

## 🌐 End-to-End Testing

### Setup with Cypress
```bash
cd udyam-ui
npm install --save-dev cypress
npx cypress open
```

### E2E Test Structure
```
cypress/
├── e2e/
│   ├── registration-flow.cy.ts
│   ├── form-validation.cy.ts
│   └── api-integration.cy.ts
├── fixtures/
│   └── test-data.json
└── support/
    ├── commands.ts
    └── e2e.ts
```

### Example E2E Test
```typescript
// cypress/e2e/registration-flow.cy.ts
describe('Udyam Registration Flow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('should complete full registration process', () => {
    // Step 1: Aadhaar verification
    cy.get('[data-testid="aadhaar-input"]').type('123456789012');
    cy.get('[data-testid="name-input"]').type('John Doe');
    cy.get('[data-testid="mobile-input"]').type('9876543210');
    cy.get('[data-testid="step1-submit"]').click();

    // Verify OTP step appears
    cy.get('[data-testid="otp-title"]').should('contain', 'OTP Verification');
    
    // Enter OTP
    cy.get('[data-testid="otp-input-0"]').type('1');
    cy.get('[data-testid="otp-input-1"]').type('2');
    cy.get('[data-testid="otp-input-2"]').type('3');
    cy.get('[data-testid="otp-input-3"]').type('4');
    cy.get('[data-testid="otp-input-4"]').type('5');
    cy.get('[data-testid="otp-input-5"]').type('6');
    cy.get('[data-testid="otp-submit"]').click();

    // Verify step 2 appears
    cy.get('[data-testid="step2-title"]').should('contain', 'Business Details');
    
    // Fill business details
    cy.get('[data-testid="business-name-input"]').type('Test Business');
    cy.get('[data-testid="business-type-select"]').select('Proprietorship');
    cy.get('[data-testid="pincode-input"]').type('123456');
    cy.get('[data-testid="city-input"]').type('Test City');
    cy.get('[data-testid="state-select"]').select('Maharashtra');
    cy.get('[data-testid="address-input"]').type('Test Address');
    cy.get('[data-testid="step2-submit"]').click();

    // Verify completion
    cy.get('[data-testid="success-message"]').should('contain', 'Registration completed');
  });

  it('should show validation errors for invalid input', () => {
    cy.get('[data-testid="aadhaar-input"]').type('123'); // Invalid length
    cy.get('[data-testid="step1-submit"]').click();
    
    cy.get('[data-testid="aadhaar-error"]').should('contain', 'exactly 12 digits');
  });
});
```

## 📊 Test Coverage

### Frontend Coverage
```bash
cd udyam-ui
npm run test:coverage
```

### Backend Coverage
```bash
cd udyam-backend
npm run test -- --coverage
```

### Coverage Targets
- **Statements**: 90%
- **Branches**: 85%
- **Functions**: 90%
- **Lines**: 90%

## 🚀 Performance Testing

### Load Testing with Artillery
```bash
npm install -g artillery
```

```yaml
# load-test.yml
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100
      name: "Peak load"

scenarios:
  - name: "Registration Flow"
    weight: 70
    flow:
      - post:
          url: "/api/registration/step1"
          json:
            aadhaar: "{{ $randomString(12, '0123456789') }}"
            aadhaarName: "Test User"
            mobile: "{{ $randomString(10, '0123456789') }}"
      - think: 2
      - post:
          url: "/api/registration/verify-otp"
          json:
            aadhaar: "{{ aadhaar }}"
            otp: "123456"

  - name: "PIN Code Lookup"
    weight: 30
    flow:
      - get:
          url: "/api/pincode/123456"
```

## 🔍 Debugging Tests

### Frontend Debugging
```typescript
// Add debug statements
it('should handle form submission', () => {
  console.log('Test data:', testData);
  render(<Component />);
  console.log('Rendered component');
  
  // Use screen.debug() to see DOM
  screen.debug();
});
```

### Backend Debugging
```typescript
// Enable detailed logging
beforeEach(() => {
  console.log('Setting up test...');
});

it('should process registration', async () => {
  console.log('Processing registration...');
  const result = await service.process(data);
  console.log('Result:', result);
});
```

## 📝 Test Data Management

### Fixtures
```typescript
// src/__tests__/fixtures/registration-data.ts
export const validStep1Data = {
  aadhaar: '123456789012',
  aadhaarName: 'John Doe',
  mobile: '9876543210'
};

export const validStep2Data = {
  businessName: 'Test Business',
  businessType: 'Proprietorship',
  pincode: '123456',
  city: 'Test City',
  state: 'Maharashtra',
  address: 'Test Address'
};
```

### Mock Data
```typescript
// src/__tests__/mocks/schema.ts
export const mockSchema = {
  forms: [
    {
      step: 1,
      title: 'Aadhaar Verification',
      fields: [
        {
          name: 'aadhaar',
          id: 'txtAadhaar',
          label: 'Aadhaar Number',
          type: 'text',
          required: true,
          pattern: '^[0-9]{12}$',
          maxlength: 12
        }
      ]
    }
  ]
};
```

## 🎯 Best Practices

1. **Test Isolation**: Each test should be independent
2. **Descriptive Names**: Use clear, descriptive test names
3. **Arrange-Act-Assert**: Structure tests in AAA pattern
4. **Mock External Dependencies**: Don't test external services
5. **Test Edge Cases**: Include error scenarios and boundary conditions
6. **Fast Execution**: Keep tests fast for quick feedback
7. **Maintainable**: Write tests that are easy to maintain

## 📚 Additional Resources

- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Cypress Documentation](https://docs.cypress.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)






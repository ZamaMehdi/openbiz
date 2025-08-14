import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  FormField, 
  FormStep, 
  UdyamSchema, 
  stepToZodSchema 
} from '@/lib/validation';
import { 
  registrationAPI, 
  pincodeAPI, 
  mockOtpAPI 
} from '@/lib/api';
import TextField from './fields/TextField';
import SelectField from './fields/SelectField';
import OTPField from './fields/OTPField';
import ProgressBar from './ProgressBar';

interface DynamicFormProps {
  schema: UdyamSchema;
  className?: string;
}

const DynamicForm: React.FC<DynamicFormProps> = ({ schema, className = '' }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState<any>(null);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [isOtpEnabled, setIsOtpEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [panData, setPanData] = useState<any>(null);
  const [isPanVerified, setIsPanVerified] = useState(false);

  // Get current step data
  const currentStepData = schema.forms.find(form => form.step === currentStep);
  
  // For business details (step 4), use the business fields from step 2
  const getCurrentStepData = () => {
    if (currentStep === 2) {
      // Step 2 is OTP verification - no schema needed
      console.log('Step 2 - OTP verification, no schema needed');
      return null;
    } else if (currentStep === 3) {
      // Step 3 is PAN verification - no schema needed
      console.log('Step 3 - PAN verification, no schema needed');
      return null;
    } else if (currentStep === 4) {
      const businessData = schema.forms.find(form => form.step === 2);
      console.log('Step 4 - Using business data:', businessData);
      return businessData;
    }
    console.log(`Step ${currentStep} - Using step data:`, currentStepData);
    return currentStepData;
  };
  
  const actualStepData = getCurrentStepData();
  
  // Debug logging for step progression
  useEffect(() => {
    console.log(`Current step: ${currentStep}`);
    console.log(`Step data:`, actualStepData);
    console.log(`Schema forms:`, schema.forms);
  }, [currentStep, actualStepData, schema.forms]);
  
  // Create Zod schema for current step
  const currentStepSchema = currentStepData ? stepToZodSchema(currentStepData) : z.object({});
  
  // Create OTP schema for step 2
  const otpSchema = z.object({
    otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^[0-9]{6}$/, 'OTP must contain only digits')
  });

  // Create PAN verification schema for step 3
  const panSchema = z.object({
    pan: z.string().length(10, 'PAN must be exactly 10 characters').regex(/^[A-Za-z]{5}[0-9]{4}[A-Za-z]$/, 'PAN format is invalid'),
    businessType: z.string().min(1, 'Type of Organisation is required'),
    aadhaarName: z.string().min(1, 'Name of PAN Holder is required'),
    dateOfBirth: z.string().min(1, 'Date of Birth/Incorporation is required')
  });
  
  // Use appropriate schema based on current step
  let finalSchema;
  if (currentStep === 1) {
    // Step 1: Aadhaar verification - use schema step 1
    finalSchema = currentStepSchema;
  } else if (currentStep === 2) {
    // Step 2: OTP verification
    finalSchema = otpSchema;
  } else if (currentStep === 3) {
    // Step 3: PAN verification
    finalSchema = panSchema;
  } else if (currentStep === 4) {
    // Step 4: Business details - use schema step 2
    const businessStepData = schema.forms.find(form => form.step === 2);
    finalSchema = businessStepData ? stepToZodSchema(businessStepData) : z.object({});
  } else {
    finalSchema = z.object({});
  }
  
  // Initialize form
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    reset
  } = useForm({
    resolver: zodResolver(finalSchema),
    mode: 'onChange'
  });

  // Reset form on step change
  useEffect(() => {
    if (currentStep === 2 || currentStep === 3 || currentStep === 4) {
      reset();
    }
  }, [currentStep, reset]);

  // Set default values for business details step
  useEffect(() => {
    if (currentStep === 4 && step1Data.businessType && step1Data.aadhaarName) {
      // Pre-fill some fields that were already collected
      setValue('businessType', step1Data.businessType);
      setValue('aadhaarName', step1Data.aadhaarName);
    }
  }, [currentStep, step1Data, setValue]);

  // Watch pincode field for auto-fill
  const pincode = watch('pincode') as string | undefined;

  // Auto-fill city and state based on pincode
  useEffect(() => {
    if (pincode && typeof pincode === 'string' && pincode.length === 6 && currentStep === 4) {
      const lookupPincode = async () => {
        try {
          const result = await pincodeAPI.lookupPincode(pincode);
          if (result.success) {
            setValue('city', result.city);
            setValue('state', result.state);
          }
        } catch (error) {
          console.log('Pincode lookup failed:', error);
        }
      };
      
      // Debounce the API call
      const timeoutId = setTimeout(lookupPincode, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [pincode, currentStep, setValue]);

  // Handle form submission
  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (currentStep === 1) {
        // Step 1: Aadhaar verification
        console.log('Debug - Step 1 data received:', data);
        const response = await registrationAPI.submitStep1(data);
        console.log('Debug - Step 1 API response:', response);
        setStep1Data(data);
        setRegistrationId(response.data.registrationId);
        setIsOtpEnabled(true);
        setSuccess('Aadhaar verification successful! Please enter OTP to complete verification.');
        setCurrentStep(2); // Move to OTP verification
      } else if (currentStep === 2) {
        // Step 2: OTP verification
        console.log('Debug - OTP verification data:', data);
        const response = await registrationAPI.verifyOtp({
          aadhaar: step1Data.aadhaar,
          otp: data.otp
        });
        setSuccess('OTP verified successfully! Aadhaar has been verified. Now please verify your PAN.');
        setCurrentStep(3); // Move to PAN verification
        reset(); // Reset form for PAN step
      } else if (currentStep === 3) {
        // Step 3: PAN verification
        console.log('Debug - PAN verification data:', data);
        const response = await registrationAPI.verifyPan(data);
        if (response.success) {
          setPanData(response.data);
          setIsPanVerified(true);
          // Store the additional PAN verification data
          setStep1Data((prev: any) => ({
            ...prev,
            businessType: data.businessType,
            aadhaarName: data.aadhaarName,
            dateOfBirth: data.dateOfBirth
          }));
          setSuccess('PAN verified successfully! Now please complete your business details.');
          setCurrentStep(4); // Move to business details
        } else {
          setError(response.error || 'PAN verification failed');
        }
      } else if (currentStep === 4) {
        // Step 4: Business details
        console.log('Debug - Business details data:', data);
        const step4Data = {
          ...data,
          registrationId: registrationId
        };
        const response = await registrationAPI.submitStep2(step4Data);
        setSuccess('Business details submitted successfully! Registration completed.');
        // Registration complete
      }
    } catch (error: any) {
      console.error('Form submission error:', error);
      setError(error.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render field based on type
  const renderField = (field: FormField) => {
    const fieldError = errors[field.name as keyof typeof errors] as any;
    
    switch (field.type) {
      case 'select':
        return (
          <SelectField
            key={field.name}
            field={field}
            control={control}
            error={fieldError}
          />
        );
      
      case 'otp':
        return (
          <OTPField
            key={field.name}
            field={field}
            control={control}
            error={fieldError}
            isEnabled={isOtpEnabled}
          />
        );
      
      default:
        return (
          <TextField
            key={field.name}
            field={field}
            control={control}
            error={fieldError}
          />
        );
    }
  };

  // Get step title
  const getStepTitle = () => {
    if (currentStep === 1) return 'Aadhaar Verification';
    if (currentStep === 2) return 'OTP Verification';
    if (currentStep === 3) return 'PAN Verification';
    if (currentStep === 4) return 'Business Details';
    return `Step ${currentStep}`;
  };
  
  // Get step description
  const getStepDescription = () => {
    if (currentStep === 1) {
      return 'Please enter your Aadhaar number and name for verification';
    }
    if (currentStep === 2) {
      return 'Enter the 6-digit OTP sent to your Aadhaar-linked mobile number';
    }
    if (currentStep === 3) {
      return 'Enter your PAN number and additional details to verify your identity';
    }
    if (currentStep === 4) {
      return 'Please fill in your business details to complete the registration';
    }
    return `Please complete step ${currentStep}`;
  };

  return (
    <div className={`max-w-2xl mx-auto p-6 ${className}`}>
      {/* Progress Bar */}
      <ProgressBar 
        currentStep={currentStep} 
        totalSteps={4} 
        className="mb-8"
      />

      {/* Step Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {getStepTitle()}
        </h1>
        <p className="text-gray-600">
          {getStepDescription()}
        </p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {getStepTitle()}
        </h2>
        <p className="text-gray-600 mb-6">
          {getStepDescription()}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Render fields for current step */}
          {currentStep === 1 ? (
            // Step 1: Aadhaar verification - render from schema
            actualStepData?.fields?.map((field: FormField) => {
              switch (field.type) {
                case 'text':
                  return (
                    <TextField
                      key={field.name}
                      field={field}
                      control={control}
                      error={errors[field.name as keyof typeof errors] as any}
                    />
                  );
                case 'select':
                  return (
                    <SelectField
                      key={field.name}
                      field={field}
                      control={control}
                      error={errors[field.name as keyof typeof errors] as any}
                    />
                  );
                default:
                  return null;
              }
            })
          ) : currentStep === 2 ? (
            // Step 2: OTP verification
            <OTPField
              field={{
                name: 'otp',
                id: 'txtOTP',
                label: 'OTP',
                type: 'otp',
                required: true,
                maxlength: 6,
                placeholder: 'Enter 6 digit OTP'
              }}
              control={control}
              error={errors.otp as any}
              isEnabled={true}
            />
          ) : currentStep === 3 ? (
            // Step 3: PAN verification
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PAN Number / पैन नंबर
                </label>
                <input
                  type="text"
                  {...control.register('pan')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ABCDE1234F"
                  maxLength={10}
                />
                {errors.pan && (
                  <p className="text-red-600 text-sm mt-1">{errors.pan.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  3. Type of Organisation / संगठन के प्रकार
                </label>
                <select
                  {...control.register('businessType')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Type of Organisation</option>
                  <option value="1">1. Proprietorship / एकल स्वामित्व</option>
                  <option value="2">2. Partnership / साझेदारी</option>
                  <option value="3">3. Hindu Undivided Family / हिंदू अविभाजित परिवार</option>
                  <option value="4">4. Private Limited Company / निजी सीमित कंपनी</option>
                  <option value="5">5. Public Limited Company / सार्वजनिक सीमित कंपनी</option>
                  <option value="6">6. Limited Liability Partnership / सीमित देयता साझेदारी</option>
                  <option value="7">7. Self Help Group / स्वयं सहायता समूह</option>
                  <option value="8">8. Cooperative Society / सहकारी समिति</option>
                  <option value="9">9. Trust / ट्रस्ट</option>
                  <option value="10">10. Other / अन्य</option>
                </select>
                {errors.businessType && (
                  <p className="text-red-600 text-sm mt-1">{errors.businessType.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  4.1.1 Name of PAN Holder / पैन धारक का नाम
                </label>
                <input
                  type="text"
                  {...control.register('aadhaarName')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter name as per PAN"
                />
                {errors.aadhaarName && (
                  <p className="text-red-600 text-sm mt-1">{errors.aadhaarName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  4.1.2 DOB or DOI as per PAN / पैन के अनुसार जन्म तिथि या निगमन तिथि
                </label>
                <input
                  type="date"
                  {...control.register('dateOfBirth')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.dateOfBirth && (
                  <p className="text-red-600 text-sm mt-1">{errors.dateOfBirth.message}</p>
                )}
              </div>
              
              {panData && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <p className="text-green-800 text-sm">
                    PAN verified successfully! PAN: {panData.pan}, Name: {panData.name}
                  </p>
                </div>
              )}
            </div>
          ) : currentStep === 4 ? (
            // Step 4: Business details - render from schema step 2
            (() => {
              const businessStepData = schema.forms.find(form => form.step === 2);
              return businessStepData?.fields?.map((field: FormField) => {
                // Pre-fill some fields if we have the data
                let defaultValue = '';
                if (field.name === 'businessType' && step1Data.businessType) {
                  defaultValue = step1Data.businessType;
                } else if (field.name === 'aadhaarName' && step1Data.aadhaarName) {
                  defaultValue = step1Data.aadhaarName;
                }
                
                switch (field.type) {
                  case 'text':
                    return (
                      <TextField
                        key={field.name}
                        field={field}
                        control={control}
                        error={errors[field.name as keyof typeof errors] as any}
                      />
                    );
                  case 'select':
                    return (
                      <SelectField
                        key={field.name}
                        field={field}
                        control={control}
                        error={errors[field.name as keyof typeof errors] as any}
                      />
                    );
                  default:
                    return null;
                }
              });
            })()
          ) : (
            // Fallback - should not reach here
            <div className="text-center text-gray-500">
              <p>Step not found</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-6">
            <button
              type="button"
              onClick={() => {
                if (currentStep === 2) {
                  setCurrentStep(1);
                  setIsOtpEnabled(false);
                } else if (currentStep === 3) {
                  setCurrentStep(2);
                } else if (currentStep === 4) {
                  setCurrentStep(3);
                }
                reset();
                setSuccess(null); // Clear success message
                setError(null); // Also clear any error messages
              }}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Previous
            </button>

            <button
              type="submit"
              disabled={!isValid || isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Processing...' : (
                currentStep === 1 ? 'Verify Aadhaar' :
                currentStep === 2 ? 'Verify OTP' :
                currentStep === 3 ? 'Verify PAN' :
                'Complete Registration'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DynamicForm;





import React, { useState, useRef, useEffect } from 'react';
import { Control, Controller, FieldError } from 'react-hook-form';
import { FormField } from '@/lib/validation';
import { mockOtpAPI } from '@/lib/api';

interface OTPFieldProps {
  field: FormField;
  control: Control<any>;
  error?: FieldError;
  className?: string;
  isEnabled?: boolean;
}

const OTPField: React.FC<OTPFieldProps> = ({ 
  field, 
  control, 
  error, 
  className = '',
  isEnabled = true 
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [showMockOtp, setShowMockOtp] = useState(false);

  useEffect(() => {
    // Initialize input refs
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6);
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')]);
      
      // Focus last filled input
      const lastFilledIndex = Math.min(newOtp.length - 1, 5);
      inputRefs.current[lastFilledIndex]?.focus();
    }
  };

  const fillMockOtp = () => {
    const mockOtp = mockOtpAPI.getMockOtp();
    if (mockOtp) {
      const otpArray = mockOtp.split('');
      setOtp([...otpArray, ...Array(6 - otpArray.length).fill('')]);
      setShowMockOtp(true);
      
      // Update form value
      setTimeout(() => {
        const event = new Event('input', { bubbles: true });
        inputRefs.current[5]?.dispatchEvent(event);
      }, 100);
    }
  };

  return (
    <div className={`mb-4 ${className}`}>
      <label 
        htmlFor={field.id} 
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <Controller
        name={field.name}
        control={control}
        render={({ field: { onChange, onBlur, value, ref } }) => (
          <div>
            <div className="flex gap-2 justify-center mb-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    handleOtpChange(index, e.target.value);
                    // Update form value
                    const newOtp = [...otp];
                    newOtp[index] = e.target.value;
                    onChange(newOtp.join(''));
                  }}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  onBlur={onBlur}
                  disabled={!isEnabled}
                  className={`
                    w-12 h-12 text-center text-lg font-semibold border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    ${error ? 'border-red-300' : 'border-gray-300'}
                    ${!isEnabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}
                  `}
                />
              ))}
            </div>
            
            {/* Hidden input for form control */}
            <input
              ref={ref}
              type="hidden"
              value={otp.join('')}
              onChange={(e) => onChange(e.target.value)}
            />
            
            {/* Mock OTP button for development */}
            {mockOtpAPI.isMockEnabled() && !showMockOtp && (
              <button
                type="button"
                onClick={fillMockOtp}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Use Mock OTP (123456)
              </button>
            )}
            
            {showMockOtp && (
              <p className="text-sm text-green-600 mb-2">
                ✓ Mock OTP filled: 123456
              </p>
            )}
          </div>
        )}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error.message}
        </p>
      )}
      
      <p className="text-xs text-gray-500 mt-2">
        Enter the 6-digit OTP to verify your Aadhaar
      </p>
    </div>
  );
};

export default OTPField;





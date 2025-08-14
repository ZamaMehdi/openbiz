import React from 'react';
import { Control, Controller, FieldError } from 'react-hook-form';
import { FormField } from '@/lib/validation';

interface TextFieldProps {
  field: FormField;
  control: Control<any>;
  error?: FieldError;
  className?: string;
}

const TextField: React.FC<TextFieldProps> = ({ field, control, error, className = '' }) => {
  const isTextarea = field.type === 'textarea';
  const isEmail = field.type === 'email';
  const Component = isTextarea ? 'textarea' : 'input';

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
          <Component
            id={field.id}
            ref={ref}
            type={isTextarea ? undefined : (isEmail ? 'email' : field.type)}
            value={value || ''}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={field.placeholder}
            maxLength={field.maxlength}
            className={`
              w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${error ? 'border-red-300' : 'border-gray-300'}
              ${isTextarea ? 'min-h-[100px] resize-vertical' : ''}
              disabled:bg-gray-50 disabled:text-gray-500
            `}
            disabled={field.name === 'otp' && !value} // Disable OTP field until Aadhaar is submitted
          />
        )}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error.message}
        </p>
      )}
      
      {field.maxlength && (
        <p className="mt-1 text-xs text-gray-500">
          Max {field.maxlength} characters
        </p>
      )}
    </div>
  );
};

export default TextField;






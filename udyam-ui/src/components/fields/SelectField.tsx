import React from 'react';
import { Control, Controller, FieldError } from 'react-hook-form';
import { FormField } from '@/lib/validation';

interface SelectFieldProps {
  field: FormField;
  control: Control<any>;
  error?: FieldError;
  className?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({ field, control, error, className = '' }) => {
  if (!field.options || field.options.length === 0) {
    console.warn(`SelectField: No options provided for field ${field.name}`);
    return null;
  }

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
          <select
            id={field.id}
            ref={ref}
            value={value || ''}
            onChange={onChange}
            onBlur={onBlur}
            className={`
              w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${error ? 'border-red-300' : 'border-gray-300'}
              disabled:bg-gray-50 disabled:text-gray-500
            `}
          >
            <option value="">Select {field.label.toLowerCase()}</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default SelectField;






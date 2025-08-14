import { z } from 'zod';

export interface FormField {
  name: string;
  id: string;
  label: string;
  type: string;
  required: boolean;
  pattern?: string;
  maxlength?: number;
  placeholder?: string;
  options?: string[];
}

export interface FormStep {
  step: number;
  title: string;
  fields: FormField[];
}

export interface UdyamSchema {
  forms: FormStep[];
  metadata: {
    scrapedAt: string;
    source: string;
    version: string;
  };
}

// Convert form field to Zod schema
export function fieldToZodSchema(field: FormField): z.ZodTypeAny {
  let schema: z.ZodTypeAny;

  switch (field.type) {
    case 'text':
    case 'textarea':
      schema = z.string().min(1, `${field.label} is required`);
      if (field.maxlength) {
        schema = (schema as z.ZodString).max(field.maxlength, `${field.label} must be at most ${field.maxlength} characters`);
      }
      if (field.pattern) {
        const regex = new RegExp(field.pattern);
        schema = (schema as z.ZodString).regex(regex, `${field.label} format is invalid`);
      }
      break;

    case 'email':
      schema = z.string().email(`${field.label} must be a valid email address`);
      if (field.maxlength) {
        schema = (schema as z.ZodString).max(field.maxlength, `${field.label} must be at most ${field.maxlength} characters`);
      }
      break;

    case 'tel':
      schema = z.string().min(1, `${field.label} is required`);
      if (field.pattern) {
        const regex = new RegExp(field.pattern);
        schema = (schema as z.ZodString).regex(regex, `${field.label} format is invalid`);
      }
      break;

    case 'select':
      if (field.options && field.options.length > 0) {
        schema = z.enum(field.options as [string, ...string[]], {
          errorMap: () => ({ message: `Please select a valid ${field.label.toLowerCase()}` })
        });
      } else {
        schema = z.string().min(1, `${field.label} is required`);
      }
      break;

    default:
      schema = z.string().min(1, `${field.label} is required`);
  }

  // Make field optional if not required
  if (!field.required) {
    schema = schema.optional();
  }

  return schema;
}

// Convert entire form step to Zod schema
export function stepToZodSchema(step: FormStep): z.ZodObject<any> {
  const schemaObject: Record<string, z.ZodTypeAny> = {};
  
  step.fields.forEach(field => {
    schemaObject[field.name] = fieldToZodSchema(field);
  });

  return z.object(schemaObject);
}

// Convert entire form to Zod schema
export function schemaToZodSchema(schema: UdyamSchema): Record<number, z.ZodObject<any>> {
  const result: Record<number, z.ZodObject<any>> = {};
  
  schema.forms.forEach(form => {
    result[form.step] = stepToZodSchema(form);
  });

  return result;
}

// Specific validation schemas for common fields
export const aadhaarSchema = z.string()
  .length(12, 'Aadhaar number must be exactly 12 digits')
  .regex(/^[0-9]{12}$/, 'Aadhaar number must contain only digits');

export const panSchema = z.string()
  .length(10, 'PAN must be exactly 10 characters')
  .regex(/^[A-Za-z]{5}[0-9]{4}[A-Za-z]$/, 'PAN format is invalid');

export const mobileSchema = z.string()
  .length(10, 'Mobile number must be exactly 10 digits')
  .regex(/^[0-9]{10}$/, 'Mobile number must contain only digits');

export const pincodeSchema = z.string()
  .length(6, 'PIN code must be exactly 6 digits')
  .regex(/^[0-9]{6}$/, 'PIN code must contain only digits');

export const otpSchema = z.string()
  .length(6, 'OTP must be exactly 6 digits')
  .regex(/^[0-9]{6}$/, 'OTP must contain only digits');






import puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

interface FormField {
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

interface FormStep {
  step: number;
  title: string;
  fields: FormField[];
}

interface UdyamSchema {
  forms: FormStep[];
  metadata: {
    scrapedAt: string;
    source: string;
    version: string;
  };
}

async function scrapeUdyamForm(): Promise<UdyamSchema> {
  const browser = await puppeteer.launch({
    headless: false, // Set to true for production
    defaultViewport: { width: 1280, height: 720 }
  });

  try {
    const page = await browser.newPage();
    
    // Navigate to Udyam registration page
    // Note: Replace with actual Udyam registration URL
    await page.goto('https://udyamregistration.gov.in/Udyam_Login.aspx', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('Page loaded, starting to scrape...');

    // Wait for the form to load
    await page.waitForSelector('form', { timeout: 10000 });

    // Extract form fields from Step 1 (Aadhaar verification)
    const step1Fields = await page.evaluate(() => {
      const fields: FormField[] = [];
      
      // Aadhaar field
      const aadhaarInput = document.querySelector('input[name*="aadhaar"], input[id*="aadhaar"], input[placeholder*="aadhaar"]') as HTMLInputElement;
      if (aadhaarInput) {
        fields.push({
          name: 'aadhaar',
          id: aadhaarInput.id || 'txtAadhaar',
          label: 'Aadhaar Number',
          type: 'text',
          required: true,
          pattern: '^[0-9]{12}$',
          maxlength: 12,
          placeholder: aadhaarInput.placeholder || 'Enter 12 digit Aadhaar number'
        });
      }

      // OTP field (if present)
      const otpInput = document.querySelector('input[name*="otp"], input[id*="otp"], input[placeholder*="otp"]') as HTMLInputElement;
      if (otpInput) {
        fields.push({
          name: 'otp',
          id: otpInput.id || 'txtOTP',
          label: 'OTP',
          type: 'text',
          required: true,
          maxlength: 6,
          placeholder: otpInput.placeholder || 'Enter OTP'
        });
      }

      // Mobile number field
      const mobileInput = document.querySelector('input[name*="mobile"], input[name*="phone"], input[type="tel"]') as HTMLInputElement;
      if (mobileInput) {
        fields.push({
          name: 'mobile',
          id: mobileInput.id || 'txtMobile',
          label: 'Mobile Number',
          type: 'tel',
          required: true,
          pattern: '^[0-9]{10}$',
          maxlength: 10,
          placeholder: mobileInput.placeholder || 'Enter 10 digit mobile number'
        });
      }

      return fields;
    });

    console.log('Step 1 fields extracted:', step1Fields);

    // Navigate to Step 2 (PAN details) if possible
    // This might require form submission or navigation
    let step2Fields: FormField[] = [];
    
    try {
      // Try to find PAN field on current page
      step2Fields = await page.evaluate(() => {
        const fields: FormField[] = [];
        
        // PAN field
        const panInput = document.querySelector('input[name*="pan"], input[id*="pan"], input[placeholder*="pan"]') as HTMLInputElement;
        if (panInput) {
          fields.push({
            name: 'pan',
            id: panInput.id || 'txtPAN',
            label: 'PAN',
            type: 'text',
            required: false,
            pattern: '^[A-Za-z]{5}[0-9]{4}[A-Za-z]$',
            maxlength: 10,
            placeholder: panInput.placeholder || 'Enter PAN number'
          });
        }

        // Business name field
        const businessNameInput = document.querySelector('input[name*="business"], input[name*="company"], input[name*="firm"]') as HTMLInputElement;
        if (businessNameInput) {
          fields.push({
            name: 'businessName',
            id: businessNameInput.id || 'txtBusinessName',
            label: 'Business Name',
            type: 'text',
            required: true,
            maxlength: 100,
            placeholder: businessNameInput.placeholder || 'Enter business/company name'
          });
        }

        // PIN code field
        const pinInput = document.querySelector('input[name*="pin"], input[name*="pincode"], input[name*="postal"]') as HTMLInputElement;
        if (pinInput) {
          fields.push({
            name: 'pincode',
            id: pinInput.id || 'txtPincode',
            label: 'PIN Code',
            type: 'text',
            required: true,
            pattern: '^[0-9]{6}$',
            maxlength: 6,
            placeholder: pinInput.placeholder || 'Enter 6 digit PIN code'
          });
        }

        return fields;
      });
    } catch (error) {
      console.log('Step 2 fields not found on current page:', error.message);
    }

    console.log('Step 2 fields extracted:', step2Fields);

    // Create the schema
    const schema: UdyamSchema = {
      forms: [
        {
          step: 1,
          title: 'Aadhaar Verification',
          fields: step1Fields
        },
        {
          step: 2,
          title: 'Business Details',
          fields: step2Fields
        }
      ],
      metadata: {
        scrapedAt: new Date().toISOString(),
        source: 'Udyam Registration Portal',
        version: '1.0.0'
      }
    };

    return schema;

  } finally {
    await browser.close();
  }
}

async function main() {
  try {
    console.log('Starting Udyam form scraping...');
    
    const schema = await scrapeUdyamForm();
    
    // Save schema to file
    const outputPath = path.join(__dirname, '..', 'udyam_steps_schema.json');
    fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2));
    
    console.log('Schema saved to:', outputPath);
    console.log('Scraping completed successfully!');
    
    // Also save to schema directory in project root
    const projectSchemaPath = path.join(__dirname, '..', '..', 'schema', 'udyam-step1-2.json');
    
    // Ensure schema directory exists
    const schemaDir = path.dirname(projectSchemaPath);
    if (!fs.existsSync(schemaDir)) {
      fs.mkdirSync(schemaDir, { recursive: true });
    }
    
    fs.writeFileSync(projectSchemaPath, JSON.stringify(schema, null, 2));
    console.log('Schema also saved to project root:', projectSchemaPath);
    
  } catch (error) {
    console.error('Scraping failed:', error);
    process.exit(1);
  }
}

// Run the scraper
if (require.main === module) {
  main();
}

export { scrapeUdyamForm, FormField, FormStep, UdyamSchema };






import React from 'react';
import clsx from 'clsx';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  currentStep, 
  totalSteps, 
  className = '' 
}) => {
  const progress = (currentStep / totalSteps) * 100;
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className={`w-full ${className}`}>
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(progress)}% Complete
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex justify-between items-center">
        {steps.map((step) => (
          <div key={step} className="flex flex-col items-center">
            <div
              className={clsx(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all duration-200',
                {
                  'bg-blue-600 border-blue-600 text-white': step <= currentStep,
                  'bg-white border-gray-300 text-gray-500': step > currentStep,
                  'ring-4 ring-blue-200': step === currentStep,
                }
              )}
            >
              {step < currentStep ? '✓' : step}
            </div>
            <span 
              className={clsx(
                'text-xs mt-1 text-center transition-colors duration-200',
                {
                  'text-blue-600 font-medium': step <= currentStep,
                  'text-gray-500': step > currentStep,
                }
              )}
            >
              {step === 1 ? 'Aadhaar' : step === 2 ? 'Step 2' : step === 3 ? 'PAN' : `Step ${step}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;






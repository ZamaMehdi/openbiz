import React, { useState } from 'react';
import { registrationAPI } from '../lib/api';

interface PANData {
  pan: string;
  name: string;
  dateOfBirth: string;
  type: string;
  status: string;
  verified: boolean;
}

const PANVerification: React.FC = () => {
  const [pan, setPan] = useState('');
  const [panData, setPanData] = useState<PANData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [consent, setConsent] = useState(false);

  const handlePANVerification = async () => {
    if (!pan.trim()) {
      setError('Please enter PAN number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await registrationAPI.verifyPan({ pan: pan.trim() });
      
      if (response.success) {
        setPanData(response.data);
        setError('');
      } else {
        setError(response.error || 'PAN verification failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to verify PAN');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (!consent) {
      setError('Please accept the consent to continue');
      return;
    }
    // Handle navigation to next step
    console.log('PAN verified, proceeding to next step');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 rounded-t-lg">
        <h1 className="text-2xl font-bold">PAN Verification</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* PAN Input Section */}
        {!panData && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter PAN Number
              </label>
              <input
                type="text"
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={10}
              />
            </div>
            
            <button
              onClick={handlePANVerification}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Verifying...' : 'Verify PAN'}
            </button>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
          </div>
        )}

        {/* Verified PAN Data Display */}
        {panData && (
          <div className="space-y-6">
            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-green-800">
                Your PAN has been successfully verified. Some fields of the form will be disabled. 
                Disabled fields will be automatically filled after verification from PAN data.
              </p>
            </div>

            {/* GSTIN Advisory */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-blue-800 text-sm">
                GSTIN (As per applicability of CGST Act 2017 and as notified by the ministry of MSME 
                vide S.O. 1055(E) dated 05th March 2021) is required for Udyam Registration w.e.f. 01.04.2021. 
                You are advised to apply for GSTIN suitably to avoid any inconvenience.
              </p>
            </div>

            {/* PAN Details Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  4.1 PAN / पैन
                </label>
                <input
                  type="text"
                  value={panData.pan}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  4.1.1 Name of PAN Holder / पैन धारक का नाम
                </label>
                <input
                  type="text"
                  value={panData.name}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  4.1.2 DOB or DOI as per PAN / पैन के अनुसार जन्म तिथि या निगमन तिथि
                </label>
                <input
                  type="text"
                  value={panData.dateOfBirth}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type of Organisation / संगठन के प्रकार
                </label>
                <input
                  type="text"
                  value={panData.type}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
              </div>
            </div>

            {/* Consent Section */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="consent" className="text-sm text-gray-700">
                  I, the holder of the above PAN, hereby give my consent to Ministry of MSME, 
                  Government of India, for using my data/information available in the Income Tax 
                  Returns filed by me, and also the same available in the GST Returns and also 
                  from other Government organizations, for MSME classification and other official 
                  purposes, in pursuance of the MSMED Act, 2006.
                </label>
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              disabled={!consent}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-lg font-medium"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PANVerification;


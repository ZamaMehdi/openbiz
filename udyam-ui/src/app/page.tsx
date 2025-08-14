'use client';

import { useState, useEffect } from 'react';
import DynamicForm from '@/components/DynamicForm';
import { UdyamSchema } from '@/lib/validation';

export default function Home() {
  const [schema, setSchema] = useState<UdyamSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load schema from local file (in production, this would come from an API)
    const loadSchema = async () => {
      try {
        // For now, we'll use the schema we created
        // In production, this would be fetched from an API endpoint
        const response = await fetch('/schema/udyam-step1-2.json');
        if (!response.ok) {
          throw new Error('Failed to load form schema');
        }
        const schemaData = await response.json();
        setSchema(schemaData);
      } catch (err) {
        console.error('Error loading schema:', err);
        setError('Failed to load form. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    loadSchema();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading registration form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!schema) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Form not available</h1>
          <p className="text-gray-600">The registration form schema could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">
                  MSME Registration Portal
                </h1>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                className="px-4 py-2 rounded-md bg-blue-600 text-white"
              >
                Registration Form
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        <DynamicForm schema={schema} />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            <p>MSME Registration System. All rights reserved.</p>
            <p className="mt-1">
              This is a demonstration application for educational purposes.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

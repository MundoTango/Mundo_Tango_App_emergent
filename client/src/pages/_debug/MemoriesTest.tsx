
import React from 'react';
import { Helmet } from 'react-helmet';

const MemoriesTest = () => {
  console.log('🧪 MemoriesTest component rendering');
  
  return (
    <>
      <Helmet>
        <title>Memories Test | Life CEO</title>
      </Helmet>
      
    <div className="min-h-screen bg-green-100 p-8">
      <h1 className="text-green-800 text-4xl font-bold mb-4">✅ MEMORIES TEST PAGE WORKING</h1>
      <p className="text-green-700 text-xl">This proves React routing and rendering is functional.</p>
      <div className="mt-8 p-4 bg-white rounded-lg shadow dark:bg-neutral-900">
        <h2 className="text-2xl font-bold mb-2">Debug Info:</h2>
        <ul className="space-y-2">
          <li><strong>URL:</strong> {window.location.pathname}</li>
          <li><strong>Timestamp:</strong> {new Date().toISOString()}</li>
          <li><strong>Component:</strong> MemoriesTest.tsx</li>
        </ul>
      </div>
    </div>
  
    </>
  );
};

export default MemoriesTest;

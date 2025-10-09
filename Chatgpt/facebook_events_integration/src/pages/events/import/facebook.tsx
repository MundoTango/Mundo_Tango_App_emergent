import React from "react";

export default function FacebookImportPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Import Events from Facebook</h1>
      <p className="mt-2 opacity-80">Connect your Facebook Page and choose events to import.</p>
      <a className="inline-block mt-6 rounded-xl px-4 py-2 bg-cyan-300 text-slate-900"
         href="/api/auth/facebook/start">Connect Facebook</a>
    </div>
  );
}

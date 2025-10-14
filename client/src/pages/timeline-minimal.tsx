import React from 'react';
import { useTranslation } from 'react-i18next';

export default function TimelineMinimal() {
  const { t } = useTranslation();
  return (
    <div style={{ padding: '50px', backgroundColor: 'lightgreen', color: 'black' }}>
      <h1>Timeline Minimal Test</h1>
      <p>If you can see this green box, routing works!</p>
      <p>Current URL: {window.location.pathname}</p>
    </div>
  );
}
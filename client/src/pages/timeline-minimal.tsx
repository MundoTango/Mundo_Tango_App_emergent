import React from 'react';
import { Helmet } from 'react-helmet';

export default function TimelineMinimal() {
  return (
    <>
      <Helmet>
        <title>Timeline Minimal | Life CEO</title>
      </Helmet>
      
    <div style={{ padding: '50px', backgroundColor: 'lightgreen', color: 'black' }}>
      <h1>Timeline Minimal Test</h1>
      <p>If you can see this green box, routing works!</p>
      <p>Current URL: {window.location.pathname}</p>
    </div>
  
    </>
  );
}
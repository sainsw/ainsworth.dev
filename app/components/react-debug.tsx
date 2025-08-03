'use client';

import React from 'react';

export function ReactDebug() {
  if (process.env.NODE_ENV === 'production') {
    // Only show in development or add a debug flag
    return null;
  }

  const reactVersion = React.version;
  
  // Check for multiple React instances
  const reactInstances: string[] = [];
  
  try {
    // @ts-ignore - accessing internal React properties for debugging
    if (typeof window !== 'undefined' && window.React) {
      // @ts-ignore
      reactInstances.push(`Window React: ${window.React.version || 'unknown'}`);
    }
    
    // Check if there are multiple react packages
    reactInstances.push(`Import React: ${reactVersion}`);
    
    // @ts-ignore - check if React is on global scope differently
    if (typeof globalThis !== 'undefined' && globalThis.React) {
      // @ts-ignore
      reactInstances.push(`Global React: ${globalThis.React.version || 'unknown'}`);
    }
  } catch (error) {
    console.error('Error checking React versions:', error);
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      right: 0, 
      background: 'red', 
      color: 'white', 
      padding: '10px',
      zIndex: 9999,
      fontSize: '12px'
    }}>
      <div>React Version: {reactVersion}</div>
      {reactInstances.map((instance, i) => (
        <div key={i}>{instance}</div>
      ))}
    </div>
  );
}
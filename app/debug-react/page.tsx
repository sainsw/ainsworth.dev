import React from 'react';
import { ReactDebug } from 'app/components/react-debug';

export default function DebugReactPage() {
  return (
    <div>
      <ReactDebug />
      <h1>React Debug Page</h1>
      <p>This page is for debugging React version conflicts.</p>
      <p>React version: {React.version}</p>
    </div>
  );
}
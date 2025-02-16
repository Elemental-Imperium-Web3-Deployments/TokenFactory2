import React from 'react';
// ...existing code...

const LoadingState = ({ isLoading, error }) => {
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // ...existing code...
};

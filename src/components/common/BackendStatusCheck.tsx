import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

const TEST_QUERY = gql`
  query TestQuery {
    __typename
  }
`;

const BackendStatusCheck: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const { loading, error } = useQuery(TEST_QUERY, {
    onCompleted: () => setStatus('connected'),
    onError: () => setStatus('error')
  });

  useEffect(() => {
    if (!loading && !error) {
      setStatus('connected');
    } else if (error) {
      setStatus('error');
      console.error('Backend connection error:', error);
    }
  }, [loading, error]);

  if (status === 'checking') {
    return (
      <div className="fixed bottom-4 right-4 bg-yellow-100 text-yellow-800 p-2 rounded-md shadow">
        Checking backend connection...
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="fixed bottom-4 right-4 bg-red-100 text-red-800 p-2 rounded-md shadow">
        Backend connection failed. Make sure the backend service is running.
      </div>
    );
  }

  return null; // Don't show anything if connected successfully
};

export default BackendStatusCheck;

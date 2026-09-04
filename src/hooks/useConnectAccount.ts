import { useState } from 'react';
import { connectAccount } from '../api/accounts';
import { ApiError } from '../api/client';

/**
 * Web equivalent of the mobile expo-web-browser auth session: open the bank
 * link flow in a popup and refresh once the user closes/completes it.
 */
export function useConnectAccount(onDone?: () => void) {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  const connect = async () => {
    setConnecting(true);
    setError(null);
    try {
      const res = await connectAccount();
      setUrl(res.data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not start bank connection');
    } finally {
      setConnecting(false);
    }
  };

  const close = () => {
    setUrl(null);
    onDone?.();
  };

  return { connecting, error, connect, url, isOpen: !!url, close };
}

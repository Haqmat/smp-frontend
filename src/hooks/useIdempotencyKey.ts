import { useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/** Returns a stable idempotency key per form session (generated once on mount). */
export function useIdempotencyKey(): string {
  const { user } = useAuth();
  const keyRef = useRef<string | null>(null);

  if (!keyRef.current) {
    const username = user?.username ?? 'user';
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();
    keyRef.current = `${username}_${timestamp}_${random}`;
  }

  return keyRef.current;
}

// EM: app/admin/_layout.tsx
import { Stack, router } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useEffect } from 'react';

export default function AdminLayout() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/admin/login');
    }
  }, [isAuthenticated]);

  return <Stack />;
}
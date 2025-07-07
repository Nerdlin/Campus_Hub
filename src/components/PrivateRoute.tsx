'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: 'student' | 'teacher' | 'admin';
}

export default function PrivateRoute({ children, requiredRole }: PrivateRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (requiredRole && user.role !== requiredRole) {
        // Redirect to appropriate dashboard based on user role
        switch (user.role) {
          case 'admin':
            router.push('/admin-dashboard');
            break;
          case 'teacher':
            router.push('/teacher-dashboard');
            break;
          case 'student':
            router.push('/student-dashboard');
            break;
        }
      }
    }
  }, [user, isLoading, requiredRole, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  if (requiredRole && user.role !== requiredRole) {
    return null; // Will redirect to appropriate dashboard
  }

  return <>{children}</>;
} 
"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
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
        default:
          router.push('/login');
      }
    } else if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return null; // This will be replaced by the redirect
}

"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/lib/api';
import { motion } from 'framer-motion';
import { LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function Login() {
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
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
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setIsLoading(true);
      setError('');
      try {
        const userData = await authApi.login({ email, password });
        login(userData);
        // Redirect will be handled by useEffect
      } catch (err: any) {
        setError(err.response?.data?.error || err.message || 'Ошибка входа');
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('Пожалуйста, введите email и пароль');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          Вход в систему
        </h2>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 text-sm text-center rounded-md"
          >
            {error}
          </motion.div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Email
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400">
                <EnvelopeIcon className="h-5 w-5" />
              </span>
              <input
                type="email"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-10 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@email.com"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Пароль
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400">
                <LockClosedIcon className="h-5 w-5" />
              </span>
              <input
                type="password"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-10 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Введите пароль"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={!email || !password || isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold text-lg shadow hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Вход...' : 'Войти'}
          </button>
        </form>
        
        <div className="flex justify-between mt-6 text-sm">
          <Link 
            href="/register" 
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Регистрация
          </Link>
          <Link 
            href="/forgot-password" 
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Забыли пароль?
          </Link>
        </div>
      </motion.div>
    </div>
  );
} 
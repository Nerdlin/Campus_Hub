"use client";
import React, { useState } from 'react';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { authApi } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await authApi.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError('Ошибка при отправке письма. Проверьте email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-[#232834] p-8 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <EnvelopeIcon className="h-6 w-6" /> Восстановление пароля
        </h2>
        <label className="block text-gray-300 mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full mb-4 px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Введите ваш email"
        />
        {error && <div className="text-red-400 mb-2 text-sm">{error}</div>}
        {success && <div className="text-green-400 mb-2 text-sm">Письмо с инструкцией отправлено!</div>}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
          disabled={loading}
        >
          {loading ? 'Отправка...' : 'Восстановить'}
        </button>
      </form>
    </div>
  );
} 
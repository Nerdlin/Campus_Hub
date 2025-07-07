"use client";
import React from 'react';
import LibraryManager from '../../components/LibraryManager';
import { useAuth } from '../../hooks/useAuth';

export default function LibraryPage() {
  const { user } = useAuth();
  return <LibraryManager currentUser={user} />;
} 
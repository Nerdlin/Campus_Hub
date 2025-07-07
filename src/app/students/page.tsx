"use client";
import React from 'react';
import StudentManager from '../../components/StudentManager';
import { useAuth } from '../../hooks/useAuth';

export default function StudentsPage() {
  const { user } = useAuth();
  return <StudentManager currentUser={user} />;
} 
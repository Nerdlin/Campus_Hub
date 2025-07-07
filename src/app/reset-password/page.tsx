"use client";
import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { updatePassword } from '../../api/chatApi';
// ... (rest of the code from src/pages/ResetPassword.js, adapted for Next.js app router) ... 
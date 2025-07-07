import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import { ShieldCheckIcon, QrCodeIcon } from '@heroicons/react/24/outline';

const TwoFactorAuthModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1); // 1: Setup, 2: Verify
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { t } = useTranslation();

  // Mock QR code data
  const qrCodeData = 'otpauth://totp/StudentPortal:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=StudentPortal';

  const handleVerify = (e) => {
    e.preventDefault();
    setError('');

    if (!verificationCode) {
      setError(t('Please enter the verification code'));
      return;
    }

    // Mock verification
    setSuccess(true);
    setTimeout(() => {
      onClose();
      setStep(1);
      setVerificationCode('');
      setSuccess(false);
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        <div className={`relative rounded-lg shadow-xl max-w-md w-full mx-auto p-6 z-10 transition-colors duration-300 ${document.documentElement.classList.contains('dark') ? 'bg-slate-800 text-slate-100' : 'bg-white text-gray-900'}`}>
          <Dialog.Title className="text-lg font-bold mb-4">
            {t('Two-Factor Authentication')}
          </Dialog.Title>
          {success ? (
            <div className="text-green-600 text-center py-4">
              {t('Two-factor authentication successfully enabled')}
            </div>
          ) : (
            <div className="space-y-4">
              {step === 1 ? (
                <>
                  <div className="text-sm text-gray-600 mb-4">
                    {t('Scan the QR code with your authenticator app to set up two-factor authentication.')}
                  </div>
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-white border rounded-lg">
                      <QrCodeIcon className="h-32 w-32 text-gray-400" />
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    {t('Or enter this code manually:')}
                    <div className="font-mono bg-gray-100 p-2 rounded mt-2">JBSWY3DPEHPK3PXP</div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setStep(2)}
                      className="px-4 py-2 rounded bg-accent-500 text-white hover:bg-accent-600 dark:bg-primary-600 dark:hover:bg-primary-700"
                    >
                      {t('Next')}
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleVerify} className="space-y-4">
                  {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t('Enter the 6-digit code from your authenticator app')}
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded-md px-3 py-2 text-center text-2xl tracking-widest bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2 rounded bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-slate-200"
                    >
                      {t('Back')}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded bg-accent-500 text-white hover:bg-accent-600 dark:bg-primary-600 dark:hover:bg-primary-700"
                    >
                      {t('Verify')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default TwoFactorAuthModal; 
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { motion, AnimatePresence } from 'framer-motion';
import { requestOtpAction, verifyOtpAction } from '@/app/actions/auth';
import { getLoginWarningAction } from '@/app/actions/settings';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'operator' | 'otp'>('operator');
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [otp, setOtp] = useState('');
  const [devMode, setDevMode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showServiceFee, setShowServiceFee] = useState(false);

  useEffect(() => {
    getLoginWarningAction().then((res) => setShowServiceFee(res.showWarning));
  }, []);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await requestOtpAction(mobile);
      setReferenceNo(res.referenceNo);
      setDevMode(!!res.devMode);
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyOtpAction(referenceNo, otp, name);
      router.push('/account');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-[2rem] shadow-2xl border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" x2="3" y1="12" y2="12"/>
            </svg>
          </div>
          <CardTitle className="text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">Sign in</CardTitle>
          <CardDescription className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
            Enter your mobile number to unlock full access to download documents. Previewing is always free.
          </CardDescription>
          {showServiceFee && (
            <div className="mx-auto mt-3 flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-900/40 px-4 py-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600 shrink-0">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4"/>
                <path d="M12 8h.01"/>
              </svg>
              <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">Rs.3 daily service fee applicable</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            {step === 'operator' ? (
              <motion.form
                key="operator"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                onSubmit={handleRequestOtp}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-none">Your Name <span className="text-slate-400 font-medium">(optional)</span></label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full rounded-2xl h-12 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus-visible:ring-teal-600 focus-visible:border-teal-600"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="mobile" className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-none">Mobile number</label>
                  <Input
                    id="mobile"
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="07XXXXXXXX"
                    required
                    className="w-full rounded-2xl h-12 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus-visible:ring-teal-600 focus-visible:border-teal-600 font-medium"
                  />
                </div>
                
                {error && <p className="text-sm font-bold text-red-500">{error}</p>}
                
                <Button type="submit" className="w-full rounded-full h-12 font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-500/20 text-[15px]" disabled={loading}>
                  {loading ? 'Sending…' : 'Send OTP'}
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                onSubmit={handleVerify}
                className="space-y-5"
              >
                <div className="rounded-2xl bg-teal-50/50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-900/30 p-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                  <p>OTP sent to <strong className="text-slate-800 dark:text-slate-100 font-bold">{mobile}</strong></p>
                  {devMode && (
                    <p className="mt-1.5 text-orange-600 dark:text-orange-400">
                      Dev mode: use OTP <strong className="text-orange-700 dark:text-orange-300 font-bold">123456</strong>
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="otp" className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-none">Enter OTP</label>
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
                      <InputOTPGroup className="gap-2">
                        {Array.from({ length: 6 }).map((_, index) => (
                          <InputOTPSlot 
                            key={index} 
                            index={index} 
                            className="w-12 h-14 sm:w-14 sm:h-16 text-2xl sm:text-3xl font-black rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 data-[active=true]:ring-teal-600 data-[active=true]:border-teal-600 first:rounded-xl last:rounded-xl border-y border-l border-r"
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>

                {error && <p className="text-sm font-bold text-red-500">{error}</p>}
                
                <div className="space-y-3 pt-3">
                  <Button type="submit" className="w-full rounded-full h-12 font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-500/20 text-[15px]" disabled={loading}>
                    {loading ? 'Verifying…' : 'Verify & sign in'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full rounded-full h-12 font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => setStep('operator')}
                  >
                    Change number
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-slate-100 dark:border-slate-800 pt-6 pb-6">
          <Button variant="link" render={<Link href="/" />} className="text-slate-500 hover:text-teal-600 font-bold">
            Continue browsing without signing in
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

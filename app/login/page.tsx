'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';


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

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.requestOtp(mobile);
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
      await api.verifyOtp(referenceNo, otp, name);
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
      <Card className="w-full max-w-md shadow-xl border-border bg-card/60 backdrop-blur-md">
        <CardHeader className="space-y-2.5 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Sign in with mobile</CardTitle>
          <CardDescription className="text-sm">
            Enter your mobile number to sign in and unlock full access to download documents. Previewing is always free.
          </CardDescription>
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
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-semibold text-muted-foreground leading-none">Your Name (optional)</label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="mobile" className="text-sm font-semibold text-muted-foreground leading-none">Mobile number</label>
                  <Input
                    id="mobile"
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="07XXXXXXXX"
                    required
                    className="w-full"
                  />
                </div>
                
                {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                
                <Button type="submit" className="w-full" disabled={loading}>
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
                className="space-y-4"
              >
                <div className="rounded-lg bg-muted/60 border p-3.5 text-sm text-muted-foreground">
                  <p>OTP sent to <strong className="text-foreground">{mobile}</strong></p>
                  {devMode && (
                    <p className="mt-1 text-amber-600 dark:text-amber-500">
                      Dev mode: use OTP <strong className="text-foreground">123456</strong>
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="otp" className="text-sm font-semibold text-muted-foreground leading-none">Enter OTP</label>
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={8}
                    placeholder="• • • • • •"
                    className="w-full text-center text-xl tracking-[0.5em] focus:tracking-[0.5em]"
                    required
                  />
                </div>

                {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                
                <div className="space-y-3 pt-2">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Verifying…' : 'Verify & sign in'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-muted-foreground"
                    onClick={() => setStep('operator')}
                  >
                    Change number
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border/80 pt-6">
          <Button variant="link" render={<Link href="/" />} className="text-muted-foreground hover:text-foreground">
            Continue browsing without signing in
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

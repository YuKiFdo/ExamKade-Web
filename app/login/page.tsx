'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { motion, AnimatePresence } from 'framer-motion';
import { requestOtpAction, verifyOtpAction } from '@/app/actions/auth';
import { getLoginWarningAction } from '@/app/actions/settings';
import { toast } from 'sonner';
import { ShieldCheck, BookOpen, CheckCircle2, ChevronRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'operator' | 'otp'>('operator');
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [otp, setOtp] = useState('');
  const [devMode, setDevMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showServiceFee, setShowServiceFee] = useState(false);

  useEffect(() => {
    getLoginWarningAction().then((res) => setShowServiceFee(res.showWarning));
  }, []);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile.startsWith('07') || mobile.length !== 10) {
      toast.error('Invalid mobile number. It must start with 07 and be exactly 10 digits.');
      return;
    }
    setLoading(true);
    try {
      const res = await requestOtpAction(mobile);
      setReferenceNo(res.referenceNo);
      setDevMode(!!res.devMode);
      setStep('otp');
      toast.success(`OTP sent to ${mobile}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyOtpAction(referenceNo, otp, name);
      toast.success('Successfully logged in!');
      router.push('/account');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl w-full px-4 lg:px-6 py-8 sm:py-16 flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="grid w-full md:grid-cols-12 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden bg-white dark:bg-slate-900 shadow-xl shadow-slate-100/50 dark:shadow-none min-h-[550px]">
        {/* Left Side: Information & Branding (Visible on Desktop/Tablets) */}
        <div className="hidden md:flex md:col-span-5 flex-col justify-between bg-slate-950 p-10 text-white relative overflow-hidden">
          {/* Decorative Background Patterns */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,#4f46e515,transparent_60%)] pointer-events-none" />
          
          {/* Logo / Header */}
          <div className="relative flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md">
              <BookOpen className="size-4.5" />
            </span>
            <span className="text-lg font-bold tracking-tight">
              Exam<span className="text-indigo-400">Kade</span> Portal
            </span>
          </div>

          {/* Core academic features */}
          <div className="relative my-auto space-y-8 max-w-sm">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tight">Sri Lanka&apos;s Premium Academic Resource Hub</h2>
              <p className="text-sm text-slate-400 leading-relaxed font-normal">
                Access a secure, curriculum-aligned library designed specifically to assist teachers, students, and educators.
              </p>
            </div>

            <ul className="space-y-4 pt-4 border-t border-slate-800/60">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="size-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">National Examination Papers</h4>
                  <p className="text-xs text-slate-400 mt-0.5">G.C.E. Ordinary Level and Advanced Level past papers and marking schemes.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="size-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">Official Curriculum Syllabus & Guides</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Syllabuses, teacher instruction manuals, and textbooks direct from publishers.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="size-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">Provincial & School Term Tests</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Practice term tests from all major provinces with detailed answers.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Footer information */}
          <div className="relative flex items-center gap-2 text-xs text-slate-500 font-medium">
            <ShieldCheck className="size-4 text-slate-400" />
            <span>Authorized access only. Safe & secure authentication.</span>
          </div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="flex md:col-span-7 items-center justify-center p-8 bg-slate-50/20 dark:bg-slate-950/10">
          <div className="w-full max-w-md space-y-6">
            <div className="space-y-2 text-center pb-2">
              {/* Mobile-only logo */}
              <div className="md:hidden mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mb-4">
                <BookOpen className="size-5.5" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Sign In</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                Enter your mobile number to sign in and download academic materials. Previewing documents is free.
              </p>
              {showServiceFee && (
                <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/80 dark:border-indigo-900/40 px-4 py-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 dark:text-indigo-400 shrink-0">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4"/>
                    <path d="M12 8h.01"/>
                  </svg>
                  <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Rs.3 daily service fee applicable</span>
                </div>
              )}
            </div>
            
            <div className="overflow-hidden p-1">
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
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Your Name <span className="text-slate-400 dark:text-slate-600 font-normal capitalize">(optional)</span></label>
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full rounded-lg h-11 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 font-medium text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="mobile" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mobile Number</label>
                      <Input
                        id="mobile"
                        type="tel"
                        value={mobile}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 10) {
                            setMobile(val);
                          }
                        }}
                        placeholder="07XXXXXXXX"
                        maxLength={10}
                        required
                        className="w-full rounded-lg h-11 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 font-medium text-sm"
                      />
                    </div>
                    
                    <Button type="submit" className="w-full rounded-lg h-11 font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm text-sm transition-colors mt-2" disabled={loading || mobile.length !== 10 || !mobile.startsWith('07')}>
                      {loading ? 'Sending…' : 'Send OTP Code'}
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
                    <div className="rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 p-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                      <p>OTP verification code has been sent to <strong className="text-slate-800 dark:text-slate-200 font-bold">{mobile}</strong></p>
                      {devMode && (
                        <p className="mt-2 text-amber-600 dark:text-amber-400">
                          Dev Mode: Use verification code <strong className="text-amber-700 dark:text-amber-300 font-bold">123456</strong>
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="otp" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block text-center">Enter Verification Code</label>
                      <div className="flex justify-center">
                        <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
                          <InputOTPGroup className="gap-2">
                            {Array.from({ length: 6 }).map((_, index) => (
                              <InputOTPSlot 
                                key={index} 
                                index={index} 
                                className="w-12 h-14 sm:w-13 sm:h-15 text-2xl font-bold rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 data-[active=true]:ring-indigo-600 data-[active=true]:border-indigo-600 first:rounded-lg last:rounded-lg border-y border-l border-r"
                              />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </div>
                    
                    <div className="space-y-2 pt-2">
                      <Button type="submit" className="w-full rounded-lg h-11 font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm text-sm transition-colors" disabled={loading || otp.length !== 6}>
                        {loading ? 'Verifying…' : 'Verify & Sign In'}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full rounded-lg h-11 font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs transition-colors"
                        onClick={() => setStep('operator')}
                      >
                        Change number
                      </Button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex flex-col items-center justify-center border-t border-slate-100 dark:border-slate-800 pt-6">
              <Link href="/" className="text-xs text-slate-500 hover:text-indigo-600 font-semibold hover:underline transition-colors flex items-center gap-1">
                <span>Continue browsing without signing in</span>
                <ChevronRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

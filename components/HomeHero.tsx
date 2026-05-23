'use client';

import { motion, Variants } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export function HomeHero() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 16,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative mx-auto max-w-7xl px-4 py-16 lg:px-6 lg:py-28"
    >
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Column: Text & Search */}
        <div className="text-left flex flex-col items-start">
          
          {/* Main Title */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl font-black tracking-tight sm:text-5xl lg:text-[4rem] lg:leading-[1.1] text-foreground text-left max-w-2xl"
          >
            Best Place to Find Your <span className="text-orange-500 dark:text-orange-400">Study Resources</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="mt-6 max-w-lg text-sm sm:text-base text-muted-foreground leading-relaxed text-left"
          >
            Discover thousands of past papers, model papers, term tests, syllabi, teacher&apos;s guides, text books and government <br /> gazette preview free, download with subscription.
          </motion.p>

          {/* Hero search */}
          <motion.div variants={itemVariants} className="mt-10 w-full max-w-md">
            <form action="/search" className="relative group flex items-center">
              <div className="absolute inset-0 bg-white dark:bg-slate-800/80 dark:border dark:border-slate-700 rounded-full shadow-sm" />
              <div className="relative flex w-full h-14 items-center pl-4 pr-1.5">
                <Input
                  name="q"
                  type="search"
                  placeholder="Search past papers, guides..."
                  className="h-full w-full border-none bg-transparent shadow-none focus-visible:ring-0 px-2 text-sm text-foreground placeholder:text-muted-foreground"
                />
                <Button
                  type="submit"
                  className="h-11 rounded-full px-8 bg-teal-600 hover:bg-teal-700 text-white font-medium shadow-md transition-all gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  Search
                </Button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Right Column: Illustration */}
        <motion.div variants={itemVariants} className="hidden lg:flex justify-center items-center relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-3xl opacity-30 -z-10" />
          <Image 
            src="/hero-illustration.png"
            alt="Student studying illustration"
            width={600}
            height={600}
            priority
            className="w-full max-w-lg object-contain mix-blend-multiply dark:mix-blend-normal dark:bg-white dark:rounded-[3rem] dark:p-8 dark:shadow-2xl hover:scale-105 transition-all duration-700"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

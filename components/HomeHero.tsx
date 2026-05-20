'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function HomeHero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants = {
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
      className="relative mx-auto max-w-7xl px-4 py-20 text-center lg:px-6 lg:py-28"
    >
      {/* Badge */}
      <motion.div variants={itemVariants} className="flex justify-center">
        <Badge variant="secondary" className="mb-5 gap-1.5 px-3 py-1 text-sm bg-muted/60 border-primary/10 shadow-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          Sri Lanka Education Platform
        </Badge>
      </motion.div>

      {/* Main Title */}
      <motion.h1
        variants={itemVariants}
        className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground"
      >
        All Your Study
        <br />
        <span className="text-gradient">Resources in One Place</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        variants={itemVariants}
        className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed"
      >
        Past papers, model papers, term tests, syllabi, teacher&apos;s guides, text books
        and government gazette — preview free, download with subscription.
      </motion.p>

      {/* Hero search */}
      <motion.div variants={itemVariants} className="mx-auto mt-8 max-w-xl">
        <form action="/search" className="relative group">
          <div className="absolute inset-0 -m-1 bg-gradient-to-r from-primary/10 to-chart-2/10 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none" />
          <div className="relative">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
            >
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
              <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <Input
              name="q"
              type="search"
              placeholder="Search past papers, guides, gazette..."
              className="h-12 w-full rounded-xl pl-12 pr-28 text-base shadow-xs border-border/80 focus-visible:border-primary/50 transition-all bg-background/80 backdrop-blur-xs"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg"
            >
              Search
            </Button>
          </div>
        </form>
      </motion.div>

      {/* Quick stats */}
      <motion.div
        variants={itemVariants}
        className="mx-auto mt-12 flex max-w-md items-center justify-center gap-8 rounded-2xl border border-border bg-card/40 backdrop-blur-md px-6 py-4 shadow-xs"
      >
        {[
          { value: '7', label: 'Categories' },
          { value: '3', label: 'Languages' },
          { value: 'Free', label: 'Preview' },
        ].map((stat, i) => (
          <div key={stat.label} className="flex items-center gap-8">
            {i > 0 && <div className="h-8 w-px bg-border/80 -ml-8" />}
            <div className="text-center">
              <p className="text-2xl font-bold text-gradient">{stat.value}</p>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}

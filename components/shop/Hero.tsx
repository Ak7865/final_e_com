"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Leaf, Shield } from "lucide-react";

const features = [
  { icon: Leaf, label: "100% Botanical" },
  { icon: Shield, label: "Dermatologist Tested" },
  { icon: Sparkles, label: "Cruelty Free" },
];

const floatingVariants = {
  animate: {
    y: [0, -12, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
};

const orbVariants = {
  animate: {
    scale: [1, 1.08, 1],
    opacity: [0.4, 0.6, 0.4],
    transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
  },
};

export function Hero() {
  return (
    <section className="relative min-h-[92vh] flex items-center bg-gradient-to-br from-cream-100 via-cream-50 to-sage-50 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950 overflow-hidden">
      {/* Background decorative orbs */}
      <motion.div
        variants={orbVariants}
        animate="animate"
        className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-sage-200/40 to-cream-200/40 dark:from-sage-900/20 dark:to-stone-800/20 blur-3xl pointer-events-none"
      />
      <motion.div
        variants={orbVariants}
        animate="animate"
        style={{ animationDelay: "2s" }}
        className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-gradient-to-br from-gold-400/20 to-cream-200/30 dark:from-gold-900/10 blur-3xl pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10 py-20">
        {/* Left — Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-sage-100 dark:bg-sage-950/60 text-sage-700 dark:text-sage-300 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-6 border border-sage-200 dark:border-sage-800"
          >
            <Sparkles className="h-3 w-3" />
            Clean Beauty Reimagined
          </motion.div>

          {/* Headline */}
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[1.1] text-stone-800 dark:text-stone-100">
            Glow with
            <br />
            <span className="italic text-sage-600 dark:text-sage-400 relative">
              Nature's Best
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0 8 Q75 0 150 6 Q225 12 300 4"
                  stroke="#9caf88"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.6"
                />
              </svg>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-stone-600 dark:text-stone-400 mt-8 max-w-md text-lg leading-relaxed"
          >
            Botanical-powered skincare crafted to reveal your most radiant,
            healthy skin. Science-backed formulas, nature-inspired ingredients.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap gap-4 mt-10"
          >
            <Button size="lg" asChild className="gap-2 h-13 px-8 text-base">
              <Link href="/products">
                Shop Collection <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-13 px-8 text-base">
              <Link href="/products?category=serums">Explore Serums</Link>
            </Button>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap gap-6 mt-10"
          >
            {features.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
                <div className="h-7 w-7 rounded-full bg-sage-50 dark:bg-sage-950/40 grid place-items-center">
                  <Icon className="h-3.5 w-3.5 text-sage-600 dark:text-sage-400" />
                </div>
                <span className="text-xs font-medium">{label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right — Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="relative"
        >
          {/* Main circle */}
          <motion.div
            variants={floatingVariants}
            animate="animate"
            className="relative aspect-square rounded-[40%_60%_60%_40%/50%_40%_60%_50%] bg-gradient-to-br from-sage-100 via-cream-100 to-sage-200 dark:from-stone-800 dark:via-stone-700 dark:to-stone-800 shadow-2xl flex items-center justify-center mx-auto max-w-sm md:max-w-full"
          >
            {/* Center monogram */}
            <span className="font-serif text-[120px] text-sage-300/50 dark:text-sage-700/40 select-none">
              L
            </span>

            {/* Floating stat badges */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="absolute -right-4 top-1/4 bg-white dark:bg-stone-800 rounded-2xl shadow-xl px-4 py-3 text-center"
            >
              <p className="font-serif text-2xl font-bold text-sage-600">4.9★</p>
              <p className="text-[10px] text-stone-500 mt-0.5">Avg Rating</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 }}
              className="absolute -left-4 bottom-1/4 bg-white dark:bg-stone-800 rounded-2xl shadow-xl px-4 py-3 text-center"
            >
              <p className="font-serif text-2xl font-bold text-gold-500">10k+</p>
              <p className="text-[10px] text-stone-500 mt-0.5">Happy Clients</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
              className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-sage-600 text-white rounded-2xl shadow-xl px-5 py-3 text-center whitespace-nowrap"
            >
              <p className="text-xs font-semibold">✨ New Arrivals</p>
              <p className="text-[10px] opacity-80">Botanical Vitamin C Serum</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-stone-400 uppercase tracking-widest">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-px h-8 bg-gradient-to-b from-stone-400 to-transparent"
        />
      </motion.div>
    </section>
  );
}
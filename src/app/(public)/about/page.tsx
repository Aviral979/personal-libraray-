"use client";

import { motion } from "framer-motion";
import { BookOpen, Sparkles, Globe, Shield, Zap, Library, Brain, Rocket, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="content-width py-12 lg:py-24 space-y-24">
      {/* Hero Section */}
      <section className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20"
        >
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-indigo/10 text-brand-indigo text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Your Digital Brain</span>
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-indigo to-brand-teal">Personal Library</span>
            </h1>
            <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed max-w-2xl">
              Personal Library is a premium knowledge operating system designed
              to be your permanent, centralized archive for saving and organizing
              information from any source on the internet.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Brain className="w-5 h-5" />
                </div>
                Learn Faster
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal">
                  <Shield className="w-5 h-5" />
                </div>
                Store Forever
              </div>
            </div>
          </div>

          <div className="flex-1 w-full max-w-md lg:max-w-full relative aspect-square lg:aspect-video rounded-3xl overflow-hidden shadow-2xl border border-border/50 group">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-indigo/20 to-brand-teal/20 mix-blend-overlay z-10 group-hover:opacity-50 transition-opacity"></div>
            <Image 
              src="/images/logo.png" 
              alt="Personal Library Illustration" 
              fill 
              className="object-cover p-12 lg:p-24 dark:invert-[.8] transition-transform duration-700 group-hover:scale-105" 
            />
          </div>
        </motion.div>
      </section>

      {/* Mission Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-heading text-3xl font-bold mb-4">Why we built this</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            In a world where content disappears — social media posts get
            deleted, websites go offline, videos are removed — Personal Library
            ensures that the information you care about is preserved forever, in
            your own highly searchable, beautiful workspace.
          </p>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            {
              icon: Globe,
              title: "Save from Anywhere",
              description: "Archive content from Instagram, YouTube, websites, PDFs, and any digital source.",
              color: "text-blue-500",
              bg: "bg-blue-500/10"
            },
            {
              icon: Shield,
              title: "Permanent Archive",
              description: "Even if original content disappears, your copy remains forever.",
              color: "text-emerald-500",
              bg: "bg-emerald-500/10"
            },
            {
              icon: Zap,
              title: "Powerful Search",
              description: "Full-text search across all your knowledge seamlessly.",
              color: "text-amber-500",
              bg: "bg-amber-500/10"
            },
            {
              icon: Star,
              title: "Beautiful & Fast",
              description: "Premium, modern interface that makes organizing knowledge a joy.",
              color: "text-pink-500",
              bg: "bg-pink-500/10"
            },
          ].map((item, i) => (
            <Card key={item.title} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50 group overflow-hidden relative">
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full ${item.bg} -z-10 opacity-50 group-hover:scale-110 transition-transform`}></div>
              <CardContent className="p-8">
                <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-3">
                  {item.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </section>
    </div>
  );
}

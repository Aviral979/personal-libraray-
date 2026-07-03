"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

export default function PopularPage() {
  return (
    <div className="content-width py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-3">
          Most Popular
        </h1>
        <p className="text-muted-foreground">
          Top viewed knowledge items across your archive.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center py-20"
      >
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mx-auto mb-4">
          <TrendingUp className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="font-heading text-xl font-semibold mb-2">
          No popular items yet
        </h2>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          As knowledge items gain views, the most popular ones will appear here.
        </p>
      </motion.div>
    </div>
  );
}

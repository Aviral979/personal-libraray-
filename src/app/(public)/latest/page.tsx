"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";

export default function LatestPage() {
  return (
    <div className="content-width py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-3">
          Latest Additions
        </h1>
        <p className="text-muted-foreground">
          Recently added knowledge items in chronological order.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center py-20"
      >
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mx-auto mb-4">
          <Clock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="font-heading text-xl font-semibold mb-2">
          Nothing here yet
        </h2>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          New knowledge items will appear here as they are published.
        </p>
      </motion.div>
    </div>
  );
}

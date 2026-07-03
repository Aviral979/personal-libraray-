"use client";

import { motion } from "framer-motion";
import { Library } from "lucide-react";

export default function CollectionsPage() {
  return (
    <div className="content-width py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-3">
          Collections
        </h1>
        <p className="text-muted-foreground">
          Curated groups of related knowledge items.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center py-20"
      >
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mx-auto mb-4">
          <Library className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="font-heading text-xl font-semibold mb-2">
          No collections yet
        </h2>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          Collections will appear here once they&apos;re created from the admin panel.
        </p>
      </motion.div>
    </div>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SearchPage() {
  return (
    <div className="content-width py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-3">
          Search Your Archive
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Search across all knowledge items, categories, tags, OCR text, and
          metadata.
        </p>
      </motion.div>

      {/* Search bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="max-w-2xl mx-auto mb-12"
      >
        <div className="relative flex items-center bg-card border border-border rounded-xl shadow-card">
          <SearchIcon className="ml-4 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search knowledge, categories, tags, OCR text..."
            className="border-0 bg-transparent h-14 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
            id="search-input"
            autoFocus
          />
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 h-10 w-10 cursor-pointer"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <Button size="sm" className="mr-2 cursor-pointer" id="search-btn">
            Search
          </Button>
        </div>

        {/* Filter tags */}
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {["All", "Knowledge", "Categories", "Tags", "OCR Text"].map(
            (filter) => (
              <Badge
                key={filter}
                variant={filter === "All" ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {filter}
              </Badge>
            )
          )}
        </div>
      </motion.div>

      {/* Empty state */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-center py-12"
      >
        <div className="max-w-xs mx-auto mb-6">
          <Image
            src="/images/Empty state — no search results.png"
            alt="No search results"
            width={250}
            height={250}
            className="w-full h-auto"
          />
        </div>
        <h2 className="font-heading text-xl font-semibold mb-2">
          Start Searching
        </h2>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          Type something in the search bar to find knowledge items across your
          entire archive.
        </p>
      </motion.div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Grid3X3, Folder, Search, ArrowRight, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Input } from "@/components/ui/input";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<{ name: string; slug: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cacheKey = "knowledge_items_cache";
        let fetchedItems: any[] = [];
        
        // Cache check for instant loading
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          fetchedItems = JSON.parse(cached);
        } else {
          const q = query(collection(db, "knowledgeItems"), where("status", "==", "PUBLISHED"));
          const querySnapshot = await getDocs(q);
          fetchedItems = querySnapshot.docs.map(doc => ({
            id: doc.id,
            category: doc.data().category || "Uncategorized"
          }));
          sessionStorage.setItem(cacheKey, JSON.stringify(fetchedItems));
        }

        const catMap = new Map<string, number>();
        fetchedItems.forEach(item => {
          const catName = item.category || "Uncategorized";
          catMap.set(catName, (catMap.get(catName) || 0) + 1);
        });

        const formatted = Array.from(catMap.entries()).map(([name, count]) => {
          const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
          return { name, slug, count };
        }).sort((a, b) => a.name.localeCompare(b.name));

        setCategories(formatted);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="content-width py-12 min-h-screen bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4 mb-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <Grid3X3 className="h-3.5 w-3.5" />
          <span>Categories Overview</span>
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight">
          Browse by <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-indigo to-brand-teal">Category</span>
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-xl">
          Explore our collection of articles, media, and knowledge items organized neatly by topics.
        </p>
      </motion.div>

      {/* Search Filter */}
      <div className="relative max-w-md mb-8">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filter categories..."
          className="pl-9 h-10 rounded-xl"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Grid or States */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 rounded-2xl border border-border/60 bg-card p-6 flex flex-col justify-between animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-3 w-16 bg-muted rounded" />
                </div>
              </div>
              <div className="h-4 w-4 bg-muted rounded self-end" />
            </div>
          ))}
        </div>
      ) : filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((cat, index) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Link href={`/categories/${cat.slug}`}>
                <div className="group relative rounded-2xl border border-border/60 bg-card p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 flex flex-col justify-between h-36 cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      <Folder className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300 truncate max-w-[200px] sm:max-w-[220px]">
                        {cat.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 font-medium">
                        {cat.count} {cat.count === 1 ? "item" : "items"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-semibold text-primary self-end opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                    <span>View items</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-card rounded-2xl border border-border/60"
        >
          <Grid3X3 className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="font-heading text-xl font-semibold mb-2">No categories found</h2>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Try a different search query or create items with new categories.
          </p>
        </motion.div>
      )}
    </div>
  );
}

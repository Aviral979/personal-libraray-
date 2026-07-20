"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Search, Eye } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { KnowledgeCard } from "@/components/shared/knowledge-card";
import { Input } from "@/components/ui/input";

export default function PopularPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const cacheKey = "knowledge_items_cache";
        let fetchedItems: any[] = [];

        // Check Cache
        const cached = typeof window !== "undefined" ? sessionStorage.getItem(cacheKey) : null;
        if (cached) {
          fetchedItems = JSON.parse(cached);
        } else {
          const q = query(collection(db, "knowledgeItems"), where("status", "==", "PUBLISHED"));
          const querySnapshot = await getDocs(q);
          fetchedItems = querySnapshot.docs.map(doc => {
            const data = doc.data();
            let dateObj = new Date();
            if (data.date) {
              try { dateObj = new Date(data.date); } catch(e) {}
            } else if (data.createdAt) {
               dateObj = new Date(data.createdAt);
            }
            return {
              id: doc.id,
              ...data,
              publishedAt: dateObj,
              category: { 
                name: data.category || "Uncategorized", 
                slug: (data.category || "uncategorized").toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
              }
            };
          });
          if (typeof window !== "undefined") {
            sessionStorage.setItem(cacheKey, JSON.stringify(fetchedItems));
          }
        }

        // Map and Sort by views descending
        const mapped = fetchedItems.map(item => ({
          ...item,
          publishedAt: item.publishedAt ? new Date(item.publishedAt) : new Date(),
          views: Number(item.views) || 0
        })).sort((a, b) => b.views - a.views);

        setItems(mapped);
      } catch (error) {
        console.error("Error fetching popular items:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPopular();
  }, []);

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase())
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
          <TrendingUp className="h-3.5 w-3.5" />
          <span>Top Performing Insights</span>
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight">
          Most <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-indigo to-brand-teal">Popular</span>
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-xl">
          Discover the most viewed, read, and interacted documents across your knowledge ecosystem.
        </p>
      </motion.div>

      {/* Filter and Search */}
      <div className="relative max-w-md mb-8">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search popular items..."
          className="pl-9 h-10 rounded-xl"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[4/3] rounded-2xl bg-card border border-border/60 animate-pulse flex flex-col p-4 space-y-3">
              <div className="flex-1 bg-muted rounded-xl" />
              <div className="h-4 w-2/3 bg-muted rounded" />
              <div className="h-3 w-1/3 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <KnowledgeCard key={item.id} {...item} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-card rounded-2xl border border-border/60"
        >
          <Eye className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="font-heading text-xl font-semibold mb-2">No popular items found</h2>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Items will appear here once they gain views from library visitors.
          </p>
        </motion.div>
      )}
    </div>
  );
}

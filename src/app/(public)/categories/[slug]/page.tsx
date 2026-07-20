"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Folder, ArrowLeft, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { KnowledgeCard } from "@/components/shared/knowledge-card";
import { Button } from "@/components/ui/button";

interface CategoryDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const router = useRouter();
  const { slug } = use(params);
  
  const [categoryName, setCategoryName] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryItems = async () => {
      try {
        const cacheKey = "knowledge_items_cache";
        let fetchedItems: any[] = [];
        
        // Cache read to load instantly
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
              categoryName: data.category || "Uncategorized",
              categorySlug: (data.category || "uncategorized")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)+/g, "")
            };
          });
          if (typeof window !== "undefined") {
            sessionStorage.setItem(cacheKey, JSON.stringify(fetchedItems));
          }
        }

        // Standardize format and mapping for cached data
        const mappedItems = fetchedItems.map(item => {
          const categorySlug = item.categorySlug || (item.category || "uncategorized")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
          return {
            ...item,
            publishedAt: item.publishedAt ? new Date(item.publishedAt) : new Date(),
            category: {
              name: item.categoryName || item.category || "Uncategorized",
              slug: categorySlug
            }
          };
        });

        // Filter items belonging to this category slug
        const categoryItems = mappedItems.filter(item => item.category.slug === slug);
        setItems(categoryItems);

        // Deduce the original category name from fetched items, or default from slug formatting
        const found = categoryItems.find(item => item.category.name);
        if (found) {
          setCategoryName(found.category.name);
        } else {
          setCategoryName(slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()));
        }
      } catch (error) {
        console.error("Error fetching category items:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryItems();
  }, [slug]);

  return (
    <div className="content-width py-12 min-h-screen bg-background">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => router.back()} 
        className="mb-6 gap-2 text-muted-foreground hover:text-foreground cursor-pointer rounded-full"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Categories
      </Button>

      {/* Header */}
      <div className="mb-10 flex items-center gap-4 border-b border-border/50 pb-6">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary shadow-sm">
          <Folder className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight">
            {categoryName || "Loading Category..."}
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm sm:text-base">
            All archived documents and resources tagged under <span className="font-semibold text-foreground/80">{categoryName}</span>.
          </p>
        </div>
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
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <KnowledgeCard key={item.id} {...item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/20 rounded-2xl border border-border/50">
          <Folder className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="font-heading text-xl font-semibold mb-2">No items found</h2>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            There are no published knowledge items in this category yet.
          </p>
        </div>
      )}
    </div>
  );
}

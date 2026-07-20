"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Library, Sparkles, Video, FileText, Link as LinkIcon, Image as ImageIcon, ArrowLeft, ArrowRight } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { KnowledgeCard } from "@/components/shared/knowledge-card";
import { Button } from "@/components/ui/button";

function CollectionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeType = searchParams.get("type");

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Grouped stats
  const [stats, setStats] = useState({
    featured: 0,
    videos: 0,
    documents: 0,
    links: 0,
    galleries: 0,
  });

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const cacheKey = "knowledge_items_cache";
        let fetchedItems: any[] = [];

        // Cache fetch for speed
        const cached = sessionStorage.getItem(cacheKey);
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
          sessionStorage.setItem(cacheKey, JSON.stringify(fetchedItems));
        }

        // Map date instances back
        const mapped = fetchedItems.map(item => ({
          ...item,
          publishedAt: item.publishedAt ? new Date(item.publishedAt) : new Date()
        }));

        setItems(mapped);

        // Calculate counts
        setStats({
          featured: mapped.filter(item => item.featured === true).length,
          videos: mapped.filter(item => item.videos && item.videos.length > 0).length,
          documents: mapped.filter(item => item.files && item.files.length > 0).length,
          links: mapped.filter(item => item.externalLinks && item.externalLinks.length > 0).length,
          galleries: mapped.filter(item => item.contentImages && item.contentImages.length > 0).length,
        });

      } catch (error) {
        console.error("Error fetching collections:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, []);

  // Filter items based on active selection
  const getFilteredItems = () => {
    switch (activeType) {
      case "featured":
        return items.filter(item => item.featured === true);
      case "videos":
        return items.filter(item => item.videos && item.videos.length > 0);
      case "documents":
        return items.filter(item => item.files && item.files.length > 0);
      case "links":
        return items.filter(item => item.externalLinks && item.externalLinks.length > 0);
      case "galleries":
        return items.filter(item => item.contentImages && item.contentImages.length > 0);
      default:
        return [];
    }
  };

  const collectionList = [
    {
      id: "featured",
      name: "Featured Collection",
      description: "Pinnacle items highlighted and recommended by the curators.",
      icon: Sparkles,
      color: "text-amber-500 bg-amber-500/10",
      count: stats.featured,
    },
    {
      id: "videos",
      name: "Video Library",
      description: "Archived tutorials, presentations, and explanatory videos.",
      icon: Video,
      color: "text-red-500 bg-red-500/10",
      count: stats.videos,
    },
    {
      id: "documents",
      name: "Documents & PDFs",
      description: "Ebooks, reference documents, guides, and textual files.",
      icon: FileText,
      color: "text-blue-500 bg-blue-500/10",
      count: stats.documents,
    },
    {
      id: "links",
      name: "Web References",
      description: "Bookmarks and links to external articles, tools, and resources.",
      icon: LinkIcon,
      color: "text-emerald-500 bg-emerald-500/10",
      count: stats.links,
    },
    {
      id: "galleries",
      name: "Visual Galleries",
      description: "Knowledge cards and collections containing visual illustrations and images.",
      icon: ImageIcon,
      color: "text-purple-500 bg-purple-500/10",
      count: stats.galleries,
    },
  ];

  const activeCollection = collectionList.find(c => c.id === activeType);
  const displayedItems = getFilteredItems();

  return (
    <div className="content-width py-12 min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {!activeType ? (
          /* Collection Categories Selection Grid */
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="space-y-10"
          >
            {/* Header */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                <Library className="h-3.5 w-3.5" />
                <span>Curated Groups</span>
              </div>
              <h1 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight">
                Curated <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-indigo to-brand-teal">Collections</span>
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg max-w-xl">
                Explore custom collections organized automatically by content formats and visual highlights.
              </p>
            </div>

            {/* Grid of collections */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collectionList.map((col, index) => {
                const Icon = col.icon;
                return (
                  <motion.div
                    key={col.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <div 
                      onClick={() => router.push(`/collections?type=${col.id}`)}
                      className="group cursor-pointer rounded-2xl border border-border/60 bg-card p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 flex flex-col justify-between h-48"
                    >
                      <div className="space-y-3">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${col.color} transition-all duration-300 group-hover:scale-105`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <h3 className="font-heading text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                          {col.name}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {col.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xs font-semibold text-muted-foreground bg-muted/65 px-2.5 py-1 rounded-full">
                          {loading ? "..." : `${col.count} ${col.count === 1 ? "item" : "items"}`}
                        </span>
                        <span className="text-xs font-bold text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 transition-transform">
                          Open Collection <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          /* Collection Detail view */
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            {/* Back to collections button */}
            <Button 
              variant="ghost" 
              onClick={() => router.push("/collections")} 
              className="gap-2 text-muted-foreground hover:text-foreground cursor-pointer rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Collections
            </Button>

            {/* Collection Header */}
            {activeCollection && (
              <div className="mb-10 flex items-start gap-4 border-b border-border/50 pb-6">
                <div className={`flex items-center justify-center w-14 h-14 rounded-2xl ${activeCollection.color} shadow-sm shrink-0`}>
                  <activeCollection.icon className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight">
                    {activeCollection.name}
                  </h1>
                  <p className="text-muted-foreground mt-1.5 text-sm sm:text-base">
                    {activeCollection.description}
                  </p>
                </div>
              </div>
            )}

            {/* Grid list of cards */}
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
            ) : displayedItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedItems.map((item) => (
                  <KnowledgeCard key={item.id} {...item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-muted/20 rounded-2xl border border-border/50">
                <Library className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h2 className="font-heading text-xl font-semibold mb-2">No items found</h2>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  There are no published items matching this collection category currently.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CollectionsPage() {
  return (
    <Suspense fallback={
      <div className="content-width py-12 min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <CollectionsContent />
    </Suspense>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Search, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KnowledgeCard } from "@/components/shared/knowledge-card";

// Start with empty data as requested
const categories = [
  "All",
  "Demo"
];

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const initialized = localStorage.getItem("demo_initialized");
    if (!initialized) {
      const demoItem = {
        id: "fake-demo-1",
        slug: "design-system-exploration",
        title: "Design System UI Inspiration",
        shortDescription: "Hover over this card to see a live slideshow of the uploaded UI components and design concepts inside this knowledge item.",
        date: new Date().toLocaleDateString(),
        category: "Demo",
        featured: true,
        thumbnail: "/images/Hero  landing page background.png",
        contentImages: [
          "/images/Hero  landing page background.png",
          "/images/logo.png",
          "/images/Default thumbnail placeholder (when admin doesn't upload one).png"
        ]
      };
      localStorage.setItem("library_items", JSON.stringify([demoItem]));
      localStorage.setItem("demo_initialized", "true");
    }

    const localData = JSON.parse(localStorage.getItem("library_items") || "[]");
    const formattedData = localData.map((item: any) => ({
      ...item,
      publishedAt: new Date(item.date),
      category: { name: item.category, slug: item.category.toLowerCase() }
    }));
    setItems(formattedData);
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesCategory = activeCategory === "All" || item.category?.name === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* ─── HERO BANNER ────────────────────────────────────────────── */}
      <div className="relative w-full h-[35vh] min-h-[250px] max-h-[400px] overflow-hidden group">
        <Image
          src="/images/Hero  landing page background.png"
          alt="Personal Library Hero"
          fill
          priority
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        {/* Dark overlay for better text contrast */}
        <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px]" />
        
        {/* Gradient fades */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-transparent" />

        <div className="absolute inset-0 flex flex-col items-center justify-center pb-8 px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="h-4 w-4" />
            <span>Your Ultimate Digital Archive</span>
          </div>
          <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-4 drop-shadow-xl animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Personal Library
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto drop-shadow-md font-medium animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
            Search, discover, and organize your curated knowledge from across the web.
          </p>
        </div>
      </div>

      {/* ─── SEARCH & FILTER HEADER ──────────────────────────────────────────── */}
      <div className="sticky top-16 z-30 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40 border-b border-border/40 pb-4 pt-6 shadow-sm">
        <div className="content-width flex flex-col gap-6">
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto w-full relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-brand-indigo/30 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative flex items-center bg-background border border-border/60 rounded-full focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all duration-300 shadow-xl shadow-black/5 hover:shadow-lg hover:border-primary/50">
              <Search className="ml-6 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search your personal library..."
                className="border-0 bg-transparent h-14 text-base focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50 rounded-full px-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                size="icon"
                className="mr-2 h-10 w-10 rounded-full shrink-0 cursor-pointer bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => {}}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Category Pills (YouTube Style) */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`snap-start whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer border ${
                  activeCategory === category
                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-105"
                    : "bg-background/60 hover:bg-muted border-border/50 text-foreground hover:border-border hover:shadow-sm"
                }`}
              >
                {category}
              </button>
            ))}
            <Link href="/categories" className="snap-start shrink-0 ml-2">
              <Button variant="ghost" size="sm" className="h-10 px-4 rounded-full text-muted-foreground cursor-pointer hover:bg-muted/80">
                View all <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── GRID CONTENT ─────────────────────────────────────────────────── */}
      <div className="content-width py-8 flex-1">
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
            {filteredItems.map((item) => (
              <KnowledgeCard
                key={item.id}
                id={item.id}
                slug={item.slug}
                title={item.title}
                shortDescription={item.shortDescription}
                publishedAt={item.publishedAt}
                category={item.category}
                featured={item.featured}
                popular={item.popular}
                thumbnail={item.thumbnail}
                contentImages={item.contentImages}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-heading text-xl font-bold mb-2">No items found</h3>
            <p className="text-muted-foreground max-w-sm">
              You haven't uploaded anything to this category yet. Head over to the admin panel to start saving!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


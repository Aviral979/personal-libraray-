"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Search, ChevronRight, Sparkles, BookOpen, Clock, TrendingUp } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KnowledgeCard } from "@/components/shared/knowledge-card";


export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [dynamicCategories, setDynamicCategories] = useState<string[]>(["All"]);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const fetchKnowledge = async () => {
      try {
        const q = query(collection(db, "knowledgeItems"), where("status", "==", "PUBLISHED"));
        const querySnapshot = await getDocs(q);
        const fetchedItems = querySnapshot.docs.map(doc => {
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
              slug: (data.category || "uncategorized").toLowerCase() 
            }
          };
        });
        setItems(fetchedItems);
        
        const uniqueCategories = Array.from(
          new Set(fetchedItems.map(item => item.category?.name))
        ).filter(Boolean) as string[];
        
        setDynamicCategories(["All", ...uniqueCategories.sort()]);
      } catch (error) {
        console.error("Error fetching from Firebase:", error);
      }
    };
    fetchKnowledge();
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesCategory = activeCategory === "All" || item.category?.name === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* ─── PREMIUM HERO & SEARCH ────────────────────────────────────────────── */}
      <div className="relative w-full min-h-[65vh] flex flex-col items-center justify-center overflow-hidden pt-20 pb-12">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/Hero  landing page background.png"
            alt="Personal Library Hero"
            fill
            priority
            className="object-cover scale-105"
          />
          {/* Changed backdrop-blur-md to backdrop-blur-sm for less blur */}
          <div className="absolute inset-0 bg-background/55 backdrop-blur-sm dark:bg-background/75" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 text-center space-y-6 mt-8">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/55 border border-white/10 backdrop-blur-sm shadow-xl text-primary text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="h-4 w-4 text-brand-teal" />
            <span className="text-foreground font-semibold">Welcome to your Personal Library</span>
          </div>
          
          <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight drop-shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-indigo to-brand-teal">Knowledge</span>
          </h1>
          
          <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto drop-shadow-md font-medium animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
            Search your curated collection of articles, videos, and insights saved from across the web.
          </p>

          {/* Premium Search Bar */}
          <div className={`relative max-w-3xl mx-auto w-full transition-all duration-500 transform ${isFocused ? 'scale-[1.02] -translate-y-1' : 'scale-100'} animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300`}>
            <div className={`absolute -inset-1 bg-gradient-to-r from-brand-indigo via-brand-teal to-brand-indigo rounded-2xl blur-lg transition-all duration-500 ${isFocused ? 'opacity-70' : 'opacity-20'}`}></div>
            <div className="relative flex items-center bg-background/90 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-2 shadow-2xl transition-all duration-500">
              <div className="p-3">
                <Search className={`h-6 w-6 transition-colors duration-300 ${isFocused ? 'text-brand-indigo' : 'text-muted-foreground'}`} />
              </div>
              <Input
                placeholder="What are you looking for today?"
                className="border-0 bg-transparent h-14 text-lg focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60 px-2 font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
              <Button
                className="h-12 px-8 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-semibold shadow-md transition-all duration-300 hover:shadow-lg cursor-pointer"
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── CATEGORY NAVIGATION ──────────────────────────────────────────── */}
      <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-2xl border-b border-border/50 py-4 shadow-sm">
        <div className="content-width">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide snap-x flex-1">
              {dynamicCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`snap-start whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer ${
                    activeCategory === category
                      ? "bg-foreground text-background shadow-md scale-105"
                      : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <Link href="/categories" className="hidden sm:block shrink-0 ml-4 border-l pl-4 border-border/50">
              <Button variant="ghost" className="rounded-full font-medium hover:bg-muted/80 cursor-pointer">
                All Categories <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── GRID CONTENT ─────────────────────────────────────────────────── */}
      <div className="content-width py-12 flex-1">
        {/* Quick Stats / Headers based on state */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-heading text-2xl font-bold flex items-center gap-2">
            {searchQuery ? (
              <>Search Results <span className="text-brand-indigo">"{searchQuery}"</span></>
            ) : activeCategory === "All" ? (
              <><TrendingUp className="h-6 w-6 text-brand-teal" /> Latest Additions</>
            ) : (
              <><BookOpen className="h-6 w-6 text-brand-indigo" /> {activeCategory}</>
            )}
          </h2>
          <p className="text-muted-foreground font-medium text-sm">
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
          </p>
        </div>

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredItems.map((item, index) => (
              <div 
                key={item.id} 
                className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <KnowledgeCard
                  id={item.id}
                  slug={item.slug}
                  title={item.title}
                  shortDescription={item.shortDescription}
                  thumbnail={item.coverImage || item.thumbnail}
                  category={item.category}
                  publishedAt={item.publishedAt}
                  authorName={item.authorName}
                  contentImages={item.contentImages}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-muted/30 rounded-3xl border border-dashed border-border/60">
            <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center shadow-lg mb-6">
              <Search className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="font-heading text-2xl font-bold mb-2">No results found</h3>
            <p className="text-muted-foreground max-w-md">
              We couldn't find any knowledge items matching your current filters. Try adjusting your search or category.
            </p>
            <Button 
              className="mt-8 rounded-full px-8 cursor-pointer"
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("All");
              }}
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

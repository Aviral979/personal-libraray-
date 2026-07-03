"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, Folder, FileText, Download, PlayCircle, ExternalLink, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

// This is the detail page for displaying knowledge items
export default function KnowledgeDetailPage({ params }: { params: { slug: string } }) {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const q = query(collection(db, "knowledgeItems"), where("slug", "==", params.slug));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();
          setContent({
            title: docData.title,
            subtitle: docData.subtitle,
            shortDescription: docData.shortDescription,
            publishedAt: docData.createdAt ? new Date(docData.createdAt).toLocaleDateString() : docData.date ? new Date(docData.date).toLocaleDateString() : new Date().toLocaleDateString(),
            category: docData.category || "Uncategorized",
            tags: docData.tags || [],
            thumbnail: docData.thumbnail || "/images/Default thumbnail placeholder (when admin doesn't upload one).png",
            images: docData.contentImages || [],
            videos: docData.videos || [],
            files: docData.files || [],
            externalLink: docData.link || ""
          });
        }
      } catch (error) {
        console.error("Error fetching detail from Firebase:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchItem();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background space-y-4">
        <h1 className="font-heading text-3xl font-bold">Item not found</h1>
        <p className="text-muted-foreground">The knowledge item you are looking for does not exist or has been removed.</p>
        <Link href="/">
          <Button variant="outline">Return Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* ─── FULL WIDTH HERO THUMBNAIL ────────────────────────────────────────────── */}
      <div className="relative w-full h-[40vh] min-h-[300px] max-h-[500px]">
        <img
          src={content.thumbnail}
          alt={content.title}
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        
        {/* Back Button Floating */}
        <div className="absolute top-6 left-6 z-10">
          <Link href="/">
            <Button variant="secondary" size="icon" className="rounded-full shadow-lg bg-background/80 backdrop-blur-md hover:bg-background">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-20 relative z-10">
        {/* ─── HEADER CONTENT ────────────────────────────────────────────────────── */}
        <div className="bg-card rounded-2xl shadow-xl border border-border/50 p-8 mb-8 backdrop-blur-sm bg-card/95">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge variant="default" className="bg-primary/20 text-primary hover:bg-primary/30 gap-1 border-none">
              <Folder className="h-3 w-3" />
              {content.category}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{content.publishedAt}</span>
            </div>
          </div>
          
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-2 tracking-tight leading-tight">
            {content.title}
          </h1>

          {content.subtitle && (
            <h2 className="text-xl md:text-2xl text-muted-foreground font-medium mb-6">
              {content.subtitle}
            </h2>
          )}
          
          <div className="flex flex-wrap gap-2">
            {content.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="bg-muted text-muted-foreground">
                {tag}
              </Badge>
            ))}
          </div>

          {content.externalLink && (
            <div className="mt-8 pt-6 border-t border-border/50">
              <Link href={content.externalLink} target="_blank">
                <Button className="gap-2 bg-brand-indigo hover:bg-brand-indigo/90 text-white shadow-sm">
                  <ExternalLink className="h-4 w-4" />
                  Visit External Reference
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* ─── DESCRIPTION SECTION ───────────────────────────────────────────────── */}
        <div className="prose prose-neutral dark:prose-invert max-w-none mb-12 px-2">
          <p className="text-lg leading-relaxed text-foreground/90">{content.shortDescription}</p>
        </div>

        {/* ─── RELATED MEDIA (PHOTOS & VIDEOS) ─────────────────────────────────── */}
        <div className="space-y-12">
          
          {/* Images Section */}
          {content.images.length > 0 && (
            <section>
              <h2 className="font-heading text-2xl font-semibold mb-6 flex items-center gap-2">
                Images & Screenshots
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {content.images.map((img: string, idx: number) => (
                  <Dialog key={idx}>
                    <DialogTrigger render={
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-border/50 shadow-sm group cursor-pointer" />
                    }>
                        <img
                          src={img}
                          alt={`Related image ${idx + 1}`}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    </DialogTrigger>
                    <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden bg-black/90 border-none">
                      <img src={img} alt={`Fullscreen ${idx}`} className="w-full h-full object-contain" />
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            </section>
          )}

          {/* Videos Section */}
          {content.videos.length > 0 && (
            <section>
              <h2 className="font-heading text-2xl font-semibold mb-6 flex items-center gap-2">
                Video Recordings
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {content.videos.map((vid: any) => (
                  <Dialog key={vid.id}>
                    <DialogTrigger render={
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-border/50 shadow-sm bg-muted flex items-center justify-center group cursor-pointer hover:border-primary/50 transition-colors" />
                    }>
                        <PlayCircle className="h-16 w-16 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-sm font-medium bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-md">
                          <span className="truncate pr-2">{vid.title}</span>
                          <Badge variant="secondary" className="shrink-0">{vid.duration}</Badge>
                        </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-[90vw] p-0 overflow-hidden bg-black/90 border-none">
                      <video src={vid.url} controls autoPlay className="w-full max-h-[85vh] outline-none" />
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            </section>
          )}

          <Separator className="my-8" />

          {/* ─── ATTACHED FILES ───────────────────────────────────────────────────── */}
          {content.files.length > 0 && (
            <section>
              <h2 className="font-heading text-2xl font-semibold mb-6">Attached Files & Documents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {content.files.map((file: any) => (
                  <div key={file.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-brand-warning/10 flex items-center justify-center text-brand-warning">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium truncate max-w-[200px] sm:max-w-[250px]" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {file.type} • {file.size}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}

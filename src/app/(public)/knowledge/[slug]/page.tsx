"use client";

import Link from "next/link";
import { useState, useEffect, use } from "react";
import { ArrowLeft, Calendar, Folder, FileText, Download, PlayCircle, ExternalLink, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// This is the detail page for displaying knowledge items
export default function KnowledgeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  // Next.js 16: params is a Promise, unwrap it with React.use()
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        let docData = null;

        // Try 1: Fetch by Document ID (cards link by Firebase doc ID)
        try {
          const docRef = doc(db, "knowledgeItems", slug);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            docData = docSnap.data();
          }
        } catch {
          // Invalid document ID format, skip
        }
        
        // Try 2: Search by slug field
        if (!docData) {
          const q = query(collection(db, "knowledgeItems"), where("slug", "==", slug));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            docData = querySnapshot.docs[0].data();
          }
        }

        // Try 3: Brute force - check all docs
        if (!docData) {
          const allDocs = await getDocs(collection(db, "knowledgeItems"));
          for (const d of allDocs.docs) {
            const data = d.data();
            const generatedSlug = data.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            if (generatedSlug === slug || d.id === slug) {
              docData = data;
              break;
            }
          }
        }
        
        if (docData) {
          setContent({
            title: docData.title,
            subtitle: docData.subtitle,
            shortDescription: docData.shortDescription,
            publishedAt: docData.date ? new Date(docData.date).toLocaleDateString() : new Date().toLocaleDateString(),
            category: docData.category || "Uncategorized",
            tags: docData.tags || [],
            thumbnail: docData.thumbnail || "",
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
  }, [slug]);

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
      {/* ─── HERO THUMBNAIL ───────────────────────────────── */}
      {content.thumbnail && (
        <div className="relative w-full h-[40vh] min-h-[300px] max-h-[500px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={content.thumbnail} alt={content.title} className="object-cover w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
      )}

      {/* Back Button */}
      <div className={`${content.thumbnail ? 'absolute top-6 left-6 z-10' : 'max-w-4xl mx-auto px-4 pt-6'}`}>
        <Link href="/">
          <Button variant="secondary" size="icon" className="rounded-full shadow-lg bg-background/80 backdrop-blur-md hover:bg-background">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      <div className={`max-w-4xl mx-auto px-4 sm:px-6 ${content.thumbnail ? '-mt-20 relative z-10' : 'mt-4'}`}>
        {/* ─── HEADER CONTENT ───────────────────────────────── */}
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
          
          {content.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {content.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="bg-muted text-muted-foreground">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {content.externalLinks && content.externalLinks.length > 0 ? (
            <div className="mt-8 pt-6 border-t border-border/50">
              <h3 className="font-heading text-xl font-semibold mb-4">External Resources</h3>
              <div className="flex flex-wrap gap-3">
                {content.externalLinks.map((ext: any) => (
                  <a key={ext.id} href={ext.url} target="_blank" rel="noopener noreferrer" className="block">
                    <Button className="gap-2 bg-brand-indigo hover:bg-brand-indigo/90 text-white shadow-sm">
                      <ExternalLink className="h-4 w-4" />
                      {ext.note || "Visit Resource"}
                    </Button>
                  </a>
                ))}
              </div>
            </div>
          ) : content.externalLink ? (
            <div className="mt-8 pt-6 border-t border-border/50">
              <a href={content.externalLink} target="_blank" rel="noopener noreferrer">
                <Button className="gap-2 bg-brand-indigo hover:bg-brand-indigo/90 text-white shadow-sm">
                  <ExternalLink className="h-4 w-4" />
                  Visit External Reference
                </Button>
              </a>
            </div>
          ) : null}
        </div>

        {/* ─── DESCRIPTION ───────────────────────────────── */}
        {content.shortDescription && (
          <div className="mb-12 px-2">
            <p className="text-lg leading-relaxed text-foreground/90">{content.shortDescription}</p>
          </div>
        )}

        {/* ─── MEDIA SECTIONS ───────────────────────────────── */}
        <div className="space-y-12">
          
          {/* Images */}
          {content.images.length > 0 && (
            <section>
              <h2 className="font-heading text-2xl font-semibold mb-6">Images & Screenshots</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {content.images.map((img: any, idx: number) => {
                  const url = typeof img === 'string' ? img : img.url;
                  const note = typeof img === 'string' ? `Image ${idx + 1}` : (img.note || `Image ${idx + 1}`);
                  return (
                    <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="block">
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-border/50 shadow-sm group cursor-pointer bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={note} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-xs truncate opacity-0 group-hover:opacity-100 transition-opacity">
                          {note}
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </section>
          )}

          {/* Videos */}
          {content.videos.length > 0 && (
            <section>
              <h2 className="font-heading text-2xl font-semibold mb-6">Video Recordings</h2>
              <div className="grid grid-cols-1 gap-4">
                {content.videos.map((vid: any) => {
                  const isYouTube = vid.url.includes("youtube.com") || vid.url.includes("youtu.be");
                  let ytEmbedUrl = "";
                  if (isYouTube) {
                    const videoId = vid.url.includes("v=") ? vid.url.split("v=")[1].split("&")[0] : vid.url.split("/").pop();
                    ytEmbedUrl = `https://www.youtube.com/embed/${videoId}`;
                  }
                  
                  return (
                    <div key={vid.id} className="rounded-xl overflow-hidden border border-border/50 shadow-sm bg-black">
                      {isYouTube ? (
                        <iframe 
                          src={ytEmbedUrl} 
                          title={vid.title}
                          className="w-full aspect-video" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                        />
                      ) : (
                        <video src={vid.url} controls className="w-full max-h-[60vh] outline-none" />
                      )}
                      <div className="p-3 bg-card flex justify-between items-center">
                        <span className="font-medium text-sm truncate pr-2">{vid.title}</span>
                        <Badge variant="secondary" className="shrink-0">{vid.duration}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Files */}
          {content.files.length > 0 && (
            <section>
              <Separator className="mb-8" />
              <h2 className="font-heading text-2xl font-semibold mb-6">Attached Files & Documents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {content.files.map((file: any) => (
                  <a key={file.id} href={file.url} target="_blank" rel="noopener noreferrer" className="block">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-brand-warning/10 flex items-center justify-center text-brand-warning">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium truncate max-w-[200px] sm:max-w-[250px]">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{file.type} • {file.size}</p>
                        </div>
                      </div>
                      <Download className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState, useEffect, use } from "react";
import { ArrowLeft, Calendar, Folder, FileText, Download, PlayCircle, ExternalLink, Loader2, Link as LinkIcon } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Helper: Convert any Google Drive link to a direct-renderable image URL
function toDriveDirectUrl(url: string): string {
  if (!url) return url;
  
  let cleanUrl = url.trim();
  
  // Extract real image from Google search redirect URL (imgurl parameter)
  const googleImgMatch = cleanUrl.match(/[?&]imgurl=([^&]+)/);
  if (googleImgMatch && googleImgMatch[1]) {
    try {
      cleanUrl = decodeURIComponent(googleImgMatch[1]);
    } catch (e) {
      console.error("Failed to decode google imgurl on detail page", e);
    }
  }

  // Format: https://drive.google.com/file/d/FILE_ID/view...
  const fileMatch = cleanUrl.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (fileMatch && fileMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${fileMatch[1]}&sz=w1200`;
  }
  // Format: https://drive.google.com/open?id=FILE_ID
  const openMatch = cleanUrl.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (openMatch && openMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${openMatch[1]}&sz=w1200`;
  }
  // Format: https://drive.google.com/uc?id=FILE_ID
  const ucMatch = cleanUrl.match(/drive\.google\.com\/uc\?.*id=([^&]+)/);
  if (ucMatch && ucMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${ucMatch[1]}&sz=w1200`;
  }
  return cleanUrl;
}

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
        let docRefToUpdate = null;

        // Try 1: Fetch by Document ID (cards link by Firebase doc ID)
        try {
          const docRef = doc(db, "knowledgeItems", slug);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            docData = docSnap.data();
            docRefToUpdate = docRef;
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
            docRefToUpdate = querySnapshot.docs[0].ref;
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
              docRefToUpdate = d.ref;
              break;
            }
          }
        }
        
        if (docData) {
          // Check for TRASH status
          if (docData.status === "TRASH") {
            docData = null;
            docRefToUpdate = null;
          } else {
            // Auto Tags Generation
          let autoTags = [];
          const views = docData.views || 0;
          if (views > 50) autoTags.push("🔥 Most Viewed");
          
          let dateObj = new Date();
          if (docData.date) {
            try { dateObj = new Date(docData.date); } catch(e) {}
          } else if (docData.createdAt) {
             dateObj = new Date(docData.createdAt);
          }
          
          const isRecent = (new Date().getTime() - dateObj.getTime()) < 7 * 24 * 60 * 60 * 1000;
          if (isRecent) autoTags.push("✨ Recently Added");
          
          const combinedTags = [...(docData.tags || []), ...autoTags];

          // Check for files that are actually images and move them to contentImages
          const isImageUrl = (urlStr: string): boolean => {
            if (!urlStr) return false;
            return urlStr.match(/\.(jpeg|jpg|gif|png|webp|svg|bmp|tiff|ico)(\?.*)?$/i) !== null || 
                   urlStr.includes('drive.google.com/file/d/') || 
                   urlStr.includes('drive.google.com/open?id=') || 
                   urlStr.includes('googleusercontent.com') ||
                   urlStr.includes('gstatic.com') ||
                   urlStr.includes('images.unsplash.com') || 
                   urlStr.includes('i.imgur.com') || 
                   urlStr.includes('pbs.twimg.com') || 
                   urlStr.includes('instagram') || 
                   urlStr.includes('pinimg.com');
          };

          const rawFiles = docData.files || [];
          const processedFiles: any[] = [];
          const extraImages: any[] = [];
          
          rawFiles.forEach((file: any) => {
            if (file && file.url && isImageUrl(file.url)) {
              extraImages.push({
                id: file.id,
                url: file.url,
                note: file.name || "Attached Image"
              });
            } else {
              processedFiles.push(file);
            }
          });

          setContent({
            title: docData.title,
            subtitle: docData.subtitle,
            shortDescription: docData.shortDescription,
            publishedAt: dateObj.toLocaleDateString(),
            category: docData.category || "Uncategorized",
            tags: combinedTags,
            thumbnail: docData.thumbnail || "",
            contentImages: [...(docData.contentImages || []), ...extraImages],
            videos: docData.videos || [],
            files: processedFiles,
            externalLinks: docData.externalLinks || [],
            externalLink: docData.link || docData.externalLink || "",
            views: views + 1
          });

          // Increment view count in background
          if (docRefToUpdate) {
            try {
              await updateDoc(docRefToUpdate, {
                views: increment(1)
              });
            } catch (updateErr) {
              console.error("Failed to update views", updateErr);
            }
          }
          }
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
          <img src={toDriveDirectUrl(content.thumbnail)} alt={content.title} loading="lazy" className="object-cover w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
      )}



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

        </div>

        {/* ─── DESCRIPTION ───────────────────────────────── */}
        {content.shortDescription && (
          <div className="mb-14 px-5 sm:px-8 py-8 bg-card rounded-2xl shadow-sm border border-border/40 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-primary/80 to-primary/20"></div>
            <div className="text-lg leading-[1.8] text-foreground/80 whitespace-pre-wrap font-sans tracking-wide first-letter:text-6xl first-letter:font-bold first-letter:text-primary first-letter:mr-2 first-letter:mt-1 first-letter:float-left first-line:tracking-widest">
              {content.shortDescription}
            </div>
          </div>
        )}

        {/* ─── EXTERNAL LINKS SECTION ──────────────────────── */}
        {(content.externalLinks?.length > 0 || content.externalLink) && (
          <div className="mb-14">
            <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ExternalLink className="h-5 w-5 text-primary" />
              </div>
              References & Links
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {content.externalLinks?.length > 0 ? (
                content.externalLinks.map((ext: any) => (
                  <a key={ext.id} href={ext.url} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all">
                    <div className="mt-0.5 shrink-0 h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <LinkIcon className="h-4 w-4" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-medium text-base mb-1 truncate text-foreground group-hover:text-primary transition-colors">{ext.note || "Visit Resource"}</p>
                      <p className="text-xs text-muted-foreground truncate">{ext.url}</p>
                    </div>
                  </a>
                ))
              ) : (
                <a href={content.externalLink} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all">
                  <div className="mt-0.5 shrink-0 h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <LinkIcon className="h-4 w-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-medium text-base mb-1 truncate text-foreground group-hover:text-primary transition-colors">Visit External Reference</p>
                    <p className="text-xs text-muted-foreground truncate">{content.externalLink}</p>
                  </div>
                </a>
              )}
            </div>
          </div>
        )}

        {/* ─── MEDIA SECTIONS ───────────────────────────────── */}
        <div className="space-y-12">
          
          {/* Images */}
          {content.contentImages && content.contentImages.length > 0 && (
            <section>
              <h2 className="font-heading text-2xl font-semibold mb-6">Images & Screenshots</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {content.contentImages.map((img: any, idx: number) => {
                  const rawUrl = typeof img === 'string' ? img : img.url;
                  const url = toDriveDirectUrl(rawUrl);
                  const note = typeof img === 'string' ? `Image ${idx + 1}` : (img.note || `Image ${idx + 1}`);
                  return (
                    <a key={idx} href={rawUrl} target="_blank" rel="noopener noreferrer" className="block">
                      <div className="rounded-xl overflow-hidden border border-border/50 shadow-sm group cursor-pointer bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={note} loading="lazy" className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105" />
                        <div className="bg-card/80 text-foreground p-2 text-xs truncate">
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
          {content.videos && content.videos.length > 0 && (
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
          {content.files && content.files.length > 0 && (
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

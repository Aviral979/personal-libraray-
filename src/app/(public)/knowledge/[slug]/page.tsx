import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Folder, FileText, Download, PlayCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

// This is a demo page for displaying knowledge items as requested
export default function KnowledgeDetailPage({ params }: { params: { slug: string } }) {
  // Mock data for demo purposes based on the fake item created earlier
  const isDemo = params.slug === "design-system-exploration";
  
  const content = {
    title: isDemo ? "Design System UI Inspiration" : "Sample Knowledge Item",
    subtitle: isDemo ? "Exploring how UI/UX concepts impact user flow and engagement." : "",
    shortDescription: isDemo 
      ? "This is a detailed overview of the design system components, including buttons, typography, colors, and layout spacing. Hover over the main card to see a live slideshow of the uploaded UI components and design concepts inside this knowledge item. This placeholder text serves as the main article description that comes below the header." 
      : "This is a placeholder description for the knowledge content.",
    publishedAt: new Date().toLocaleDateString(),
    category: isDemo ? "Demo" : "General",
    tags: ["UI/UX", "Design", "Inspiration"],
    thumbnail: isDemo ? "/images/Hero  landing page background.png" : "/images/Default thumbnail placeholder (when admin doesn't upload one).png",
    images: [
      "/images/Hero  landing page background.png",
      "/images/logo.png"
    ],
    videos: [
      { id: "vid1", title: "Design Walkthrough", duration: "2:45", url: "https://www.w3schools.com/html/mov_bbb.mp4" }
    ],
    files: [
      { id: "file1", name: "design_system_guidelines.pdf", size: "2.4 MB", type: "PDF" },
      { id: "file2", name: "color_tokens.csv", size: "14 KB", type: "CSV" }
    ],
    externalLink: "https://dribbble.com/shots/popular/web-design"
  };

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
            {content.tags.map((tag) => (
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
                {content.images.map((img, idx) => (
                  <Dialog key={idx}>
                    <DialogTrigger asChild>
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-border/50 shadow-sm group cursor-pointer">
                        <img
                          src={img}
                          alt={`Related image ${idx + 1}`}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
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
                {content.videos.map((vid) => (
                  <Dialog key={vid.id}>
                    <DialogTrigger asChild>
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-border/50 shadow-sm bg-muted flex items-center justify-center group cursor-pointer hover:border-primary/50 transition-colors">
                        <PlayCircle className="h-16 w-16 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-sm font-medium bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-md">
                          <span className="truncate pr-2">{vid.title}</span>
                          <Badge variant="secondary" className="shrink-0">{vid.duration}</Badge>
                        </div>
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
                {content.files.map((file) => (
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

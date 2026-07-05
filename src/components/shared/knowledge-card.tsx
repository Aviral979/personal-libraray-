"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Calendar, Folder } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Helper: Convert any Google Drive link to a direct-renderable image URL
function toDriveDirectUrl(url: string): string {
  if (!url) return url;
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (fileMatch && fileMatch[1]) return `https://drive.google.com/thumbnail?id=${fileMatch[1]}&sz=w600`;
  const openMatch = url.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (openMatch && openMatch[1]) return `https://drive.google.com/thumbnail?id=${openMatch[1]}&sz=w600`;
  const ucMatch = url.match(/drive\.google\.com\/uc\?.*id=([^&]+)/);
  if (ucMatch && ucMatch[1]) return `https://drive.google.com/thumbnail?id=${ucMatch[1]}&sz=w600`;
  return url;
}

export interface KnowledgeCardProps {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string | null;
  thumbnail?: string | null;
  publishedAt?: Date | null;
  category?: {
    name: string;
    slug: string;
  } | null;
  tags?: {
    name: string;
    slug: string;
  }[];
  featured?: boolean;
  popular?: boolean;
  contentImages?: string[];
  authorName?: string;
}

export function KnowledgeCard({
  id,
  slug,
  title,
  shortDescription,
  thumbnail,
  publishedAt,
  category,
  featured,
  popular,
  contentImages = [],
  authorName,
}: KnowledgeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHovered && contentImages.length > 0) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % contentImages.length);
      }, 1200);
    } else {
      setCurrentImageIndex(0);
    }
    return () => clearInterval(interval);
  }, [isHovered, contentImages.length]);

  const rawDisplayImage = (isHovered && contentImages.length > 0) 
    ? contentImages[currentImageIndex] 
    : (thumbnail || "/images/Default thumbnail placeholder (when admin doesn't upload one).png");
  const displayImage = toDriveDirectUrl(rawDisplayImage);

  // Use document ID for routing so detail page can always find it
  const linkHref = `/knowledge/${id}`;

  return (
    <Link href={linkHref} className="block h-full">
      <Card 
        className="group h-full flex flex-col overflow-hidden rounded-2xl border border-border/30 bg-card shadow-md hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Thumbnail */}
        <div className="relative w-full aspect-video shrink-0 overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayImage}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ease-out"
          />

          {/* Gradient overlay at bottom for text contrast */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {featured && (
              <Badge variant="default" className="bg-brand-indigo hover:bg-brand-indigo/90 shadow-md text-xs">
                Featured
              </Badge>
            )}
            {popular && (
              <Badge variant="default" className="bg-brand-warning text-brand-warning-foreground hover:bg-brand-warning/90 shadow-md text-xs">
                Popular
              </Badge>
            )}
          </div>
          
          {/* Category Badge - Bottom Right */}
          {category && (
            <div className="absolute bottom-3 right-3">
              <Badge variant="secondary" className="bg-background/80 backdrop-blur-md shadow-sm gap-1 text-xs font-medium">
                <Folder className="h-3 w-3" />
                {category.name}
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-5 sm:p-6 flex flex-col flex-1">
          {/* Date & Author */}
          <div className="flex items-center justify-between gap-1.5 text-xs text-muted-foreground mb-3">
            {publishedAt && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDistanceToNow(new Date(publishedAt), { addSuffix: true })}</span>
              </div>
            )}
            {authorName && (
              <div className="flex items-center gap-1.5 text-primary/80 font-medium truncate max-w-[120px]">
                By {authorName}
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="font-heading font-bold text-lg sm:text-xl leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>

          {/* Description */}
          {shortDescription && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1">
              {shortDescription}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

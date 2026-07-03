"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Calendar, Tag, Folder } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

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
}

export function KnowledgeCard({
  slug,
  title,
  shortDescription,
  thumbnail,
  publishedAt,
  category,
  tags = [],
  featured,
  popular,
  contentImages = [],
}: KnowledgeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHovered && contentImages.length > 0) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % contentImages.length);
      }, 1000); // change image every 1 second
    } else {
      setCurrentImageIndex(0); // reset when not hovered
    }
    return () => clearInterval(interval);
  }, [isHovered, contentImages.length]);

  const displayImage = (isHovered && contentImages.length > 0) 
    ? contentImages[currentImageIndex] 
    : (thumbnail || "/images/Default thumbnail placeholder (when admin doesn't upload one).png");

  return (
    <Link href={`/knowledge/${slug}`}>
      <Card className="group h-full overflow-hidden border-border/40 bg-card hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 transition-all duration-500 hover:-translate-y-1.5 cursor-pointer">
        {/* Thumbnail Area */}
        <div 
          className="relative aspect-video w-full overflow-hidden bg-muted"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={displayImage}
              initial={{ opacity: 0.5, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0.5, filter: "blur(4px)" }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              <Image
                src={displayImage}
                alt={title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110 ease-out"
              />
            </motion.div>
          </AnimatePresence>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {featured && (
              <Badge variant="default" className="bg-brand-indigo hover:bg-brand-indigo/90 shadow-sm">
                Featured
              </Badge>
            )}
            {popular && (
              <Badge variant="default" className="bg-brand-warning text-brand-warning-foreground hover:bg-brand-warning/90 shadow-sm">
                Popular
              </Badge>
            )}
          </div>
          
          {/* Category Badge - Bottom Right */}
          {category && (
            <div className="absolute bottom-3 right-3">
              <Badge variant="secondary" className="bg-background/80 backdrop-blur-md shadow-sm gap-1 text-xs">
                <Folder className="h-3 w-3" />
                {category.name}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-5 flex flex-col flex-1">
          {/* Meta Info */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
            {publishedAt && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(publishedAt), { addSuffix: true })}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="font-heading font-semibold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Description */}
          {shortDescription && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4 flex-1">
              {shortDescription}
            </p>
          )}

          {/* Tags Footer */}
          <div className="mt-auto pt-4 border-t border-border/50 flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag.slug} className="flex items-center gap-1 text-xs text-muted-foreground">
                <Tag className="h-3 w-3" />
                {tag.name}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-muted-foreground">+{tags.length - 3}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

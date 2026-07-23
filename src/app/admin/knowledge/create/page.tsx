"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Image as ImageIcon, Link as LinkIcon, FileText, Video, Upload, ScanText, Copy, Trash2 } from "lucide-react";
import { db, storage } from "@/lib/firebase";
import { collection, doc, setDoc, updateDoc, getDoc, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Tesseract from 'tesseract.js';
import { useSession } from "next-auth/react";

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

export default function CreateKnowledgePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [ocrText, setOcrText] = useState("");
  const [ocrImage, setOcrImage] = useState<string | null>(null);
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [ocrLines, setOcrLines] = useState<any[]>([]);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  // Direct file upload to Firebase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadedImages: { id: string; url: string; note: string }[] = [];
    const uploadedVideos: { id: string; title: string; url: string; duration: string }[] = [];
    const uploadedFiles: { id: string; name: string; url: string; size: string; type: string }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `uploads/${timestamp}_${safeName}`;

      try {
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        if (file.type.startsWith('image/')) {
          uploadedImages.push({ id: `img-${timestamp}-${i}`, url: downloadURL, note: `Image ${file.name}` });
        } else if (file.type.startsWith('video/')) {
          uploadedVideos.push({
            id: `vid-${timestamp}-${i}`,
            title: file.name,
            url: downloadURL,
            duration: 'Unknown'
          });
        } else {
          const sizeStr = file.size < 1024 * 1024
            ? `${(file.size / 1024).toFixed(1)} KB`
            : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
          uploadedFiles.push({
            id: `file-${timestamp}-${i}`,
            name: file.name,
            url: downloadURL,
            size: sizeStr,
            type: file.type || 'Unknown'
          });
        }
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setFormData(prev => ({
      ...prev,
      contentImages: [...prev.contentImages, ...uploadedImages],
      videos: [...prev.videos, ...uploadedVideos],
      files: [...prev.files, ...uploadedFiles]
    }));

    const total = uploadedImages.length + uploadedVideos.length + uploadedFiles.length;
    if (total > 0) {
      toast.success(`${total} file(s) uploaded successfully!`);
    }
    setIsUploading(false);
    // Reset the input so the same file can be selected again
    e.target.value = '';
  };

  // Thumbnail direct upload
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storageRef = ref(storage, `thumbnails/${timestamp}_${safeName}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setFormData(prev => ({ ...prev, thumbnailUrl: downloadURL }));
      toast.success('Thumbnail uploaded!');
    } catch (error) {
      console.error('Thumbnail upload error:', error);
      toast.error('Failed to upload thumbnail');
    }
    setIsUploading(false);
    e.target.value = '';
  };
  
  // Basic form state
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    shortDescription: "",
    status: "DRAFT",
    visibility: "PUBLIC",
    category: "",
    thumbnailUrl: "",
    externalLinks: [] as { id: string; url: string; note: string }[],
    contentImages: [] as { id: string; url: string; note: string }[],
    videos: [] as { id: string; title: string; url: string; duration: string }[],
    files: [] as { id: string; name: string; url: string; size: string; type: string }[]
  });

  const [urlInput, setUrlInput] = useState("");
  const [urlNoteInput, setUrlNoteInput] = useState("");
  const [urlMediaType, setUrlMediaType] = useState("auto");
  const [extUrlInput, setExtUrlInput] = useState("");
  const [extNoteInput, setExtNoteInput] = useState("");
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Fetch unique existing categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "knowledgeItems"));
        const cats = new Set<string>();
        querySnapshot.forEach((doc) => {
          const cat = doc.data().category;
          if (cat) cats.add(cat);
        });
        setExistingCategories(Array.from(cats).sort());
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Load existing data if editing
  useEffect(() => {
    const fetchEditData = async () => {
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const editId = urlParams.get("edit");
        
        if (editId) {
          try {
            const docRef = doc(db, "knowledgeItems", editId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
              const editItem = docSnap.data();

              // Check if user is author or ADMIN/SUPER_ADMIN
              if (
                editItem.authorId && 
                editItem.authorId !== session?.user?.id && 
                session?.user?.role !== "SUPER_ADMIN" && 
                session?.user?.role !== "ADMIN"
              ) {
                toast.error("You don't have permission to edit this item");
                router.push("/admin/knowledge");
                return;
              }

              if (editItem.category) {
                setExistingCategories(prev => {
                  if (!prev.includes(editItem.category)) {
                    return [...prev, editItem.category].sort();
                  }
                  return prev;
                });
              }

              setFormData({
                title: editItem.title || "",
                subtitle: editItem.subtitle || "",
                shortDescription: editItem.shortDescription || "",
                status: editItem.status || "DRAFT",
                visibility: editItem.visibility || "PUBLIC",
                category: editItem.category || "",
                thumbnailUrl: editItem.thumbnail || "",
                externalLinks: editItem.externalLinks || (editItem.link ? [{id: `ext-${Date.now()}`, url: editItem.link, note: "External Link"}] : []),
                contentImages: (editItem.contentImages || []).map((img: any, i: number) => 
                  typeof img === 'string' ? { id: `img-${Date.now()}-${i}`, url: img, note: `Image ${i+1}` } : img
                ),
                videos: editItem.videos || [],
                files: editItem.files || [],
              });
            }
          } catch (error) {
            console.error("Error fetching document:", error);
            toast.error("Failed to load existing data");
          }
        }
      }
    };
    if (session?.user) {
      fetchEditData();
    }
  }, [session, router]);

  const handleScanImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      
      const img = new window.Image();
      img.src = imageUrl;
      img.onload = () => {
        setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
      };

      setOcrImage(imageUrl);
      setIsScanning(true);
      setOcrProgress(0);
      setOcrText("");
      setOcrLines([]);
      
      try {
        const result = await Tesseract.recognize(
          file,
          'eng',
          { logger: m => {
              if (m.status === 'recognizing text') {
                setOcrProgress(Math.floor(m.progress * 100));
              }
            } 
          }
        );
        setOcrText(result.data.text);
        setOcrLines((result.data as any).lines || []);
        toast.success("Image scanned successfully! Select text over the image to copy.");
      } catch (error) {
        console.error("OCR Error:", error);
        toast.error("Failed to extract text from image.");
      } finally {
        setIsScanning(false);
      }
    }
  };

  const handleSave = async () => {
    if (!formData.title) {
      toast.error("Title is required");
      return;
    }
    if (!formData.category) {
      toast.error("Category is required");
      return;
    }
    
    setIsSaving(true);
    
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const editId = urlParams.get("edit");

      if (editId) {
        // Update existing item in Firebase
        const docRef = doc(db, "knowledgeItems", editId);
        await updateDoc(docRef, {
          title: formData.title,
          subtitle: formData.subtitle,
          shortDescription: formData.shortDescription,
          category: formData.category || "Uncategorized",
          status: formData.status,
          visibility: formData.visibility,
          externalLinks: formData.externalLinks,
          thumbnail: formData.thumbnailUrl || (formData.contentImages.length > 0 ? formData.contentImages[0].url : ""),
          contentImages: formData.contentImages,
          videos: formData.videos,
          files: formData.files,
        });
        toast.success("Knowledge item updated successfully in Firebase");
      } else {
        // Create new item in Firebase
        const newItemRef = doc(collection(db, "knowledgeItems"));
        await setDoc(newItemRef, {
          slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          title: formData.title,
          subtitle: formData.subtitle,
          shortDescription: formData.shortDescription,
          category: formData.category || "Uncategorized",
          status: formData.status,
          visibility: formData.visibility,
          externalLinks: formData.externalLinks,
          views: 0,
          date: new Date().toISOString(), // store ISO string for consistency
          thumbnail: formData.thumbnailUrl || (formData.contentImages.length > 0 ? formData.contentImages[0].url : "/images/Default thumbnail placeholder (when admin doesn't upload one).png"), 
          contentImages: formData.contentImages,
          videos: formData.videos,
          files: formData.files,
          featured: false,
          popular: false,
          authorId: session?.user?.id || "",
          authorName: session?.user?.name || "Admin",
        });
        toast.success("Knowledge item created successfully in Firebase");
      }
      
      setIsSaving(false);
      router.push("/admin/knowledge");
    } catch (error) {
      console.error("Error saving to Firebase:", error);
      toast.error("Firebase is missing configuration or offline. Check console.");
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 sticky top-0 z-10 bg-background/80 backdrop-blur-md py-4 border-b border-border/50">
        <div className="flex items-center gap-4">
          <Link href="/admin/knowledge">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="font-heading text-2xl font-bold">Create Knowledge</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Draft
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter a descriptive title..."
                  className="text-lg h-12"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle" className="text-base font-semibold">Subtitle</Label>
                <Input
                  id="subtitle"
                  placeholder="A catchy secondary title..."
                  className="text-base h-11"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="font-semibold">Short Description</Label>
                <Textarea
                  id="description"
                  placeholder="A brief summary of this knowledge item..."
                  className="min-h-[100px] resize-y"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Used for search results and cards.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Content Options */}
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-lg font-semibold flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" />
                  Content & Files
                </h3>
                
                {/* OCR Scanner Feature */}
                <Dialog>
                  <DialogTrigger render={
                    <Button variant="secondary" size="sm" className="gap-2 bg-brand-indigo/10 text-brand-indigo hover:bg-brand-indigo/20 shadow-sm border border-brand-indigo/20" />
                  }>
                      <ScanText className="h-4 w-4" />
                      OCR Scanner
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2"><ScanText className="h-5 w-5 text-brand-indigo"/> OCR Image Scanner</DialogTitle>
                      <DialogDescription>
                        Upload an image. Once scanned, you can select and copy the text directly from the image (like Google Lens).
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      {ocrImage ? (
                        <div className="relative border-2 border-border rounded-xl bg-muted/30 overflow-y-auto max-h-[500px]">
                          <div className="relative w-full" style={{ minHeight: '200px' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={ocrImage} alt="OCR Preview" className="w-full h-auto block pointer-events-none" />
                            
                            {isScanning ? (
                              <div className="absolute inset-0 bg-background/60 flex flex-col items-center justify-center backdrop-blur-sm z-20">
                                <Loader2 className="h-8 w-8 text-brand-indigo animate-spin mb-3" />
                                <p className="text-sm font-medium">Scanning... {ocrProgress}%</p>
                              </div>
                            ) : (
                              <>
                                <div className="absolute top-2 right-2 flex gap-2 z-20">
                                  <Button size="icon" variant="secondary" className="h-8 w-8 shadow-sm cursor-pointer" onClick={() => {
                                    setOcrImage(null);
                                    setOcrText("");
                                    setOcrLines([]);
                                  }}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>

                                {/* Text Overlays */}
                                {imageSize.width > 0 && ocrLines.map((line, i) => {
                                  const { x0, y0, x1, y1 } = line.bbox;
                                  const left = (x0 / imageSize.width) * 100;
                                  const top = (y0 / imageSize.height) * 100;
                                  const width = ((x1 - x0) / imageSize.width) * 100;
                                  const height = ((y1 - y0) / imageSize.height) * 100;

                                  return (
                                    <span 
                                      key={i}
                                      className="absolute text-transparent selection:bg-brand-indigo/40 selection:text-brand-indigo/90 cursor-text overflow-hidden"
                                      style={{
                                        left: `${left}%`,
                                        top: `${top}%`,
                                        width: `${width}%`,
                                        height: `${height}%`,
                                        fontSize: '2vw', // Fallback to make selection height somewhat reasonable
                                        lineHeight: 1
                                      }}
                                      title={line.text}
                                    >
                                      {line.text}
                                    </span>
                                  );
                                })}
                              </>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="relative border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors h-40">
                          <input type="file" accept="image/*" onChange={handleScanImage} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" title="Upload Image for OCR" />
                          <ScanText className="h-8 w-8 text-muted-foreground mb-3" />
                          <p className="text-sm font-medium">Click or Drop image to scan</p>
                          <p className="text-xs text-muted-foreground mt-1">Supports JPG, PNG</p>
                        </div>
                      )}
                      
                      {ocrText && (
                        <div className="space-y-2 relative mt-2">
                          <Label>Raw Extracted Text (Fallback)</Label>
                          <Textarea 
                            placeholder="Extracted content will appear here..." 
                            className="min-h-[100px] resize-y pr-10 text-xs"
                            value={ocrText}
                            onChange={(e) => setOcrText(e.target.value)}
                          />
                          <Button size="icon" variant="ghost" type="button" className="absolute right-2 top-8 h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => {
                            navigator.clipboard.writeText(ocrText);
                            toast.success("Text copied to clipboard!");
                          }}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="space-y-4">
                <Label className="font-semibold">Add External Links</Label>
                <div className="border border-border/60 bg-muted/10 rounded-xl p-6 space-y-4">
                  <div>
                    <h3 className="font-heading text-md font-bold flex items-center gap-2 mb-1">
                      <LinkIcon className="h-4 w-4" /> Add External Reference
                    </h3>
                    <p className="text-xs text-muted-foreground">Add links to external websites, articles, or resources.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">URL / Link</Label>
                      <Input 
                        placeholder="https://example.com/article" 
                        className="text-sm" 
                        value={extUrlInput}
                        onChange={(e) => setExtUrlInput(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Note / Title</Label>
                      <Input 
                        placeholder="Read this article" 
                        className="text-sm" 
                        value={extNoteInput}
                        onChange={(e) => setExtNoteInput(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button 
                    variant="secondary" 
                    className="w-full gap-2"
                    onClick={() => {
                      if (!extUrlInput.trim()) {
                        toast.error("Please enter a URL");
                        return;
                      }
                      const note = extNoteInput.trim() || `Reference ${formData.externalLinks.length + 1}`;
                      setFormData({ 
                        ...formData, 
                        externalLinks: [...formData.externalLinks, { id: `ext-${Date.now()}`, url: extUrlInput.trim(), note }] 
                      });
                      setExtUrlInput("");
                      setExtNoteInput("");
                      toast.success("External link added!");
                    }}
                  >
                    <Upload className="h-4 w-4" />
                    Add External Link
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="font-semibold">Add Media by Link (Images, Videos, Files)</Label>
                <div className="border border-border/60 bg-muted/10 rounded-xl p-6 space-y-4">
                  <div>
                    <h3 className="font-heading text-md font-bold flex items-center gap-2 mb-1">
                      <ImageIcon className="h-4 w-4" /> Add Embedded Media
                    </h3>
                    <p className="text-xs text-muted-foreground">Add YouTube links, direct image URLs, or file URLs that will embed directly in the content.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-5 space-y-2">
                      <Label className="text-xs">Media URL</Label>
                      <Input 
                        placeholder="https://youtube.com/watch?v=..." 
                        className="text-sm" 
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-3 space-y-2">
                      <Label className="text-xs">Type (Optional)</Label>
                      <Select value={urlMediaType} onValueChange={(val) => setUrlMediaType(val || "auto")}>
                        <SelectTrigger className="text-sm h-9">
                          <SelectValue placeholder="Auto" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Auto Detect</SelectItem>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="document">Document</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="sm:col-span-4 space-y-2">
                      <Label className="text-xs">Media Note / Title</Label>
                      <Input 
                        placeholder="My awesome media" 
                        className="text-sm" 
                        value={urlNoteInput}
                        onChange={(e) => setUrlNoteInput(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button 
                    variant="secondary" 
                    className="w-full gap-2"
                    onClick={() => {
                      if (!urlInput.trim()) {
                        toast.error("Please enter a URL");
                        return;
                      }

                      let url = urlInput.trim();
                      // Pre-process Google redirect URLs (e.g. from Google Image search results)
                      let wasGoogleImageSearch = false;
                      const googleImgMatch = url.match(/[?&]imgurl=([^&]+)/);
                      if (googleImgMatch && googleImgMatch[1]) {
                        try {
                          url = decodeURIComponent(googleImgMatch[1]);
                          wasGoogleImageSearch = true;
                        } catch (e) {
                          console.error("Failed to decode google imgurl", e);
                        }
                      }

                      const note = urlNoteInput.trim() || `Media ${formData.contentImages.length + formData.videos.length + formData.files.length + 1}`;
                      
                      let type = urlMediaType;
                      if (type === "auto") {
                        const lowerUrl = url.toLowerCase();
                        const lowerNote = note.toLowerCase();

                        const isGoogleHostedImage = url.includes('googleusercontent.com') || url.includes('gstatic.com') || url.includes('google.com/imgres') || wasGoogleImageSearch;
                        const isImageExtension = url.match(/\.(jpeg|jpg|gif|png|webp|svg|bmp|tiff|ico)(\?.*)?$/i);
                        const isOtherImageHost = url.includes('images.unsplash.com') || url.includes('i.imgur.com') || url.includes('pbs.twimg.com') || url.includes('instagram') || url.includes('pinimg.com');
                        const isYouTubeMatch = url.includes("youtube.com") || url.includes("youtu.be");
                        const isVideoExtension = url.match(/\.(mp4|webm|ogg|mov|avi|mkv|flv|m4v)(\?.*)?$/i);

                        const isVideoKeyword = lowerUrl.includes("video") || lowerNote.includes("video") || lowerNote.includes("recording") || lowerNote.includes("clip") || lowerNote.includes("mp4") || lowerNote.includes("mov") || lowerNote.includes("movie");
                        const isImageKeyword = lowerNote.includes("image") || lowerNote.includes("photo") || lowerNote.includes("pic") || lowerNote.includes("screenshot") || lowerNote.includes("thumb");

                        if (isYouTubeMatch || isVideoExtension || isVideoKeyword) {
                          type = "video";
                        } else if (isGoogleHostedImage || isImageExtension || isOtherImageHost || isImageKeyword) {
                          type = "image";
                        } else if (url.includes('drive.google.com')) {
                          // Drive URLs default to video unless specified as image keyword or file
                          type = "video";
                        } else {
                          type = "document";
                        }
                      }

                      if (type === "image") {
                        setFormData({ ...formData, contentImages: [...formData.contentImages, { id: `img-${Date.now()}`, url: url, note }] });
                      } else if (type === "video") {
                        setFormData({ ...formData, videos: [...formData.videos, { id: `vid-${Date.now()}`, title: note, url: url, duration: "Unknown" }] });
                      } else {
                        setFormData({ ...formData, files: [...formData.files, { id: `file-${Date.now()}`, name: note, url: url, size: "Unknown", type: "Web Link" }] });
                      }
                      
                      setUrlInput("");
                      setUrlNoteInput("");
                      toast.success("Media added!");
                    }}
                  >
                    <Upload className="h-4 w-4" />
                    Add Media Link
                  </Button>
                </div>
              </div>

              {/* Media Preview Gallery */}
              <div className="space-y-4 pt-2">
                {(formData.externalLinks.length > 0 || formData.contentImages.length > 0 || formData.videos.length > 0 || formData.files.length > 0) && (
                  <div className="space-y-6">
                    <h3 className="font-heading text-sm font-bold border-b border-border/50 pb-2 flex items-center gap-2">
                      Added Content Preview
                    </h3>

                    {/* External Links Preview */}
                    {formData.externalLinks.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">External Links ({formData.externalLinks.length})</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {formData.externalLinks.map((ext, i) => (
                            <div key={ext.id} className="flex flex-col gap-2 p-3 border border-border/50 rounded-lg bg-muted/20">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-medium truncate max-w-[200px]">{ext.url}</span>
                                <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => {
                                  const newList = [...formData.externalLinks];
                                  newList.splice(i, 1);
                                  setFormData({ ...formData, externalLinks: newList });
                                }}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                              <Input 
                                value={ext.note} 
                                onChange={(e) => {
                                  const newList = [...formData.externalLinks];
                                  newList[i].note = e.target.value;
                                  setFormData({ ...formData, externalLinks: newList });
                                }} 
                                className="h-8 text-xs bg-background" 
                                placeholder="Note / Title" 
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Images Preview */}
                    {formData.contentImages.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Images ({formData.contentImages.length})</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {formData.contentImages.map((img, i) => (
                            <div key={img.id || i} className="flex flex-col gap-2">
                              <div className="relative group aspect-square rounded-lg border border-border/50 overflow-hidden bg-muted">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={toDriveDirectUrl(img.url)} alt={`Preview ${i}`} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "/images/Default thumbnail placeholder (when admin doesn't upload one).png" }} />
                                <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Button size="icon" variant="destructive" className="h-8 w-8 cursor-pointer shadow-md" onClick={() => {
                                    const newImages = [...formData.contentImages];
                                    newImages.splice(i, 1);
                                    setFormData({ ...formData, contentImages: newImages });
                                  }}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <Input 
                                value={img.note} 
                                onChange={(e) => {
                                  const newImages = [...formData.contentImages];
                                  newImages[i].note = e.target.value;
                                  setFormData({ ...formData, contentImages: newImages });
                                }} 
                                className="h-7 text-xs bg-muted/30" 
                                placeholder="Image Note" 
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Videos Preview */}
                    {formData.videos.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Videos ({formData.videos.length})</Label>
                        <div className="flex flex-col gap-2">
                          {formData.videos.map((vid, i) => (
                            <div key={vid.id || i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 gap-3 rounded-md border border-border/50 bg-muted/30">
                              <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
                                <Video className="h-4 w-4 text-brand-success shrink-0" />
                                <span className="text-xs text-muted-foreground truncate max-w-[150px]">{vid.url}</span>
                              </div>
                              <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Input 
                                  value={vid.title} 
                                  onChange={(e) => {
                                    const newVideos = [...formData.videos];
                                    newVideos[i].title = e.target.value;
                                    setFormData({ ...formData, videos: newVideos });
                                  }} 
                                  className="h-8 text-xs bg-background flex-1 sm:w-48" 
                                  placeholder="Video Title / Note" 
                                />
                                <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => {
                                  setFormData({ ...formData, videos: formData.videos.filter(v => v.id !== vid.id) });
                                }}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Files Preview */}
                    {formData.files.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Files ({formData.files.length})</Label>
                        <div className="flex flex-col gap-2">
                          {formData.files.map((file, i) => (
                            <div key={file.id || i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 gap-3 rounded-md border border-border/50 bg-muted/30">
                              <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
                                <FileText className="h-4 w-4 text-brand-warning shrink-0" />
                                <span className="text-xs text-muted-foreground truncate max-w-[150px]">{file.url}</span>
                              </div>
                              <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Input 
                                  value={file.name} 
                                  onChange={(e) => {
                                    const newFiles = [...formData.files];
                                    newFiles[i].name = e.target.value;
                                    setFormData({ ...formData, files: newFiles });
                                  }} 
                                  className="h-8 text-xs bg-background flex-1 sm:w-48" 
                                  placeholder="File Name / Note" 
                                />
                                <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => {
                                  setFormData({ ...formData, files: formData.files.filter(f => f.id !== file.id) });
                                }}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <h3 className="font-heading font-semibold text-lg flex items-center gap-2">
                Settings
              </h3>
              <Separator />
              
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val: string | null) => setFormData({ ...formData, status: val || "DRAFT" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Visibility</Label>
                <Select
                  value={formData.visibility}
                  onValueChange={(val: string | null) => setFormData({ ...formData, visibility: val || "PUBLIC" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">Public</SelectItem>
                    <SelectItem value="PRIVATE">Private</SelectItem>
                    <SelectItem value="UNLISTED">Unlisted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={isCreatingNewCategory ? "NEW_CATEGORY" : (existingCategories.includes(formData.category) ? formData.category : "")}
                  onValueChange={(val) => {
                    if (val === "NEW_CATEGORY") {
                      setIsCreatingNewCategory(true);
                      setFormData({ ...formData, category: newCategoryName });
                    } else {
                      setIsCreatingNewCategory(false);
                      setFormData({ ...formData, category: val || "" });
                    }
                  }}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {existingCategories.map((cat, i) => (
                      <SelectItem key={i} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                    <SelectItem value="NEW_CATEGORY" className="text-primary font-medium">
                      + Create New Category
                    </SelectItem>
                  </SelectContent>
                </Select>

                {isCreatingNewCategory && (
                  <div className="pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <Input
                      id="new-category"
                      placeholder="Enter new category name..."
                      value={newCategoryName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewCategoryName(val);
                        setFormData({ ...formData, category: val });
                      }}
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-heading font-semibold text-lg">Thumbnail</h3>
              <Separator />
              
              {/* Thumbnail Preview */}
              {formData.thumbnailUrl && (
                <div className="relative aspect-video rounded-lg overflow-hidden border border-border/50 bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={toDriveDirectUrl(formData.thumbnailUrl)} 
                    alt="Thumbnail preview" 
                    className="w-full h-full object-cover" 
                    onError={(e) => { e.currentTarget.src = '/images/Default thumbnail placeholder (when admin doesn\'t upload one).png' }}
                  />
                  <Button 
                    size="icon" 
                    variant="destructive" 
                    className="absolute top-2 right-2 h-7 w-7 cursor-pointer shadow-md" 
                    onClick={() => setFormData({ ...formData, thumbnailUrl: '' })}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}

              {/* Thumbnail Upload or URL */}
              {!formData.thumbnailUrl && (
                <div className="aspect-video rounded-lg border-2 border-dashed border-border/50 flex flex-col items-center justify-center bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors relative">
                  <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleThumbnailUpload} />
                  <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                  <span className="text-xs font-medium">Click to upload thumbnail</span>
                  <span className="text-[10px] text-muted-foreground mt-1">or paste URL below</span>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium flex items-center gap-1"><LinkIcon className="h-3 w-3" /> Paste Image URL</span>
                <Input 
                  placeholder="https://example.com/thumbnail.jpg" 
                  className="h-9 text-sm" 
                  value={formData.thumbnailUrl}
                  onChange={(e) => {
                    let val = e.target.value;
                    const googleImgMatch = val.match(/[?&]imgurl=([^&]+)/);
                    if (googleImgMatch && googleImgMatch[1]) {
                      try {
                        val = decodeURIComponent(googleImgMatch[1]);
                      } catch (err) {
                        console.error("Failed to decode google imgurl", err);
                      }
                    }
                    setFormData({ ...formData, thumbnailUrl: val });
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

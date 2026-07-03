"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Image as ImageIcon, Link as LinkIcon, FileText, Video, Upload, ScanText, Copy } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
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

export default function CreateKnowledgePage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [ocrText, setOcrText] = useState("");
  
  // Basic form state
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    shortDescription: "",
    status: "DRAFT",
    visibility: "PUBLIC",
    category: "",
    link: "",
  });

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
              setFormData({
                title: editItem.title || "",
                subtitle: editItem.subtitle || "",
                shortDescription: editItem.shortDescription || "",
                status: editItem.status || "DRAFT",
                visibility: editItem.visibility || "PUBLIC",
                category: editItem.category || "",
                link: editItem.link || "",
              });
            }
          } catch (error) {
            console.error("Error fetching document:", error);
            toast.error("Failed to load existing data");
          }
        }
      }
    };
    fetchEditData();
  }, []);

  const handleScanImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsScanning(true);
      // Simulate OCR processing time
      await new Promise(res => setTimeout(res, 1500));
      setOcrText("This is the extracted text from your scanned image. It contains details about the UI components, layout spacing, and typography choices. You can easily select this and paste it right into your description or notes.");
      setIsScanning(false);
      toast.success("Image scanned successfully!");
    }
  };

  const handleSave = async () => {
    if (!formData.title) {
      toast.error("Title is required");
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
          link: formData.link,
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
          link: formData.link,
          views: 0,
          date: new Date().toISOString(), // store ISO string for consistency
          thumbnail: "/images/Default thumbnail placeholder (when admin doesn't upload one).png", 
          contentImages: [],
          featured: false,
          popular: false
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
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2"><ScanText className="h-5 w-5 text-brand-indigo"/> OCR Image Scanner</DialogTitle>
                      <DialogDescription>
                        Upload or paste an image to extract text content automatically.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="relative border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors h-40">
                        <input type="file" accept="image/*" onChange={handleScanImage} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" title="Upload Image for OCR" />
                        {isScanning ? (
                          <>
                            <Loader2 className="h-8 w-8 text-brand-indigo animate-spin mb-3" />
                            <p className="text-sm font-medium">Scanning image...</p>
                          </>
                        ) : (
                          <>
                            <ScanText className="h-8 w-8 text-muted-foreground mb-3" />
                            <p className="text-sm font-medium">Click or Drop image to scan</p>
                            <p className="text-xs text-muted-foreground mt-1">Supports JPG, PNG</p>
                          </>
                        )}
                      </div>
                      <div className="space-y-2 relative">
                        <Label>Extracted Text</Label>
                        <Textarea 
                          placeholder="Extracted content will appear here..." 
                          className="min-h-[150px] resize-none pr-10"
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
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="link" className="font-semibold">External Link</Label>
                <Input
                  id="link"
                  placeholder="e.g. https://example.com/article"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                />
              </div>

              <div className="space-y-4">
                <Label className="font-semibold">Upload Files & Media</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Method 1: Direct Upload */}
                  <div className="border-dashed border-2 border-border/60 bg-muted/20 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/40 transition-colors relative h-full">
                    <input type="file" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" title="Select multiple files" />
                    <div className="flex items-center gap-3 mb-3">
                      <ImageIcon className="h-5 w-5 text-brand-indigo" />
                      <Video className="h-5 w-5 text-brand-success" />
                      <FileText className="h-5 w-5 text-brand-warning" />
                    </div>
                    <h3 className="font-heading text-md font-bold mb-1">Direct Upload</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Drag & Drop or Browse (Multiple allowed)
                    </p>
                    <Button variant="outline" size="sm" className="gap-2 pointer-events-none">
                      <Upload className="h-3 w-3" />
                      Browse
                    </Button>
                  </div>

                  {/* Method 2: By Link */}
                  <div className="border border-border/60 bg-muted/10 rounded-xl p-6 flex flex-col justify-center space-y-4">
                    <div>
                      <h3 className="font-heading text-md font-bold flex items-center gap-2 mb-1">
                        <LinkIcon className="h-4 w-4" /> Add by Links
                      </h3>
                      <p className="text-xs text-muted-foreground">Paste direct URLs (one per line) to upload multiple files.</p>
                    </div>
                    <Textarea placeholder="https://example.com/image1.jpg&#10;https://example.com/video.mp4" className="min-h-[80px] text-sm resize-none" />
                    <Button variant="secondary" size="sm" className="w-full">Add URLs to Media</Button>
                  </div>
                </div>
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
                <Label htmlFor="category">Category (Text)</Label>
                <Input
                  id="category"
                  placeholder="e.g. Web Design"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-heading font-semibold text-lg">Thumbnail</h3>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="aspect-video rounded-lg border-2 border-dashed border-border/50 flex flex-col items-center justify-center bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors relative">
                  <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                  <span className="text-xs font-medium">Direct Upload</span>
                </div>
                <div className="flex flex-col justify-center gap-2 border border-border/50 rounded-lg p-3 bg-muted/10">
                  <span className="text-xs font-medium flex items-center gap-1"><LinkIcon className="h-3 w-3" /> Or by Link</span>
                  <Input placeholder="https://..." className="h-8 text-xs" />
                  <Button variant="secondary" size="sm" className="h-8 text-xs">Set Thumbnail</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Image as ImageIcon, Link as LinkIcon, FileText, Video, Upload, ScanText, Copy, Trash2 } from "lucide-react";
import { db, storage } from "@/lib/firebase";
import { collection, doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
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

export default function CreateKnowledgePage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [ocrText, setOcrText] = useState("");

  // Direct file upload to Firebase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadedImages: string[] = [];
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
          uploadedImages.push(downloadURL);
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
    link: "",
    thumbnailUrl: "",
    contentImages: [] as string[],
    videos: [] as { id: string; title: string; url: string; duration: string }[],
    files: [] as { id: string; name: string; url: string; size: string; type: string }[]
  });

  const [urlInput, setUrlInput] = useState("");

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
                thumbnailUrl: editItem.thumbnail || "",
                contentImages: editItem.contentImages || [],
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
          thumbnail: formData.thumbnailUrl || (formData.contentImages.length > 0 ? formData.contentImages[0] : ""),
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
          link: formData.link,
          views: 0,
          date: new Date().toISOString(), // store ISO string for consistency
          thumbnail: formData.thumbnailUrl || (formData.contentImages.length > 0 ? formData.contentImages[0] : "/images/Default thumbnail placeholder (when admin doesn't upload one).png"), 
          contentImages: formData.contentImages,
          videos: formData.videos,
          files: formData.files,
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
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      title="Select multiple files" 
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                    {isUploading ? (
                      <>
                        <Loader2 className="h-8 w-8 text-brand-indigo animate-spin mb-3" />
                        <h3 className="font-heading text-md font-bold mb-1">Uploading...</h3>
                        <p className="text-xs text-muted-foreground">Please wait while files are being uploaded to cloud</p>
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>

                  {/* Method 2: By Link */}
                  <div className="border border-border/60 bg-muted/10 rounded-xl p-6 flex flex-col justify-center space-y-4">
                    <div>
                      <h3 className="font-heading text-md font-bold flex items-center gap-2 mb-1">
                        <LinkIcon className="h-4 w-4" /> Add by Links
                      </h3>
                      <p className="text-xs text-muted-foreground">Paste direct URLs (one per line) to upload multiple files.</p>
                    </div>
                    <Textarea 
                      placeholder="https://example.com/image1.jpg&#10;https://example.com/video.mp4" 
                      className="min-h-[80px] text-sm resize-none" 
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                    />
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        const urls = urlInput.split('\n').map(u => u.trim()).filter(u => u);
                        if (urls.length > 0) {
                          const images = urls.filter(u => u.match(/\.(jpeg|jpg|gif|png|webp)$/i) || u.includes("image"));
                          const videos = urls.filter(u => u.match(/\.(mp4|webm|ogg)$/i) || u.includes("video")).map((v, i) => ({ id: `vid-${Date.now()}-${i}`, title: `Video ${i+1}`, url: v, duration: "Unknown" }));
                          const files = urls.filter(u => !images.includes(u) && !videos.find(vid => vid.url === u)).map((f, i) => ({ id: `file-${Date.now()}-${i}`, name: `Document ${i+1}`, url: f, size: "Unknown", type: "Link" }));
                          
                          setFormData({
                            ...formData,
                            contentImages: [...formData.contentImages, ...images],
                            videos: [...formData.videos, ...videos],
                            files: [...formData.files, ...files]
                          });
                          setUrlInput("");
                          toast.success(`${urls.length} links added to media!`);
                        }
                      }}
                    >Add URLs to Media</Button>
                    
                    {formData.contentImages.length > 0 && (
                       <p className="text-xs text-brand-success">{formData.contentImages.length} images, {formData.videos.length} videos added.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Media Preview Gallery */}
              <div className="space-y-4 pt-2">
                {(formData.contentImages.length > 0 || formData.videos.length > 0 || formData.files.length > 0) && (
                  <div className="space-y-4">
                    <h3 className="font-heading text-sm font-bold border-b border-border/50 pb-2">Media Preview</h3>
                    
                    {/* Images Preview */}
                    {formData.contentImages.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Images ({formData.contentImages.length})</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {formData.contentImages.map((url, i) => (
                            <div key={i} className="relative group aspect-square rounded-lg border border-border/50 overflow-hidden bg-muted">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={url} alt={`Preview ${i}`} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "/images/Default thumbnail placeholder (when admin doesn't upload one).png" }} />
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
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Videos Preview */}
                    {formData.videos.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Videos ({formData.videos.length})</Label>
                        <div className="flex flex-col gap-2">
                          {formData.videos.map((vid) => (
                            <div key={vid.id} className="flex items-center justify-between p-3 rounded-md border border-border/50 bg-muted/30">
                              <div className="flex items-center gap-3 truncate">
                                <Video className="h-4 w-4 text-brand-success shrink-0" />
                                <span className="text-sm truncate">{vid.url}</span>
                              </div>
                              <Button size="icon" variant="ghost" className="h-8 w-8 cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => {
                                setFormData({ ...formData, videos: formData.videos.filter(v => v.id !== vid.id) });
                              }}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
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
                          {formData.files.map((file) => (
                            <div key={file.id} className="flex items-center justify-between p-3 rounded-md border border-border/50 bg-muted/30">
                              <div className="flex items-center gap-3 truncate">
                                <FileText className="h-4 w-4 text-brand-warning shrink-0" />
                                <span className="text-sm truncate">{file.url}</span>
                              </div>
                              <Button size="icon" variant="ghost" className="h-8 w-8 cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => {
                                setFormData({ ...formData, files: formData.files.filter(f => f.id !== file.id) });
                              }}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
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
              
              {/* Thumbnail Preview */}
              {formData.thumbnailUrl && (
                <div className="relative aspect-video rounded-lg overflow-hidden border border-border/50 bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={formData.thumbnailUrl} 
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
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

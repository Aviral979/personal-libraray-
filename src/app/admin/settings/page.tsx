"use client";

import { useEffect, useState } from "react";
import { User, Mail, Save, Loader2, Trash2, Camera, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, deleteDoc, writeBatch } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "sonner";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function SettingsAdminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    avatarUrl: "",
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!session?.user?.id) return;
      
      try {
        const docRef = doc(db, "users", session.user.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            name: data.name || session.user.name || "",
            email: data.email || session.user.email || "",
            bio: data.bio || "",
            avatarUrl: data.avatarUrl || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [session]);

  const handleSave = async () => {
    if (!session?.user?.id) return;
    
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", session.user.id), {
        name: formData.name,
        bio: formData.bio,
        avatarUrl: formData.avatarUrl,
      });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.user?.id) return;

    try {
      toast.info("Uploading avatar...");
      const timestamp = Date.now();
      const storageRef = ref(storage, `avatars/${session.user.id}_${timestamp}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFormData(prev => ({ ...prev, avatarUrl: url }));
      toast.success("Avatar uploaded");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar");
    }
  };

  const handleDeleteAccount = async () => {
    if (!session?.user?.id) return;
    setDeleting(true);
    
    try {
      const batch = writeBatch(db);
      
      // 1. Delete all knowledge items uploaded by user
      const q = query(collection(db, "knowledgeItems"), where("authorId", "==", session.user.id));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((document) => {
        batch.delete(document.ref);
      });
      
      // 2. Delete the user document
      batch.delete(doc(db, "users", session.user.id));
      
      await batch.commit();
      
      toast.success("Account and all associated data deleted");
      
      // Sign out and redirect
      await signOut({ callbackUrl: "/admin/login" });
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <div className="text-center space-y-2">
        <h1 className="font-heading text-3xl font-bold">Edit Profile</h1>
        <p className="text-muted-foreground">Customize your public presence</p>
      </div>

      <div className="bg-card rounded-3xl border shadow-sm p-6 sm:p-10 space-y-8">
        {/* Avatar Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-muted border-4 border-background shadow-md">
              {formData.avatarUrl ? (
                <img src={formData.avatarUrl} alt={formData.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl text-muted-foreground uppercase font-heading font-bold">
                  {formData.name.charAt(0) || "U"}
                </div>
              )}
            </div>
            <Label 
              htmlFor="avatar-upload" 
              className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
            >
              <Camera className="w-6 h-6" />
            </Label>
            <input 
              id="avatar-upload" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleAvatarUpload}
            />
          </div>
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-xl font-bold">{formData.name || "Your Name"}</h2>
            <p className="text-muted-foreground">{formData.email}</p>
          </div>
        </div>

        <div className="space-y-6 pt-4 border-t border-border/50">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="bg-muted/30"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              value={formData.email}
              disabled
              className="bg-muted/30 opacity-70"
            />
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
              className="min-h-[120px] bg-muted/30 resize-none"
            />
          </div>
        </div>

        <Button className="w-full sm:w-auto mt-4" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Profile
        </Button>
      </div>

      {/* Danger Zone */}
      <div className="bg-destructive/5 rounded-3xl border border-destructive/20 p-6 sm:p-10 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-destructive flex items-center gap-2">
            <Trash2 className="h-5 w-5" /> Danger Zone
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Permanently delete your account and all your uploaded knowledge items. This action cannot be undone.
          </p>
        </div>
        <Button 
          variant="destructive" 
          onClick={() => setShowDeleteDialog(true)}
        >
          Delete Account
        </Button>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove all of your uploaded knowledge content from our servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleting}>
              {deleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Yes, delete my account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

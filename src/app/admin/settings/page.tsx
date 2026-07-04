"use client";

import { useEffect, useState } from "react";
import { Settings as SettingsIcon, Save, Loader2, Globe, Shield, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    // General
    siteName: "",
    siteDescription: "",
    contactEmail: "",
    // Social
    facebookUrl: "",
    twitterUrl: "",
    githubUrl: "",
    // SEO
    metaKeywords: "",
    googleAnalyticsId: "",
    // Features
    maintenanceMode: false,
    publicRegistration: false,
    enableComments: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "settings", "global");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData({ ...formData, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "global"), formData, { merge: true });
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleToggle = (name: string, checked: boolean) => {
    setFormData({ ...formData, [name]: checked });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Platform Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage global configuration, features, and SEO preferences.
          </p>
        </div>
        <Button className="gap-2 cursor-pointer shadow-md" onClick={handleSave} disabled={loading || saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      {loading ? (
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-brand-indigo" />
            <p className="text-muted-foreground font-medium">Loading preferences...</p>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-6 bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="general" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-6">
              <LayoutTemplate className="h-4 w-4 mr-2" /> General
            </TabsTrigger>
            <TabsTrigger value="seo" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-6">
              <Globe className="h-4 w-4 mr-2" /> SEO & Social
            </TabsTrigger>
            <TabsTrigger value="features" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-6">
              <Shield className="h-4 w-4 mr-2" /> Features
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-6 animate-in fade-in-50 duration-500">
            <Card className="border-t-4 border-t-brand-indigo shadow-sm">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Update your platform's core identity.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 max-w-2xl">
                <div className="space-y-2">
                  <Label htmlFor="siteName" className="font-semibold">Site Name</Label>
                  <Input
                    id="siteName"
                    name="siteName"
                    value={formData.siteName}
                    onChange={handleChange}
                    placeholder="E.g., My Knowledge Archive"
                    className="focus-visible:ring-brand-indigo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDescription" className="font-semibold">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    name="siteDescription"
                    value={formData.siteDescription}
                    onChange={handleChange}
                    placeholder="A brief description of your platform for visitors."
                    rows={4}
                    className="focus-visible:ring-brand-indigo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail" className="font-semibold">Support/Contact Email</Label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    placeholder="admin@example.com"
                    className="focus-visible:ring-brand-indigo"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>SEO Optimization</CardTitle>
                  <CardDescription>Improve search engine discoverability.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="metaKeywords" className="font-semibold">Global Meta Keywords</Label>
                    <Input
                      id="metaKeywords"
                      name="metaKeywords"
                      value={formData.metaKeywords}
                      onChange={handleChange}
                      placeholder="knowledge, archive, library (comma separated)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="googleAnalyticsId" className="font-semibold">Google Analytics ID</Label>
                    <Input
                      id="googleAnalyticsId"
                      name="googleAnalyticsId"
                      value={formData.googleAnalyticsId}
                      onChange={handleChange}
                      placeholder="G-XXXXXXXXXX"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">Leave empty to disable tracking.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Social Profiles</CardTitle>
                  <CardDescription>Links to display in your site footer.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="twitterUrl" className="font-semibold">Twitter / X URL</Label>
                    <Input
                      id="twitterUrl"
                      name="twitterUrl"
                      value={formData.twitterUrl}
                      onChange={handleChange}
                      placeholder="https://twitter.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="githubUrl" className="font-semibold">GitHub URL</Label>
                    <Input
                      id="githubUrl"
                      name="githubUrl"
                      value={formData.githubUrl}
                      onChange={handleChange}
                      placeholder="https://github.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facebookUrl" className="font-semibold">Facebook URL</Label>
                    <Input
                      id="facebookUrl"
                      name="facebookUrl"
                      value={formData.facebookUrl}
                      onChange={handleChange}
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-6 animate-in fade-in-50 duration-500">
            <Card className="border-l-4 border-l-brand-warning shadow-sm">
              <CardHeader>
                <CardTitle>Feature Toggles</CardTitle>
                <CardDescription>Enable or disable platform functionalities.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 max-w-2xl">
                <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Restrict access to the public site while you perform updates.
                    </p>
                  </div>
                  <Switch
                    checked={formData.maintenanceMode}
                    onCheckedChange={(c) => handleToggle("maintenanceMode", c)}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold">Public Registration</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow new users to sign up for accounts.
                    </p>
                  </div>
                  <Switch
                    checked={formData.publicRegistration}
                    onCheckedChange={(c) => handleToggle("publicRegistration", c)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold">Enable Comments</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow users to leave comments on published knowledge items.
                    </p>
                  </div>
                  <Switch
                    checked={formData.enableComments}
                    onCheckedChange={(c) => handleToggle("enableComments", c)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

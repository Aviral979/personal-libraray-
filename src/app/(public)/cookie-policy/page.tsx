import { Cookie, RefreshCw, Eye, ShieldCheck, Settings } from "lucide-react";

export default function CookiePolicyPage() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="content-width py-12 lg:py-20 bg-background">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm">
              <Cookie className="h-7 w-7" />
            </div>
            <div>
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">Cookie Policy</h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">How we use cookies to improve your library experience.</p>
            </div>
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 bg-muted px-3.5 py-1.5 rounded-full shrink-0 max-w-fit">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Last Updated: {lastUpdated}</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8 text-foreground/80 leading-relaxed font-sans">
          
          <section className="bg-card rounded-2xl border p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
              <Eye className="h-5 w-5 text-amber-600 dark:text-amber-400" /> 1. What Are Cookies?
            </h2>
            <p>
              Cookies are small text files stored on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently, save user preferences, and provide necessary authorization session handles.
            </p>
          </section>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground border-b pb-2">2. How Personal Library Uses Cookies</h2>
            <p>
              We use cookies to maintain your login session and enhance dashboard performance. We classify cookies into two groups:
            </p>
            <ul className="list-disc pl-6 space-y-3">
              <li>
                <strong>Essential & Authentication Cookies:</strong> When you login using NextAuth, session cookies are created to verify your identity. These cookies are essential to access the Admin Panel, create knowledge items, and view moderator message feeds.
              </li>
              <li>
                <strong>Preference Cookies:</strong> We store a light/dark mode preference cookie (`next-themes`) so the website renders in your chosen layout system automatically on your next visit.
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground border-b pb-2">3. Third-Party Cookies</h2>
            <p>
              Our database uses Firebase/Firestore. Firebase may store temporary browser storage keys to persist real-time connections to the Firestore API. This ensures that new messages, items, or status changes (like items being trashed) synchronize instantly on your screen. We do not use advertising or behavioral tracking cookies.
            </p>
          </div>

          <section className="bg-card rounded-2xl border p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
              <Settings className="h-5 w-5 text-primary" /> 4. How to Manage Cookies
            </h2>
            <p>
              You can control or delete cookies through your web browser settings. Most browsers allow you to disable cookies completely, delete existing ones, or receive warnings before a cookie is stored. 
            </p>
            <p className="text-sm text-red-500 dark:text-red-400">
              Note: Disabling cookies will prevent NextAuth authentication from functioning, meaning you will not be able to log in or access your library manager dashboard.
            </p>
          </section>

          <div className="pt-6 border-t flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm text-muted-foreground">
            <p>For questions or terms clarifications, email us at: <a href="mailto:aviralkumar979@gmail.com" className="text-primary hover:underline">aviralkumar979@gmail.com</a></p>
          </div>

        </div>
      </div>
    </div>
  );
}

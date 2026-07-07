import { Shield, Eye, Lock, FileText, RefreshCw } from "lucide-react";

export default function PrivacyPolicyPage() {
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
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary shadow-sm">
              <Shield className="h-7 w-7" />
            </div>
            <div>
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">Privacy Policy</h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">How we handle and protect your personal information.</p>
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
              <Eye className="h-5 w-5 text-primary" /> Introduction
            </h2>
            <p>
              Welcome to <strong>Personal Library</strong>. We respect your privacy and are committed to protecting the personal data you share with us. This Privacy Policy describes how we collect, process, and protect your information when you register, upload metadata, paste third-party links, or interact with moderators on our platform.
            </p>
            <p>
              By creating an account or accessing the library, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground border-b pb-2">1. The Information We Collect</h2>
            <p>
              To maintain your digital archive, we collect specific details related to your account and the links you save:
            </p>
            <ul className="list-disc pl-6 space-y-3">
              <li>
                <strong>Account Information:</strong> When you register (signup) on Personal Library, we collect your name, email address, password hashes, and bio details. This info is safely processed using NextAuth/Firebase.
              </li>
              <li>
                <strong>Saved Metadata & Links:</strong> We collect URLs (Google Drive files, external blogs, YouTube references), short descriptions, thumbnail images, category selections, and custom tags that you choose to store.
              </li>
              <li>
                <strong>Direct Communications:</strong> Any messages exchanged between you and our site moderators/admin are stored in our Firestore database to resolve content questions and queries.
              </li>
              <li>
                <strong>Automatic Image Fetching:</strong> When you paste image URLs from Google Drive or other external domains, our backend parses public redirect endpoints to render thumbnails. We do not store credentials of your external accounts.
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground border-b pb-2">2. How We Use Your Information</h2>
            <p>We process the collected data to keep your digital catalog functional and safe:</p>
            <ul className="list-disc pl-6 space-y-3">
              <li>To compile, format, and display your saved bookmarks and media previews inside the website.</li>
              <li>To increment page/views metadata automatically when visitors read your public items.</li>
              <li>To allow moderators to contact you directly regarding updates, guidelines, or content classifications.</li>
              <li>To run clean search operations when you look for items in your database.</li>
              <li>To secure access to your account and prevent fraudulent registrations.</li>
            </ul>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground border-b pb-2">3. Data Sharing and Third-Party Links</h2>
            <p>
              Your content remains yours. We do not sell your personal data. However, our website links out to third-party domains:
            </p>
            <p>
              When you click on links (Google Drive documents, videos, files), these links open in our secure in-app viewer. These third-party websites have their own privacy policies. We do not have control over, and assume no responsibility for, the content or practices of any third-party websites or services.
            </p>
          </div>

          <div className="bg-card rounded-2xl border p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
              <Lock className="h-5 w-5 text-primary" /> 4. Data Retention & Deletion
            </h2>
            <p>
              We retain your account details and saved contents for as long as your account is active. 
            </p>
            <p>
              If you delete an item or put it in the **Trash**, it is instantly hidden from the public view. You can empty the trash or contact an administrator to permanently purge your data from our database backup files.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground border-b pb-2">5. Updates to This Policy</h2>
            <p>
              We may modify this policy as the platform introduces new features. Any modifications will be posted directly on this page with a revised "Last Updated" date. We recommend checking this page periodically to stay informed.
            </p>
          </div>

          <div className="pt-6 border-t flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm text-muted-foreground">
            <p>If you have any questions about this Privacy Policy, contact us at: <a href="mailto:aviralkumar979@gmail.com" className="text-primary hover:underline">aviralkumar979@gmail.com</a></p>
          </div>

        </div>
      </div>
    </div>
  );
}

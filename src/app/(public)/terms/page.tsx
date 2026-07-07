import { Scale, CheckCircle, ShieldAlert, BookOpen, RefreshCw } from "lucide-react";

export default function TermsOfServicePage() {
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
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 shadow-sm">
              <Scale className="h-7 w-7" />
            </div>
            <div>
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">Terms of Service</h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">Rules and guidelines for using the Personal Library platform.</p>
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
              <BookOpen className="h-5 w-5 text-teal-600 dark:text-teal-400" /> 1. Agreement to Terms
            </h2>
            <p>
              By signing up for an account, saving links, uploading images/videos, or otherwise using the services provided by <strong>Personal Library</strong>, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not register or use this platform.
            </p>
          </section>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground border-b pb-2">2. Registration and Security</h2>
            <p>
              To archive files and links, you must create a validated account. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-3">
              <li>Provide accurate, current, and complete registration information.</li>
              <li>Maintain the confidentiality of your credentials (NextAuth/Password).</li>
              <li>Promptly notify the admin of any unauthorized access to your account.</li>
              <li>Be fully responsible for all content saved or messages sent from your user profile.</li>
            </ul>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground border-b pb-2">3. Acceptable Use Policy</h2>
            <p>
              Personal Library is a private archiving framework. You are prohibited from using this platform to:
            </p>
            <ul className="list-disc pl-6 space-y-3">
              <li>Upload or store content that violates copyright laws, intellectual property rights, or is otherwise illegal under applicable jurisdiction.</li>
              <li>Upload malicious code, scripts, viruses, or links designed to disrupt browser functionality.</li>
              <li>Harass, spam, or send offensive messages to moderators or administrators of this system.</li>
              <li>Exhaust server database limits through automated scripts, bots, or brute-force link submissions.</li>
            </ul>
          </div>

          <section className="bg-card rounded-2xl border p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
              <ShieldAlert className="h-5 w-5 text-red-500" /> 4. Moderation & Content Management
            </h2>
            <p>
              Our moderation team reviews public items periodically. We reserve the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Change the category tags or descriptions of saved items for metadata accuracy.</li>
              <li>Move items to **Trash** if they fail copyright checks, are broken links, or violate acceptable usage guidelines. Trashed items are instantly hidden from search and website index.</li>
              <li>Suspend or terminate accounts of users who violate these terms repeatedly.</li>
            </ul>
          </section>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground border-b pb-2">5. Intellectual Property Rights</h2>
            <p>
              The files, cover images, descriptions, and documents you upload remain your intellectual property. Personal Library does not claim ownership of user-saved content.
            </p>
            <p>
              However, the website software, UI styling, search engine algorithms, logo assets, and custom components are owned by the platform and protected by international copyright laws.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground border-b pb-2">6. Limitation of Liability</h2>
            <p>
              Personal Library is provided on an "as is" and "as available" basis. We do not warrant that Google Drive parsing will always function flawlessly or that third-party media links will stay online permanently. We will not be liable for any data loss, server downtime, or loss of content.
            </p>
          </div>

          <div className="pt-6 border-t flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm text-muted-foreground">
            <p>For questions or terms clarifications, email us at: <a href="mailto:aviralkumar979@gmail.com" className="text-primary hover:underline">aviralkumar979@gmail.com</a></p>
          </div>

        </div>
      </div>
    </div>
  );
}

import { AlertTriangle, Info, HelpCircle, RefreshCw } from "lucide-react";

export default function DisclaimerPage() {
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
              <AlertTriangle className="h-7 w-7" />
            </div>
            <div>
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">Disclaimer</h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">Important legal limitations regarding content on Personal Library.</p>
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
              <Info className="h-5 w-5 text-amber-600 dark:text-amber-400" /> 1. General Information
            </h2>
            <p>
              The information and links cataloged on <strong>Personal Library</strong> are saved and curated by individual users. All platform features (including Google Drive file rendering, in-app video viewing, and third-party links) are provided in good faith. However, we make no representations or warranties of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of user-generated items.
            </p>
          </section>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground border-b pb-2">2. External Links Disclaimer</h2>
            <p>
              Personal Library parses and handles direct image references and external links from websites like Google Drive, Unsplash, Google Search, etc. 
            </p>
            <p>
              Please note that we do not own, control, maintain, or verify the content hosted on these external URLs. We do not warrant, endorse, or assume responsibility for the accuracy or reliability of any information offered by third-party websites linked through our platform.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground border-b pb-2">3. Media Embedding & Live Rendering</h2>
            <p>
              Our platform allows you to preview videos, files, and images directly in the website using our in-app Lightbox overlay. These previews rely on active API links:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Google Drive parsing is dependent on file sharing permissions set by the file owner. We are not responsible if files become inaccessible due to permissions change.</li>
              <li>Embedded media relies on third-party CDNs and platforms. We do not store or host copyrighted media directly unless uploaded by account owners under fair-use guidelines.</li>
            </ul>
          </div>

          <section className="bg-card rounded-2xl border p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
              <HelpCircle className="h-5 w-5 text-primary" /> 4. Professional & Legal Advice
            </h2>
            <p>
              The contents and records saved in Personal Library are for personal archiving and educational research purposes only. Nothing contained on this site should be construed as professional, legal, medical, or financial advice.
            </p>
          </section>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground border-b pb-2">5. "Use at Your Own Risk"</h2>
            <p>
              Your reliance on any information or content retrieved from this site is solely at your own risk. We shall not be liable for any losses, damages, or claims arising from the use of our digital library system.
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

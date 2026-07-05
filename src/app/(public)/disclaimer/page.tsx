import { AlertTriangle } from "lucide-react";

export default function DisclaimerPage() {
  return (
    <div className="content-width py-12 lg:py-20">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold">Disclaimer</h1>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p>
            The information provided by Personal Library ("we," "us," or "our") on our website is for general informational purposes only. All information on the site is provided in good faith, however, we make no representation or warranty of any kind.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">1. External Links Disclaimer</h2>
          <p>
            Our service may contain links to external websites that are not provided or maintained by or in any way affiliated with Personal Library. Please note that we do not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">2. Content Disclaimer</h2>
          <p>
            Users are solely responsible for the content they save and archive using Personal Library. We do not endorse any content uploaded by users, and we shall not be held liable for any copyright infringement or illegal material saved by users.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">3. "As Is" Basis</h2>
          <p>
            Personal Library is provided on an "AS IS" and "AS AVAILABLE" basis. We disclaim all warranties, whether express or implied, including the implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">4. Limitation of Liability</h2>
          <p>
            In no event shall Personal Library, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
          </p>

          <p className="pt-8 text-sm">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}

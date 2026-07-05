import { Shield } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="content-width py-12 lg:py-20">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand-indigo/10 text-brand-indigo">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold">Privacy Policy</h1>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p>
            Welcome to Personal Library. Your privacy is critically important to us, and we are committed to protecting it through our compliance with this policy.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">1. Information We Collect</h2>
          <p>
            When you use Personal Library, we may collect several types of information from and about users, including:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Personal Data:</strong> Name, email address, and other contact details provided during registration.</li>
            <li><strong>Usage Data:</strong> Information about your interaction with the platform, such as your IP address, browser type, pages visited, and time spent.</li>
            <li><strong>Content Data:</strong> Knowledge items, bookmarks, and links you save to your Personal Library.</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8">2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide, maintain, and improve our services.</li>
            <li>Personalize your experience and deliver content relevant to your interests.</li>
            <li>Communicate with you regarding updates, security alerts, and administrative messages.</li>
            <li>Monitor and analyze trends, usage, and activities.</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8">3. Data Security</h2>
          <p>
            We implement robust security measures to ensure that your personal information is protected against unauthorized access, alteration, disclosure, or destruction.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">4. Changes to This Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>

          <p className="pt-8 text-sm">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}

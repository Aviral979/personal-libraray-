import { Scale } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="content-width py-12 lg:py-20">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand-teal/10 text-brand-teal">
            <Scale className="h-6 w-6" />
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold">Terms of Service</h1>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p>
            These Terms of Service govern your use of the Personal Library website and services. By accessing or using our platform, you agree to be bound by these terms.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">1. Acceptance of Terms</h2>
          <p>
            By accessing Personal Library, you confirm that you are at least 18 years old and competent to agree to these terms. If you do not agree to all terms and conditions, you must not use our services.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">2. User Accounts</h2>
          <p>
            To use certain features of the service, you may be required to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">3. Acceptable Use</h2>
          <p>
            You agree not to use the service for any unlawful purpose or in any way that interrupts, damages, or impairs the service. You may not upload content that is illegal, defamatory, or infringes on any third party's intellectual property rights.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">4. Intellectual Property</h2>
          <p>
            All original content, features, and functionality of Personal Library are owned by us and are protected by international copyright, trademark, and other intellectual property laws. Content you save remains your property.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">5. Termination</h2>
          <p>
            We may terminate or suspend access to our service immediately, without prior notice, for any reason, including failure to comply with these Terms of Service.
          </p>

          <p className="pt-8 text-sm">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}

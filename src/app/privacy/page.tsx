import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calculator, Shield, Eye, Lock, Database, Globe, Mail, UserCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | DealFlow",
  description: "DealFlow Privacy Policy. Learn how we collect, use, and protect your personal information.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "January 2026";
  
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Calculator className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">DealFlow</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-sm font-medium text-foreground/90 hover:text-white">
              Terms of Service
            </Link>
            <Link href="/login" className="text-sm font-medium text-foreground/90 hover:text-white">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-6 pt-32 pb-20">
        {/* Header */}
        <div className="mb-12">
          <Link 
            href="/" 
            className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/25">
              <Shield className="h-7 w-7 text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
              <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-slate max-w-none">
          <div className="space-y-8 text-foreground/90">
            
            <section className="rounded-2xl border border-border bg-muted/40 p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Eye className="h-5 w-5 text-emerald-400" />
                1. Introduction
              </h2>
              <p>
                DealFlow (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                when you use our real estate deal analysis platform (&quot;Service&quot;).
              </p>
              <p className="mt-4">
                By accessing or using the Service, you agree to this Privacy Policy. If you do not agree 
                with the terms of this Privacy Policy, please do not access or use the Service.
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-muted/40 p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Database className="h-5 w-5 text-emerald-400" />
                2. Information We Collect
              </h2>
              
              <h3 className="text-lg font-medium text-white mt-6 mb-3">2.1 Personal Information</h3>
              <p>We may collect the following personal information:</p>
              <ul className="mt-4 space-y-2 list-disc list-inside">
                <li><strong>Account Information:</strong> Name, email address, password (encrypted)</li>
                <li><strong>Profile Information:</strong> Company name, phone number, role/title</li>
                <li><strong>Contact Information:</strong> Names, emails, and phone numbers of contacts you add</li>
                <li><strong>Deal Information:</strong> Property addresses, financial data, notes, and documents you submit</li>
              </ul>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">2.2 Automatically Collected Information</h3>
              <p>When you use our Service, we may automatically collect:</p>
              <ul className="mt-4 space-y-2 list-disc list-inside">
                <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
                <li><strong>Usage Data:</strong> Pages visited, features used, time spent on pages</li>
                <li><strong>Cookies:</strong> Session cookies, authentication tokens, preference cookies</li>
                <li><strong>Log Data:</strong> Access times, referring URLs, error logs</li>
              </ul>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">2.3 Calculator Usage</h3>
              <p>
                When you use our public calculators without an account, we collect minimal anonymous data 
                for analytics purposes only. We do not store specific calculation inputs unless you 
                choose to save them to an account.
              </p>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">2.4 Sensitive Property and Deal Information</h3>
              <p>
                When you submit deal analysis information to DealFlow (property addresses, valuations, 
                repair estimates, financing details), this information:
              </p>
              <ul className="mt-4 space-y-2 list-disc list-inside">
                <li>Is encrypted and securely stored in our databases</li>
                <li>Is only accessible to you and invited team members</li>
                <li><strong>Is NOT sold, rented, or shared with third parties</strong></li>
                <li>May be used in anonymized, aggregated form for analytics (your individual deal data remains private)</li>
                <li>Can be deleted by requesting account deletion</li>
              </ul>
              <p className="mt-4 text-emerald-300">
                <strong>Your deal data is your business.</strong> We understand that real estate investors 
                value confidentiality. Your specific property analyses, investment strategies, and deal 
                details are kept strictly private and are never shared with competitors or third parties.
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-muted/40 p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-green-400" />
                3. How We Use Your Information
              </h2>
              <p>We use collected information to:</p>
              <ul className="mt-4 space-y-2 list-disc list-inside">
                <li>Provide, maintain, and improve the Service</li>
                <li>Create and manage your account</li>
                <li>Process and store your deal analysis data</li>
                <li>Send transactional emails (account verification, password reset)</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Analyze usage patterns to improve user experience</li>
                <li>Detect and prevent fraud or security issues</li>
                <li>Comply with legal obligations</li>
              </ul>
              <p className="mt-4">
                <strong>We do not sell your personal information to third parties.</strong>
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-muted/40 p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5 text-cyan-400" />
                4. Information Sharing and Disclosure
              </h2>
              <p>We may share your information in the following circumstances:</p>
              
              <h3 className="text-lg font-medium text-white mt-6 mb-3">4.1 Service Providers</h3>
              <p>
                We may share information with third-party service providers who perform services on our behalf:
              </p>
              <ul className="mt-4 space-y-2 list-disc list-inside">
                <li><strong>Supabase:</strong> Database and authentication services</li>
                <li><strong>Vercel:</strong> Hosting and deployment</li>
                <li><strong>Analytics providers:</strong> Anonymous usage analytics</li>
              </ul>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">4.2 Team Members</h3>
              <p>
                If you are part of a team or organization on DealFlow, your deal data and activity 
                may be visible to other authorized team members and administrators.
              </p>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">4.3 Legal Requirements</h3>
              <p>
                We may disclose your information if required to do so by law or in response to valid 
                requests by public authorities (e.g., court order, subpoena).
              </p>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">4.4 Business Transfers</h3>
              <p>
                In the event of a merger, acquisition, or sale of assets, your information may be 
                transferred as part of that transaction. We will notify you of any such change.
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-muted/40 p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Lock className="h-5 w-5 text-amber-400" />
                5. Data Security
              </h2>
              <p>
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="mt-4 space-y-2 list-disc list-inside">
                <li><strong>Encryption:</strong> All data is encrypted in transit (TLS/SSL) and at rest</li>
                <li><strong>Password Security:</strong> Passwords are hashed using secure algorithms</li>
                <li><strong>Access Controls:</strong> Strict access controls and authentication</li>
                <li><strong>Regular Audits:</strong> Security monitoring and vulnerability assessments</li>
              </ul>
              <p className="mt-4 text-amber-200">
                <strong>Note:</strong> No method of transmission over the Internet is 100% secure. 
                While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-muted/40 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">6. Data Retention</h2>
              <p>
                We retain your information for as long as your account is active or as needed to provide 
                you the Service. We may retain certain information as required by law or for legitimate 
                business purposes.
              </p>
              <ul className="mt-4 space-y-2 list-disc list-inside">
                <li><strong>Account Data:</strong> Retained while account is active, deleted upon request</li>
                <li><strong>Deal Data:</strong> Retained as long as needed, exportable upon request</li>
                <li><strong>Log Data:</strong> Retained for up to 90 days</li>
                <li><strong>Backup Data:</strong> Retained for up to 30 days after deletion</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-border bg-muted/40 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">7. Your Rights</h2>
              <p>Depending on your location, you may have the following rights:</p>
              <ul className="mt-4 space-y-2 list-disc list-inside">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Request correction of inaccurate data</li>
                <li><strong>Deletion:</strong> Request deletion of your data (&quot;right to be forgotten&quot;)</li>
                <li><strong>Portability:</strong> Request your data in a portable format</li>
                <li><strong>Opt-out:</strong> Opt out of marketing communications</li>
                <li><strong>Restriction:</strong> Request restriction of processing</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, contact us at privacy@dealflow.com. We will respond to your 
                request within 30 days.
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-muted/40 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">8. Cookies and Tracking</h2>
              <p>We use cookies and similar technologies for:</p>
              <ul className="mt-4 space-y-2 list-disc list-inside">
                <li><strong>Essential Cookies:</strong> Required for the Service to function (authentication, security)</li>
                <li><strong>Analytics Cookies:</strong> To understand how users interact with the Service</li>
                <li><strong>Preference Cookies:</strong> To remember your settings and preferences</li>
              </ul>
              <p className="mt-4">
                You can control cookies through your browser settings. Disabling certain cookies may 
                affect the functionality of the Service.
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-muted/40 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">9. Children&apos;s Privacy</h2>
              <p>
                The Service is not intended for children under the age of 18. We do not knowingly 
                collect personal information from children under 18. If we become aware that we have 
                collected personal information from a child under 18, we will take steps to delete 
                that information.
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-muted/40 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">10. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your own. 
                These countries may have different data protection laws. By using the Service, you 
                consent to the transfer of your information to the United States and other countries 
                where we or our service providers operate.
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-muted/40 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">11. California Privacy Rights (CCPA)</h2>
              <p>If you are a California resident, you have additional rights:</p>
              <ul className="mt-4 space-y-2 list-disc list-inside">
                <li>Right to know what personal information is collected</li>
                <li>Right to know if personal information is sold or disclosed</li>
                <li>Right to say no to the sale of personal information</li>
                <li>Right to access your personal information</li>
                <li>Right to equal service and price (non-discrimination)</li>
              </ul>
              <p className="mt-4">
                <strong>We do not sell personal information.</strong> To exercise your rights, 
                contact us at privacy@dealflow.com.
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-muted/40 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">12. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes 
                by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
              </p>
              <p className="mt-4">
                You are advised to review this Privacy Policy periodically for any changes. Changes 
                are effective when they are posted on this page.
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-muted/40 p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5 text-emerald-400" />
                13. Contact Us
              </h2>
              <p>
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="mt-4 p-4 rounded-lg bg-secondary/50">
                <p className="font-medium text-white">
                  <strong>Privacy Inquiries</strong><br />
                  Email: privacy@dealflow.com<br />
                  <br />
                  <strong>General Support</strong><br />
                  Email: support@dealflow.com<br />
                  <br />
                  <strong>Mailing Address</strong><br />
                  [Your Business Address]
                </p>
              </div>
            </section>

          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 flex flex-col items-center gap-4 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Your privacy is important to us. We are committed to protecting your personal information.
          </p>
          <div className="flex gap-4">
            <Link 
              href="/terms" 
              className="text-sm text-emerald-400 hover:text-emerald-300"
            >
              Terms of Service
            </Link>
            <Link 
              href="/" 
              className="text-sm text-emerald-400 hover:text-emerald-300"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

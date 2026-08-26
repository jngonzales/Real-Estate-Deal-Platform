import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calculator, Shield, Scale, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | DealFlow",
  description: "DealFlow Terms of Service. Read our terms and conditions for using the real estate deal analysis platform.",
};

export default function TermsOfServicePage() {
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
            <Link href="/privacy" className="text-sm font-medium text-foreground/90 hover:text-white">
              Privacy Policy
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
              <Scale className="h-7 w-7 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
              <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-slate max-w-none">
          <div className="space-y-8 text-foreground/90">
            
            <section className="rounded-2xl border border-border bg-muted/40 p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-400" />
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using DealFlow (&quot;the Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). 
                If you do not agree to all the terms and conditions, you may not access or use the Service.
              </p>
              <p className="mt-4">
                These Terms apply to all visitors, users, and others who access or use the Service. By using the Service, 
                you represent that you are at least 18 years of age and have the legal capacity to enter into these Terms.
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-muted/40 p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-400" />
                2. Description of Service
              </h2>
              <p>
                DealFlow provides real estate investment analysis tools, including but not limited to:
              </p>
              <ul className="mt-4 space-y-2 list-disc list-inside">
                <li>Property valuation calculators (ARV, MAO, ROI)</li>
                <li>Repair cost estimation tools</li>
                <li>Deal submission and management workflows</li>
                <li>Team collaboration features</li>
                <li>Document generation (PDF reports)</li>
                <li>Analytics and reporting dashboards</li>
              </ul>
              <p className="mt-4">
                The Service is provided for informational and educational purposes only. DealFlow does not provide 
                financial, legal, tax, or investment advice.
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-muted/40 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">3. User Accounts</h2>
              <p>
                When you create an account with us, you must provide accurate, complete, and current information. 
                Failure to do so constitutes a breach of the Terms.
              </p>
              <p className="mt-4">
                You are responsible for safeguarding your password and for all activities that occur under your account. 
                You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
              </p>
              <p className="mt-4">
                We reserve the right to refuse service, terminate accounts, remove or edit content at our sole discretion.
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-muted/40 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">4. User Content</h2>
              <p>
                You retain ownership of any content you submit, post, or display on or through the Service (&quot;User Content&quot;). 
                By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, copy, modify, 
                and display such content in connection with operating and providing the Service.
              </p>
              <p className="mt-4">
                You represent and warrant that you own or have the necessary rights to all User Content you submit, 
                and that such content does not violate any third party&apos;s rights.
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-muted/40 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">5. Prohibited Uses</h2>
              <p>You agree not to use the Service:</p>
              <ul className="mt-4 space-y-2 list-disc list-inside">
                <li>For any unlawful purpose or in violation of any laws</li>
                <li>To harass, abuse, or harm another person or entity</li>
                <li>To impersonate any person or entity or misrepresent your affiliation</li>
                <li>To interfere with or disrupt the Service or servers</li>
                <li>To attempt to gain unauthorized access to any portion of the Service</li>
                <li>To transmit viruses, malware, or other harmful code</li>
                <li>To collect user information without consent</li>
                <li>To engage in any automated use of the system (scraping, bots, etc.)</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-amber-500/30 bg-amber-900/20 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">6. Disclaimer of Warranties</h2>
              <p className="text-amber-200">
                <strong>THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, 
                EITHER EXPRESS OR IMPLIED.</strong>
              </p>
              <p className="mt-4">
                We do not warrant that the Service will be uninterrupted, timely, secure, or error-free. 
                We do not warrant the accuracy, reliability, or completeness of any information provided through the Service.
              </p>
              <p className="mt-4">
                <strong>CALCULATIONS, ESTIMATES, AND ANALYSES PROVIDED BY THE SERVICE ARE FOR INFORMATIONAL PURPOSES ONLY 
                AND SHOULD NOT BE RELIED UPON AS THE SOLE BASIS FOR MAKING INVESTMENT DECISIONS.</strong> 
                Always consult with qualified professionals (real estate agents, attorneys, accountants, financial advisors) 
                before making investment decisions.
              </p>
              
              <h3 className="text-lg font-medium text-amber-200 mt-6 mb-3">FINANCIAL AND REAL ESTATE DISCLAIMER</h3>
              <p>
                DealFlow provides calculators, analysis tools, and estimates for informational purposes only. These tools are NOT:
              </p>
              <ul className="mt-3 space-y-2 list-disc list-inside">
                <li>Professional financial advice</li>
                <li>Professional real estate advice</li>
                <li>Professional legal advice</li>
                <li>Guaranteed accurate or current</li>
                <li>Suitable as the sole basis for any investment decision</li>
              </ul>
              <p className="mt-4 font-medium text-amber-200">You should:</p>
              <ul className="mt-2 space-y-2 list-disc list-inside">
                <li>Consult with qualified professionals (CPA, attorney, real estate agent)</li>
                <li>Verify all data independently</li>
                <li>Conduct your own due diligence</li>
                <li>Understand that real estate investing carries significant risk</li>
                <li>Make investment decisions at your own risk</li>
              </ul>
              <p className="mt-4 text-amber-200">
                <strong>All property valuations, repair estimates, ROI projections, and financial calculations are 
                estimates only and may vary significantly from actual costs, values, and returns. DealFlow is not 
                liable for any financial losses, missed opportunities, or damages resulting from reliance on our 
                tools or calculations.</strong>
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-muted/40 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">7. User Responsibilities</h2>
              <p>As a user of DealFlow, you acknowledge and agree that:</p>
              <ul className="mt-4 space-y-2 list-disc list-inside">
                <li>You are solely responsible for the accuracy of data you input into the Service</li>
                <li>You must comply with all applicable laws, including securities, real estate, and tax laws</li>
                <li>You must not use DealFlow for illegal activities or to facilitate fraud</li>
                <li>You acknowledge that real estate investing carries substantial financial risk</li>
                <li>You should verify all calculations and estimates independently before making decisions</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>Any investment decisions you make are solely your responsibility</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-red-500/30 bg-red-900/20 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">8. Limitation of Liability</h2>
              <p className="text-red-200">
                <strong>IN NO EVENT SHALL DEALFLOW, ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, 
                OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, 
                INCLUDING WITHOUT LIMITATION:</strong>
              </p>
              <ul className="mt-4 space-y-2 list-disc list-inside text-red-200">
                <li>Loss of profits, revenue, data, or business opportunities</li>
                <li>Investment losses or financial damages</li>
                <li>Damage to reputation or goodwill</li>
                <li>Cost of procurement of substitute services</li>
                <li>Any other intangible losses</li>
              </ul>
              <p className="mt-4 text-red-200">
                <strong>OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT PAID BY YOU, IF ANY, FOR ACCESS TO THE SERVICE 
                DURING THE TWELVE (12) MONTHS PRIOR TO THE CLAIM.</strong>
              </p>
              <p className="mt-4">
                Some jurisdictions do not allow the exclusion of certain warranties or limitation of liability, 
                so some of the above limitations may not apply to you.
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-muted/40 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">9. Indemnification</h2>
              <p>
                You agree to defend, indemnify, and hold harmless DealFlow and its affiliates, officers, directors, 
                employees, and agents from and against any claims, damages, obligations, losses, liabilities, costs, 
                or expenses arising from:
              </p>
              <ul className="mt-4 space-y-2 list-disc list-inside">
                <li>Your use of and access to the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights</li>
                <li>Your User Content</li>
                <li>Any investment or business decisions made based on information from the Service</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-border bg-muted/40 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">10. Intellectual Property</h2>
              <p>
                The Service and its original content, features, and functionality are and will remain 
                the exclusive property of DealFlow. The Service is protected by copyright, trademark, 
                and other intellectual property laws.
              </p>
              <p className="mt-4">
                You may not copy, modify, distribute, sell, or lease any part of our Service, 
                nor may you reverse engineer or attempt to extract the source code of our software.
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-muted/40 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">11. Third-Party Services</h2>
              <p>
                The Service may contain links to third-party websites or services that are not owned 
                or controlled by DealFlow. We have no control over and assume no responsibility for 
                the content, privacy policies, or practices of any third-party services.
              </p>
              <p className="mt-4">
                Your use of third-party services is at your own risk and subject to the terms and 
                conditions of those third parties.
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-muted/40 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">12. Termination</h2>
              <p>
                We may terminate or suspend your account and access to the Service immediately, 
                without prior notice or liability, for any reason, including breach of these Terms.
              </p>
              <p className="mt-4">
                Upon termination, your right to use the Service will cease immediately. 
                All provisions of the Terms which by their nature should survive termination 
                shall survive, including ownership provisions, warranty disclaimers, indemnity, 
                and limitations of liability.
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-muted/40 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">13. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the 
                United States, without regard to its conflict of law provisions.
              </p>
              <p className="mt-4">
                Any disputes arising under these Terms shall be resolved through binding arbitration 
                in accordance with the rules of the American Arbitration Association, except that 
                either party may seek injunctive relief in any court of competent jurisdiction.
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-muted/40 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">14. Changes to Terms</h2>
              <p>
                We reserve the right to modify or replace these Terms at any time. If a revision is material, 
                we will provide at least 30 days notice prior to any new terms taking effect. 
                What constitutes a material change will be determined at our sole discretion.
              </p>
              <p className="mt-4">
                By continuing to access or use the Service after revisions become effective, 
                you agree to be bound by the revised terms.
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-muted/40 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">15. Severability</h2>
              <p>
                If any provision of these Terms is held to be unenforceable or invalid, 
                such provision will be changed and interpreted to accomplish the objectives 
                of such provision to the greatest extent possible under applicable law, 
                and the remaining provisions will continue in full force and effect.
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-muted/40 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">16. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us at:
              </p>
              <p className="mt-4 font-medium text-white">
                Email: legal@dealflow.com<br />
                Address: [Your Business Address]
              </p>
            </section>

          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 flex flex-col items-center gap-4 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            By using DealFlow, you acknowledge that you have read and understood these Terms of Service.
          </p>
          <div className="flex gap-4">
            <Link 
              href="/privacy" 
              className="text-sm text-emerald-400 hover:text-emerald-300"
            >
              Privacy Policy
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

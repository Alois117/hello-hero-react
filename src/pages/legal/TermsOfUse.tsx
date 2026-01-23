import React from 'react';

const TermsOfUse = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#04143C] to-[#0A2A5A] text-foreground py-16 px-6 md:px-12">
      <div className="max-w-4xl mx-auto bg-[#04143C]/80 rounded-xl p-8 shadow-lg border border-border/50">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-[#43BFC7] to-[#FAA41E] bg-clip-text text-transparent">
          TERMS OF USE — Sentramind Limited
        </h1>
        <p className="text-muted-foreground mb-4">Last updated: 2025-11-29</p>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">1. Agreement and Acceptance</h2>
          <p className="text-muted-foreground">
            By accessing or using this website (the “Site”), you agree to be bound by these Terms of Use and any future revisions posted here. If you do not agree to all the terms, do not use the Site. Continued use after updates will be considered acceptance of the revised Terms.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">2. Who We Are</h2>
          <p className="text-muted-foreground">
            This Site is operated by Sentramind Limited, a Kenya-based company offering IT infrastructure, cloud, colocation, hosting, and related services. References to “we”, “us”, or “our” refer to Sentramind Limited.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">3. Permitted Use of the Site</h2>
          <p className="text-muted-foreground">
            The Site and its content are provided for informational purposes only — e.g. service descriptions, contact details, resources. You may use the Site only for lawful purposes and in compliance with applicable laws and regulations. You may not use the Site in a way that damages, disables, overburdens, or impairs it.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">4. Acceptable Use & Prohibited Activities</h2>
          <p className="text-muted-foreground mb-2">You agree NOT to:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Post or transmit any content that is unlawful, defamatory, obscene, infringing, harmful, or invades others’ privacy.</li>
            <li>Upload files or code containing viruses, malware, or harmful components.</li>
            <li>Harvest or collect personal data about others without their consent.</li>
            <li>Use the Site for unsolicited or unauthorized advertising, spam, phishing, chain letters, or similar content.</li>
            <li>Attempt unauthorized access to any portion of the Site or related systems.</li>
          </ul>
          <p className="text-muted-foreground mt-2">
            We reserve the right to remove or refuse content, and to suspend or terminate access at our discretion if you violate these rules.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">5. Intellectual Property Rights</h2>
          <p className="text-muted-foreground">
            All content on this Site — including text, graphics, logos, images, data, and software — is the property of Sentramind Limited or its licensors. You may not copy, reproduce, distribute, modify, republish, or otherwise exploit any material from this Site without our prior written consent.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">6. Links to Third-Party Sites</h2>
          <p className="text-muted-foreground">
            The Site may contain links to external websites operated by third parties (“Linked Sites”). These links are provided solely for convenience. We do not control these external sites, and inclusion of a link does not imply endorsement. Use of third-party sites is at your own risk.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">7. Disclaimers & Limitation of Liability</h2>
          <p className="text-muted-foreground">
            The Site and its content are provided “as-is” and “as-available,” without any warranties, whether express or implied. To the maximum extent permitted by law, Sentramind Limited (and its suppliers) disclaims all warranties of merchantability, fitness for a particular purpose, title, and non-infringement.
          </p>
          <p className="text-muted-foreground mt-2">
            Under no circumstances shall Sentramind Limited (or its suppliers) be liable for any direct, indirect, incidental, consequential, special or punitive damages, including but not limited to loss of data, profits or business interruption, arising from your use of or inability to use the Site. Your sole remedy is to discontinue use of the Site.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">8. Changes to Terms or Site Operations</h2>
          <p className="text-muted-foreground">
            We reserve the right to modify these Terms at any time, and to suspend or discontinue any part of the Site without prior notice. You are encouraged to review these Terms periodically. Continued use of the Site after changes indicates acceptance of the revised Terms.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">9. Governing Law & Jurisdiction</h2>
          <p className="text-muted-foreground">
            These Terms are governed by the laws of Kenya. Any dispute arising out of or relating to the Site or these Terms shall be subject to the exclusive jurisdiction of the Kenyan courts.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">10. Contact Information</h2>
          <p className="text-muted-foreground">
            If you have any questions about these Terms, please contact us at:
          </p>
          <p className="text-muted-foreground mt-2">
            Email: info@sentramind.co.ke
          </p>
        </section>

        <div className="mt-8 border-t border-border/50 pt-4 text-sm text-muted-foreground">
          © {new Date().getFullYear()} Avis. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
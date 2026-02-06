'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-[#09090b] text-white antialiased">
            {/* Navigation */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-xl">
                <nav className="max-w-4xl mx-auto px-6 h-16 flex items-center">
                    <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm">Back to PRAXIS</span>
                    </Link>
                </nav>
            </header>

            <main className="pt-32 pb-24">
                <article className="max-w-4xl mx-auto px-6">
                    <header className="mb-12">
                        <h1 className="text-4xl font-semibold tracking-tight mb-4">Privacy Policy</h1>
                        <p className="text-white/40">Last updated: February 5, 2026</p>
                    </header>

                    <div className="prose prose-invert prose-lg max-w-none space-y-8">

                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-white/90">1. Introduction</h2>
                            <p className="text-white/60 leading-relaxed">
                                Said Borna ("we," "us," or "our") operates PRAXIS, a prompt engineering platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our Service.
                            </p>
                            <p className="text-white/60 leading-relaxed mt-4">
                                We are committed to protecting your privacy and complying with applicable data protection laws, including the General Data Protection Regulation (GDPR) for users in the European Economic Area (EEA), and other applicable privacy laws.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-white/90">2. Data Controller</h2>
                            <p className="text-white/60 leading-relaxed">
                                For the purposes of GDPR and other data protection laws, the data controller is:
                            </p>
                            <div className="mt-4 p-4 bg-white/[0.02] rounded-lg border border-white/[0.06]">
                                <p className="text-white/70">Said Borna</p>
                                <p className="text-white/50">Email: said@saidborna.com</p>
                                <p className="text-white/50">Website: saidborna.com</p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-white/90">3. Information We Collect</h2>

                            <h3 className="text-xl font-medium mb-3 text-white/80">3.1 Information You Provide</h3>
                            <ul className="list-disc pl-6 mt-4 space-y-2 text-white/60">
                                <li><strong>Account Information:</strong> Email address, name, and password when you create an account</li>
                                <li><strong>User Content:</strong> Prompts you create, save, or enhance using the Service</li>
                                <li><strong>Payment Information:</strong> Billing address and payment method details (processed by our payment processor, not stored by us)</li>
                                <li><strong>Communications:</strong> Information you provide when contacting support or providing feedback</li>
                            </ul>

                            <h3 className="text-xl font-medium mb-3 mt-6 text-white/80">3.2 Information Collected Automatically</h3>
                            <ul className="list-disc pl-6 mt-4 space-y-2 text-white/60">
                                <li><strong>Usage Data:</strong> Features used, actions taken, time spent, and interaction patterns</li>
                                <li><strong>Device Information:</strong> Browser type, operating system, device type, and screen resolution</li>
                                <li><strong>Log Data:</strong> IP address, access times, pages viewed, and referring URLs</li>
                                <li><strong>Cookies and Similar Technologies:</strong> See our Cookie Policy for details</li>
                            </ul>

                            <h3 className="text-xl font-medium mb-3 mt-6 text-white/80">3.3 Information from Third Parties</h3>
                            <ul className="list-disc pl-6 mt-4 space-y-2 text-white/60">
                                <li><strong>OAuth Providers:</strong> If you sign in using Google, GitHub, or other OAuth providers, we receive basic profile information as permitted by your privacy settings</li>
                                <li><strong>Payment Processors:</strong> Transaction confirmations and billing status from payment providers</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-white/90">4. Legal Basis for Processing (GDPR)</h2>
                            <p className="text-white/60 leading-relaxed">
                                Under GDPR, we process your personal data based on the following legal grounds:
                            </p>
                            <ul className="list-disc pl-6 mt-4 space-y-2 text-white/60">
                                <li><strong>Contract Performance:</strong> Processing necessary to provide the Service you requested</li>
                                <li><strong>Legitimate Interests:</strong> Improving our Service, preventing fraud, and ensuring security</li>
                                <li><strong>Consent:</strong> Where you have given explicit consent for specific processing activities</li>
                                <li><strong>Legal Obligation:</strong> Compliance with applicable laws and regulations</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-white/90">5. How We Use Your Information</h2>
                            <p className="text-white/60 leading-relaxed">We use collected information to:</p>
                            <ul className="list-disc pl-6 mt-4 space-y-2 text-white/60">
                                <li>Provide, maintain, and improve the Service</li>
                                <li>Process your prompts and deliver enhanced outputs</li>
                                <li>Store your prompt history so you can access it from your account</li>
                                <li>Process payments and manage subscriptions</li>
                                <li>Send transactional emails (account confirmation, password reset, billing)</li>
                                <li>Respond to support requests and communications</li>
                                <li>Analyze usage patterns, prompt categories, and feature interactions to improve user experience and develop new features</li>
                                <li>Generate aggregated, anonymized insights from usage data to improve the quality and accuracy of our prompt enhancement algorithms</li>
                                <li>Detect, prevent, and address technical issues and security threats</li>
                                <li>Comply with legal obligations</li>
                            </ul>

                            <h3 className="text-xl font-medium mb-3 mt-6 text-white/80">5.2 Data Used for Service Improvement</h3>
                            <p className="text-white/60 leading-relaxed">
                                Your prompts, enhanced outputs, and interaction data (such as which features you use, prompt quality scores, and platform preferences) are stored in our database and may be used in aggregated, anonymized form to improve and develop the Service. This includes improving our prompt enhancement algorithms, identifying common usage patterns, and developing new features. We use this data based on our legitimate interest in providing and improving the Service.
                            </p>
                            <p className="text-white/60 leading-relaxed mt-4">
                                <strong>We do not:</strong> Sell your personal data, use your individual prompts to train third-party AI models, or share your content with third parties for their marketing purposes. Any data used for service improvement is aggregated and anonymized so that it cannot be traced back to individual users.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-white/90">6. Data Sharing and Disclosure</h2>
                            <p className="text-white/60 leading-relaxed">We may share your information with:</p>

                            <h3 className="text-xl font-medium mb-3 mt-6 text-white/80">6.1 Service Providers</h3>
                            <p className="text-white/60 leading-relaxed">
                                Third-party vendors who assist in operating the Service, including:
                            </p>
                            <ul className="list-disc pl-6 mt-2 space-y-2 text-white/60">
                                <li>Cloud hosting providers (Cloudflare)</li>
                                <li>Payment processors (Stripe)</li>
                                <li>Authentication providers</li>
                                <li>Analytics services</li>
                            </ul>

                            <h3 className="text-xl font-medium mb-3 mt-6 text-white/80">6.2 AI Providers (A/B Testing Only)</h3>
                            <p className="text-white/60 leading-relaxed">
                                When you use the A/B testing feature, your prompts are sent to third-party AI providers (such as OpenAI) for execution. This is initiated only by your explicit action.
                            </p>

                            <h3 className="text-xl font-medium mb-3 mt-6 text-white/80">6.3 Legal Requirements</h3>
                            <p className="text-white/60 leading-relaxed">
                                We may disclose information if required by law, court order, or governmental authority, or if we believe disclosure is necessary to protect our rights, your safety, or the safety of others.
                            </p>

                            <h3 className="text-xl font-medium mb-3 mt-6 text-white/80">6.4 Business Transfers</h3>
                            <p className="text-white/60 leading-relaxed">
                                In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction. We will notify you before your information becomes subject to a different privacy policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-white/90">7. Data Retention</h2>
                            <p className="text-white/60 leading-relaxed">
                                We retain your personal data for as long as necessary to provide the Service and fulfill the purposes described in this policy:
                            </p>
                            <ul className="list-disc pl-6 mt-4 space-y-2 text-white/60">
                                <li><strong>Account Data:</strong> Retained until you delete your account, plus a reasonable period for backup and legal compliance</li>
                                <li><strong>User Content:</strong> Retained until you delete it or your account, whichever comes first</li>
                                <li><strong>Usage Data:</strong> Aggregated and anonymized after 24 months</li>
                                <li><strong>Payment Records:</strong> Retained for 7 years as required by tax and accounting regulations</li>
                            </ul>
                            <p className="text-white/60 leading-relaxed mt-4">
                                Upon account deletion, we will delete or anonymize your personal data within 30 days, except where retention is required by law.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-white/90">8. Your Rights (GDPR)</h2>
                            <p className="text-white/60 leading-relaxed">
                                Under GDPR, if you are in the EEA, you have the following rights:
                            </p>
                            <ul className="list-disc pl-6 mt-4 space-y-2 text-white/60">
                                <li><strong>Access:</strong> Request a copy of your personal data</li>
                                <li><strong>Rectification:</strong> Request correction of inaccurate data</li>
                                <li><strong>Erasure:</strong> Request deletion of your personal data ("right to be forgotten")</li>
                                <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
                                <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
                                <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
                                <li><strong>Withdraw Consent:</strong> Withdraw consent at any time where processing is based on consent</li>
                            </ul>
                            <p className="text-white/60 leading-relaxed mt-4">
                                To exercise these rights, contact us at said@saidborna.com. We will respond within 30 days. You also have the right to lodge a complaint with your local data protection authority.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-white/90">9. International Data Transfers</h2>
                            <p className="text-white/60 leading-relaxed">
                                Your information may be transferred to and processed in countries outside the EEA. When we transfer data internationally, we ensure appropriate safeguards are in place:
                            </p>
                            <ul className="list-disc pl-6 mt-4 space-y-2 text-white/60">
                                <li>Standard Contractual Clauses approved by the European Commission</li>
                                <li>Transfers to countries with adequacy decisions</li>
                                <li>Binding corporate rules where applicable</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-white/90">10. Data Security</h2>
                            <p className="text-white/60 leading-relaxed">
                                We implement appropriate technical and organizational measures to protect your personal data:
                            </p>
                            <ul className="list-disc pl-6 mt-4 space-y-2 text-white/60">
                                <li>Encryption of data in transit (TLS 1.3) and at rest</li>
                                <li>Regular security assessments and penetration testing</li>
                                <li>Access controls and authentication requirements</li>
                                <li>Employee training on data protection</li>
                                <li>Incident response procedures</li>
                            </ul>
                            <p className="text-white/60 leading-relaxed mt-4">
                                While we strive to protect your information, no method of transmission over the Internet is 100% secure. In the event of a data breach affecting your personal data, we will notify you and relevant authorities as required by law.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-white/90">11. Children's Privacy</h2>
                            <p className="text-white/60 leading-relaxed">
                                The Service is not intended for users under 16 years of age. We do not knowingly collect personal information from children under 16. If we become aware that we have collected personal data from a child under 16, we will take steps to delete that information.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-white/90">12. Changes to This Policy</h2>
                            <p className="text-white/60 leading-relaxed">
                                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. For significant changes, we will provide additional notice (such as email notification).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-white/90">13. Contact Us</h2>
                            <p className="text-white/60 leading-relaxed">
                                For questions about this Privacy Policy or our data practices, please contact:
                            </p>
                            <div className="mt-4 p-4 bg-white/[0.02] rounded-lg border border-white/[0.06]">
                                <p className="text-white/70">Said Borna (Data Controller)</p>
                                <p className="text-white/50">Email: said@saidborna.com</p>
                                <p className="text-white/50">Website: saidborna.com</p>
                            </div>
                        </section>

                    </div>
                </article>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/[0.06] py-6">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <p className="text-sm text-white/30">© 2026 Said Borna. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

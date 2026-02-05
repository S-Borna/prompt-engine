'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
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
                        <h1 className="text-4xl font-semibold tracking-tight mb-4">Terms of Service</h1>
                        <p className="text-white/40">Last updated: February 5, 2026</p>
                    </header>

                    <div className="prose prose-invert prose-lg max-w-none space-y-8">

                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-white/90">1. Agreement to Terms</h2>
                            <p className="text-white/60 leading-relaxed">
                                By accessing or using PRAXIS ("the Service"), operated by Said Borna ("we," "us," or "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service.
                            </p>
                            <p className="text-white/60 leading-relaxed mt-4">
                                These Terms constitute a legally binding agreement between you and Said Borna regarding your use of PRAXIS, a prompt engineering and optimization platform. Your continued use of the Service constitutes acceptance of any modifications to these Terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-white/90">2. Description of Service</h2>
                            <p className="text-white/60 leading-relaxed">
                                PRAXIS is a software-as-a-service platform that provides:
                            </p>
                            <ul className="list-disc pl-6 mt-4 space-y-2 text-white/60">
                                <li>Prompt analysis and structural enhancement for AI language models</li>
                                <li>Model-specific optimization and adaptation</li>
                                <li>A/B testing and comparison functionality for prompt outputs</li>
                                <li>Prompt storage, organization, and library management</li>
                                <li>Quality metrics and scoring for prompt effectiveness</li>
                            </ul>
                            <p className="text-white/60 leading-relaxed mt-4">
                                The Service transforms user-provided prompts into structured, execution-ready formats. PRAXIS does not execute prompts against external AI models unless explicitly initiated by the user through designated features.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-white/90">3. User Accounts and Registration</h2>
                            <h3 className="text-xl font-medium mb-3 text-white/80">3.1 Account Creation</h3>
                            <p className="text-white/60 leading-relaxed">
                                To access certain features of the Service, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
                            </p>
                            <h3 className="text-xl font-medium mb-3 mt-6 text-white/80">3.2 Account Security</h3>
                            <p className="text-white/60 leading-relaxed">
                                You are responsible for safeguarding the password and any other credentials used to access your account. You agree not to disclose your password to any third party and to take sole responsibility for any activities or actions under your account, whether or not you have authorized such activities or actions.
                            </p>
                            <h3 className="text-xl font-medium mb-3 mt-6 text-white/80">3.3 Account Termination</h3>
                            <p className="text-white/60 leading-relaxed">
                                We reserve the right to suspend or terminate your account at our sole discretion, without notice, for conduct that we believe violates these Terms, is harmful to other users, or is otherwise inappropriate.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-white/90">4. Acceptable Use Policy</h2>
                            <p className="text-white/60 leading-relaxed">You agree not to use the Service to:</p>
                            <ul className="list-disc pl-6 mt-4 space-y-2 text-white/60">
                                <li>Generate, store, or transmit content that is unlawful, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable</li>
                                <li>Create prompts intended to generate illegal content, hate speech, or content that violates the rights of others</li>
                                <li>Attempt to circumvent safety measures of third-party AI models</li>
                                <li>Engage in any automated use of the system, such as using scripts to access the Service</li>
                                <li>Interfere with or disrupt the integrity or performance of the Service</li>
                                <li>Attempt to gain unauthorized access to the Service or its related systems</li>
                                <li>Use the Service for any purpose that is illegal or prohibited by these Terms</li>
                                <li>Resell, sublicense, or commercially exploit the Service without express written permission</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-white/90">5. Intellectual Property Rights</h2>
                            <h3 className="text-xl font-medium mb-3 text-white/80">5.1 Service Ownership</h3>
                            <p className="text-white/60 leading-relaxed">
                                The Service and its original content (excluding user-generated content), features, and functionality are and will remain the exclusive property of Said Borna. The Service is protected by copyright, trademark, and other laws of Sweden and foreign countries.
                            </p>
                            <h3 className="text-xl font-medium mb-3 mt-6 text-white/80">5.2 User Content</h3>
                            <p className="text-white/60 leading-relaxed">
                                You retain all rights to the prompts and content you create using the Service ("User Content"). By using the Service, you grant us a limited, non-exclusive license to process, transform, and store your User Content solely for the purpose of providing the Service to you.
                            </p>
                            <h3 className="text-xl font-medium mb-3 mt-6 text-white/80">5.3 Enhanced Prompts</h3>
                            <p className="text-white/60 leading-relaxed">
                                Enhanced prompts generated by PRAXIS based on your User Content remain your property. We do not claim ownership over the structural improvements or enhancements applied to your prompts.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-white/90">6. Payment and Subscription Terms</h2>
                            <h3 className="text-xl font-medium mb-3 text-white/80">6.1 Pricing</h3>
                            <p className="text-white/60 leading-relaxed">
                                Certain features of the Service may require payment. Prices for paid features are displayed on the Service and may be changed at any time with 30 days notice to existing subscribers.
                            </p>
                            <h3 className="text-xl font-medium mb-3 mt-6 text-white/80">6.2 Billing</h3>
                            <p className="text-white/60 leading-relaxed">
                                Subscriptions are billed in advance on a recurring basis (monthly or annually, depending on your selected plan). Your subscription will automatically renew unless cancelled before the end of the current billing period.
                            </p>
                            <h3 className="text-xl font-medium mb-3 mt-6 text-white/80">6.3 Refunds</h3>
                            <p className="text-white/60 leading-relaxed">
                                Refunds may be issued at our sole discretion. Generally, we offer refunds within 14 days of initial purchase for annual subscriptions if you have not substantially used the Service. Monthly subscriptions are non-refundable after the billing date.
                            </p>
                            <h3 className="text-xl font-medium mb-3 mt-6 text-white/80">6.4 Payment Processing</h3>
                            <p className="text-white/60 leading-relaxed">
                                Payments are processed through third-party payment processors. By providing payment information, you authorize us to charge the applicable fees to your designated payment method. We do not store complete credit card information on our servers.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-white/90">7. Data Processing and AI Interactions</h2>
                            <h3 className="text-xl font-medium mb-3 text-white/80">7.1 Prompt Processing</h3>
                            <p className="text-white/60 leading-relaxed">
                                When you use PRAXIS to enhance prompts, your input is processed through our deterministic pipeline. This processing occurs on our servers and does not involve sending your content to third-party AI models unless you explicitly use the A/B testing feature.
                            </p>
                            <h3 className="text-xl font-medium mb-3 mt-6 text-white/80">7.2 A/B Testing Feature</h3>
                            <p className="text-white/60 leading-relaxed">
                                The A/B testing feature sends your prompts to third-party AI providers (such as OpenAI) for execution. By using this feature, you acknowledge that your prompts will be processed according to the third party's terms of service and privacy policy.
                            </p>
                            <h3 className="text-xl font-medium mb-3 mt-6 text-white/80">7.3 No Guarantee of AI Output</h3>
                            <p className="text-white/60 leading-relaxed">
                                PRAXIS enhances prompt structure but does not guarantee specific outputs from third-party AI models. AI responses are generated by external services and may vary based on model updates, parameters, and other factors beyond our control.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-white/90">8. Limitation of Liability</h2>
                            <p className="text-white/60 leading-relaxed">
                                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL SAID BORNA, ITS AFFILIATES, AGENTS, DIRECTORS, EMPLOYEES, OR LICENSORS BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, INCLUDING WITHOUT LIMITATION DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATING TO THE USE OF, OR INABILITY TO USE, THE SERVICE.
                            </p>
                            <p className="text-white/60 leading-relaxed mt-4">
                                IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL DAMAGES EXCEED THE AMOUNT PAID BY YOU, IF ANY, FOR ACCESSING THE SERVICE DURING THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE DATE OF THE CLAIM.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-white/90">9. Disclaimer of Warranties</h2>
                            <p className="text-white/60 leading-relaxed">
                                THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. WE EXPRESSLY DISCLAIM ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                            </p>
                            <p className="text-white/60 leading-relaxed mt-4">
                                WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE, OR THAT DEFECTS WILL BE CORRECTED. WE DO NOT WARRANT THAT THE RESULTS OBTAINED FROM THE USE OF THE SERVICE WILL BE ACCURATE OR RELIABLE.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-white/90">10. Indemnification</h2>
                            <p className="text-white/60 leading-relaxed">
                                You agree to defend, indemnify, and hold harmless Said Borna and its licensees, licensors, employees, contractors, agents, officers, and directors from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees) arising from:
                            </p>
                            <ul className="list-disc pl-6 mt-4 space-y-2 text-white/60">
                                <li>Your use of and access to the Service</li>
                                <li>Your violation of any term of these Terms</li>
                                <li>Your violation of any third-party right, including any copyright, property, or privacy right</li>
                                <li>Any claim that your User Content caused damage to a third party</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-white/90">11. Governing Law and Jurisdiction</h2>
                            <p className="text-white/60 leading-relaxed">
                                These Terms shall be governed by and construed in accordance with the laws of Sweden, without regard to its conflict of law provisions. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of Stockholm, Sweden.
                            </p>
                            <p className="text-white/60 leading-relaxed mt-4">
                                For users within the European Union, nothing in these Terms affects your rights under mandatory consumer protection laws in your country of residence.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-white/90">12. Changes to Terms</h2>
                            <p className="text-white/60 leading-relaxed">
                                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                            </p>
                            <p className="text-white/60 leading-relaxed mt-4">
                                By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-white/90">13. Severability</h2>
                            <p className="text-white/60 leading-relaxed">
                                If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect. The invalid or unenforceable provision will be modified to reflect the parties' intention or eliminated to the minimum extent necessary.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-white/90">14. Contact Information</h2>
                            <p className="text-white/60 leading-relaxed">
                                For questions about these Terms of Service, please contact:
                            </p>
                            <div className="mt-4 p-4 bg-white/[0.02] rounded-lg border border-white/[0.06]">
                                <p className="text-white/70">Said Borna</p>
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

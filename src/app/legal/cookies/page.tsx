'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CookiePolicy() {
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
                        <h1 className="text-4xl font-semibold tracking-tight mb-4">Cookie Policy</h1>
                        <p className="text-white/40">Last updated: February 5, 2026</p>
                    </header>

                    <div className="prose prose-invert prose-lg max-w-none space-y-8">

                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-white/90">1. What Are Cookies</h2>
                            <p className="text-white/60 leading-relaxed">
                                Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently, provide a better user experience, and give website owners information about how their site is being used.
                            </p>
                            <p className="text-white/60 leading-relaxed mt-4">
                                This Cookie Policy explains how PRAXIS, operated by Said Borna, uses cookies and similar tracking technologies on our website and service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-white/90">2. Types of Cookies We Use</h2>

                            <h3 className="text-xl font-medium mb-3 text-white/80">2.1 Strictly Necessary Cookies</h3>
                            <p className="text-white/60 leading-relaxed">
                                These cookies are essential for the website to function properly. They enable core functionality such as security, authentication, and session management. The website cannot function properly without these cookies.
                            </p>
                            <div className="mt-4 overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/[0.06]">
                                            <th className="text-left py-3 px-4 text-white/70 font-medium">Cookie Name</th>
                                            <th className="text-left py-3 px-4 text-white/70 font-medium">Purpose</th>
                                            <th className="text-left py-3 px-4 text-white/70 font-medium">Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-white/50">
                                        <tr className="border-b border-white/[0.04]">
                                            <td className="py-3 px-4 font-mono text-xs">next-auth.session-token</td>
                                            <td className="py-3 px-4">Authentication session management</td>
                                            <td className="py-3 px-4">Session / 30 days</td>
                                        </tr>
                                        <tr className="border-b border-white/[0.04]">
                                            <td className="py-3 px-4 font-mono text-xs">next-auth.csrf-token</td>
                                            <td className="py-3 px-4">CSRF protection for secure requests</td>
                                            <td className="py-3 px-4">Session</td>
                                        </tr>
                                        <tr className="border-b border-white/[0.04]">
                                            <td className="py-3 px-4 font-mono text-xs">next-auth.callback-url</td>
                                            <td className="py-3 px-4">Redirect after authentication</td>
                                            <td className="py-3 px-4">Session</td>
                                        </tr>
                                        <tr className="border-b border-white/[0.04]">
                                            <td className="py-3 px-4 font-mono text-xs">__cf_bm</td>
                                            <td className="py-3 px-4">Cloudflare bot management</td>
                                            <td className="py-3 px-4">30 minutes</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <h3 className="text-xl font-medium mb-3 mt-8 text-white/80">2.2 Functional Cookies</h3>
                            <p className="text-white/60 leading-relaxed">
                                These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings.
                            </p>
                            <div className="mt-4 overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/[0.06]">
                                            <th className="text-left py-3 px-4 text-white/70 font-medium">Cookie Name</th>
                                            <th className="text-left py-3 px-4 text-white/70 font-medium">Purpose</th>
                                            <th className="text-left py-3 px-4 text-white/70 font-medium">Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-white/50">
                                        <tr className="border-b border-white/[0.04]">
                                            <td className="py-3 px-4 font-mono text-xs">praxis_theme</td>
                                            <td className="py-3 px-4">Theme preference (light/dark)</td>
                                            <td className="py-3 px-4">1 year</td>
                                        </tr>
                                        <tr className="border-b border-white/[0.04]">
                                            <td className="py-3 px-4 font-mono text-xs">praxis_model</td>
                                            <td className="py-3 px-4">Selected AI model preference</td>
                                            <td className="py-3 px-4">1 year</td>
                                        </tr>
                                        <tr className="border-b border-white/[0.04]">
                                            <td className="py-3 px-4 font-mono text-xs">praxis_language</td>
                                            <td className="py-3 px-4">Language preference</td>
                                            <td className="py-3 px-4">1 year</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <h3 className="text-xl font-medium mb-3 mt-8 text-white/80">2.3 Analytics Cookies</h3>
                            <p className="text-white/60 leading-relaxed">
                                These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our service.
                            </p>
                            <div className="mt-4 overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/[0.06]">
                                            <th className="text-left py-3 px-4 text-white/70 font-medium">Cookie Name</th>
                                            <th className="text-left py-3 px-4 text-white/70 font-medium">Purpose</th>
                                            <th className="text-left py-3 px-4 text-white/70 font-medium">Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-white/50">
                                        <tr className="border-b border-white/[0.04]">
                                            <td className="py-3 px-4 font-mono text-xs">_cf_web_analytics</td>
                                            <td className="py-3 px-4">Cloudflare Web Analytics (privacy-preserving)</td>
                                            <td className="py-3 px-4">Session</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-white/60 leading-relaxed mt-4">
                                Note: We use Cloudflare Web Analytics, which is privacy-focused and does not use client-side state (cookies) to collect data. It does not track users across sites or sessions.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-white/90">3. Third-Party Cookies</h2>
                            <p className="text-white/60 leading-relaxed">
                                In some cases, we use cookies provided by trusted third parties:
                            </p>
                            <ul className="list-disc pl-6 mt-4 space-y-2 text-white/60">
                                <li><strong>Cloudflare:</strong> Security and performance optimization</li>
                                <li><strong>Stripe:</strong> Secure payment processing (only when making a payment)</li>
                                <li><strong>OAuth Providers:</strong> Google or GitHub authentication (only during sign-in)</li>
                            </ul>
                            <p className="text-white/60 leading-relaxed mt-4">
                                These third parties have their own privacy and cookie policies. We encourage you to review them.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-white/90">4. Local Storage and Session Storage</h2>
                            <p className="text-white/60 leading-relaxed">
                                In addition to cookies, we use browser local storage and session storage for:
                            </p>
                            <ul className="list-disc pl-6 mt-4 space-y-2 text-white/60">
                                <li><strong>Prompt Draft:</strong> Temporarily storing unsaved prompts to prevent data loss</li>
                                <li><strong>UI State:</strong> Remembering sidebar and panel positions</li>
                                <li><strong>Performance:</strong> Caching non-sensitive data for faster loading</li>
                            </ul>
                            <p className="text-white/60 leading-relaxed mt-4">
                                Local storage data persists until cleared, while session storage is cleared when you close your browser tab.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-white/90">5. Your Choices and Control</h2>

                            <h3 className="text-xl font-medium mb-3 text-white/80">5.1 Cookie Consent</h3>
                            <p className="text-white/60 leading-relaxed">
                                When you first visit our site, you will be presented with a cookie consent banner. You can choose to accept or decline non-essential cookies. Essential cookies cannot be disabled as they are necessary for the site to function.
                            </p>

                            <h3 className="text-xl font-medium mb-3 mt-6 text-white/80">5.2 Browser Settings</h3>
                            <p className="text-white/60 leading-relaxed">
                                Most web browsers allow you to control cookies through their settings. You can:
                            </p>
                            <ul className="list-disc pl-6 mt-2 space-y-2 text-white/60">
                                <li>View and delete cookies stored on your device</li>
                                <li>Block all cookies or specific types of cookies</li>
                                <li>Set your browser to notify you when cookies are being set</li>
                            </ul>
                            <p className="text-white/60 leading-relaxed mt-4">
                                Note: Blocking essential cookies may affect the functionality of the Service.
                            </p>

                            <h3 className="text-xl font-medium mb-3 mt-6 text-white/80">5.3 How to Manage Cookies in Your Browser</h3>
                            <ul className="list-disc pl-6 mt-2 space-y-2 text-white/60">
                                <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
                                <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
                                <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
                                <li><strong>Edge:</strong> Settings → Cookies and site permissions</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-white/90">6. Cookie Consent Management</h2>
                            <p className="text-white/60 leading-relaxed">
                                You can change your cookie preferences at any time by:
                            </p>
                            <ul className="list-disc pl-6 mt-4 space-y-2 text-white/60">
                                <li>Clicking the "Cookie Preferences" link in the footer</li>
                                <li>Clearing your browser cookies and revisiting the site</li>
                                <li>Contacting us at said@saidborna.com</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-white/90">7. Do Not Track</h2>
                            <p className="text-white/60 leading-relaxed">
                                Some browsers include a "Do Not Track" (DNT) feature that signals to websites that you do not want your online activity tracked. We honor DNT signals and will limit tracking accordingly when detected.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-white/90">8. Updates to This Policy</h2>
                            <p className="text-white/60 leading-relaxed">
                                We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our data practices. Any changes will be posted on this page with an updated revision date.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-white/90">9. Contact Us</h2>
                            <p className="text-white/60 leading-relaxed">
                                If you have any questions about our use of cookies, please contact:
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

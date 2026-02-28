import React from 'react';

const sections = [
    {
        title: '1. Acceptance of Terms',
        content: [
            'By accessing, browsing, registering, or creating a login on www.gascart.in ("Platform"), you agree to be legally bound by these Terms of Service.',
            'Creation of a user account or login shall constitute full acceptance of these Terms.',
            'If you do not agree with any part of these Terms, you must discontinue use of the Platform immediately.',
        ],
    },
    {
        title: '2. Nature of the Platform',
        content: [
            'GasCart, operated by Stut Instruments, is a B2B marketplace and sourcing facilitation platform serving the CBG, Bio-CNG, and conventional CNG ecosystem.',
            'The Platform connects buyers, vendors, manufacturers, consultants, and service providers.',
            'GasCart is NOT an e-commerce seller, reseller, stockist, distributor, or manufacturer of listed products unless explicitly stated.',
            'GasCart acts solely as a facilitator or sourcing intermediary between buyers and sellers.',
        ],
    },
    {
        title: '3. Buyer Responsibilities',
        intro: 'Buyers are responsible for:',
        bullets: [
            'Conducting independent technical and commercial evaluation',
            'Verifying specifications, compatibility, and suitability',
            'Reviewing vendor credentials and documentation',
            'Negotiating terms and conditions',
        ],
        content: [
            'All warranties, guarantees, delivery timelines, performance commitments, and after-sales obligations shall be governed strictly by the OEM or vendor terms agreed between the buyer and seller.',
        ],
    },
    {
        title: '4. Vendor Responsibility',
        intro: 'Vendors are independently responsible for:',
        bullets: [
            'Accuracy of product information',
            'Compliance with applicable laws',
            'Quality, performance, and delivery obligations',
            'Warranty and service commitments',
        ],
        content: [
            'Separate agreements may be executed between GasCart and vendors.',
            'Nothing in these Terms creates partnership, agency, or joint liability between GasCart and vendors.',
        ],
    },
    {
        title: '5. No Commercial Liability',
        intro: 'GasCart shall not be liable for:',
        bullets: [
            'Product defects',
            'Delivery delays',
            'Performance or selection failures',
            'Contractual disputes between buyers and vendors',
            'Financial losses arising from transactions',
        ],
        content: [
            "GasCart's total liability, under any circumstance, shall not exceed the commission, facilitation fee, or financial gain earned by GasCart in the specific transaction in question.",
        ],
    },
    {
        title: '6. Payments and Transactions',
        content: [
            'GasCart may facilitate transactions directly through the Platform or may operate on an introduction-based commission model.',
            'Where transactions occur directly between buyer and seller, GasCart is not a party to the commercial contract.',
            'Any payment processing services, if enabled, shall not transfer ownership or seller liability to GasCart.',
        ],
    },
    {
        title: '7. Intellectual Property',
        content: [
            'All content, branding, structure, and intellectual property related to the Platform are owned by Stut Instruments unless otherwise stated.',
            'Users may not reproduce, copy, distribute, or exploit Platform content without written permission.',
        ],
    },
    {
        title: '8. User Conduct',
        intro: 'Users agree not to:',
        bullets: [
            'Provide false information',
            'Misrepresent credentials',
            'Circumvent platform processes',
            'Engage in fraudulent or unlawful activities',
            'Attempt unauthorized access to systems',
        ],
        content: ['GasCart reserves the right to suspend or terminate accounts for violations.'],
    },
    {
        title: '9. Data & Privacy',
        content: [
            'Use of the Platform is also governed by the Privacy Policy published on www.gascart.in.',
            'Users consent to data sharing necessary for RFQ processing and vendor engagement.',
        ],
    },
    {
        title: '10. Limitation of Role',
        content: [
            'GasCart functions as a sourcing facilitator.',
            'It does not assume responsibility for inspection, certification, quality verification, or contractual enforcement between parties.',
            'Buyers and vendors enter into contracts at their own discretion and risk.',
        ],
    },
    {
        title: '11. Governing Law & Jurisdiction',
        content: [
            'These Terms shall be governed by and interpreted in accordance with the laws of India.',
            'Any disputes arising out of or relating to the use of the Platform shall be subject to the exclusive jurisdiction of courts located in Sirsi, Karnataka.',
        ],
    },
    {
        title: '12. Amendments',
        content: [
            'Stut Instruments reserves the right to modify these Terms at any time.',
            'Continued use of the Platform after updates constitutes acceptance of the revised Terms.',
        ],
    },
    {
        title: '13. Contact Information',
        content: ['For queries related to these Terms:'],
        contact: true,
    },
];

const TermsOfService: React.FC = () => {
    return (
        <div className="bg-white min-h-screen">
            {/* Header */}
            <div className="bg-neutral-900 text-white py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                    <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-4">
                        Legal
                    </span>
                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Terms of Service</h1>
                    <p className="text-gray-400 text-lg">
                        <span className="font-semibold text-white">Stut Instruments</span> · Operating{' '}
                        <span className="text-primary">www.gascart.in</span>
                    </p>
                    <p className="text-gray-500 text-sm mt-2">Effective Date: 26 February 2026</p>
                </div>
            </div>

            {/* Body */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-16">
                <div className="space-y-12">
                    {sections.map((section, i) => (
                        <section key={i} className="border-b border-gray-100 pb-10 last:border-0">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 font-display">
                                {section.title}
                            </h2>

                            {section.intro && (
                                <p className="text-gray-600 leading-relaxed mb-3">{section.intro}</p>
                            )}

                            {section.bullets && (
                                <ul className="list-none space-y-2 mb-4">
                                    {section.bullets.map((b, j) => (
                                        <li key={j} className="flex items-start gap-2 text-gray-600">
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                            {b}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {section.content && (
                                <div className="space-y-3">
                                    {section.content.map((para, j) => (
                                        <p key={j} className="text-gray-600 leading-relaxed">
                                            {para}
                                        </p>
                                    ))}
                                </div>
                            )}

                            {section.contact && (
                                <div className="mt-4 bg-neutral-50 border border-neutral-100 rounded-2xl p-6 space-y-2 text-gray-700">
                                    <p className="font-bold text-gray-900">Stut Instruments</p>
                                    <p>
                                        Website:{' '}
                                        <a
                                            href="https://www.gascart.in"
                                            className="text-primary hover:underline"
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            www.gascart.in
                                        </a>
                                    </p>
                                    <p>
                                        Email:{' '}
                                        <a href="mailto:info@gascart.in" className="text-primary hover:underline">
                                            info@gascart.in
                                        </a>
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Registered Address: No 52, Kelagina Onikeri, Melina Onikeri Post,
                                        Sirsi 581402, Karnataka, India
                                    </p>
                                </div>
                            )}
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;

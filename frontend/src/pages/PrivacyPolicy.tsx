import React from 'react';

const sections = [
    {
        title: '1. Introduction',
        content: [
            'Stut Instruments ("Company", "we", "us", or "our") operates the website www.gascart.in ("Platform").',
            'This Privacy Policy describes how we collect, use, disclose, and protect information when users access or use the Platform.',
            'By accessing or using the Platform, you agree to the practices described in this Privacy Policy.',
        ],
    },
    {
        title: '2. Nature of the Platform',
        content: [
            'GasCart is a B2B marketplace and knowledge platform serving the CBG, Bio-CNG, and conventional CNG ecosystem.',
            'The Platform facilitates equipment discovery, RFQ submissions, vendor listings, consultant engagement, and access to educational content.',
            'Unless expressly stated, Stut Instruments does not manufacture or directly supply listed equipment.',
        ],
    },
    {
        title: '3. Information We Collect',
        subsections: [
            {
                subtitle: '3.1 Information Provided by Users:',
                bullets: [
                    'Name',
                    'Company name',
                    'Email address',
                    'Phone number',
                    'Business address',
                    'GST details (if applicable)',
                    'Project and technical data submitted through RFQs',
                    'Vendor registration information',
                    'Consultant profile details',
                ],
            },
            {
                subtitle: '3.2 Automatically Collected Information:',
                bullets: [
                    'IP address',
                    'Browser and device information',
                    'Pages visited and interaction data',
                    'Cookies and usage statistics',
                ],
            },
        ],
    },
    {
        title: '4. Purpose of Data Collection',
        intro: 'We collect and use information to:',
        bullets: [
            'Process RFQs and enquiries',
            'Connect buyers with suppliers',
            'Facilitate commercial discussions',
            'Provide access to learning resources',
            'Improve platform functionality',
            'Maintain platform security',
            'Comply with applicable laws',
        ],
        content: ['We do not sell personal data to third parties.'],
    },
    {
        title: '5. Information Sharing',
        intro: 'Information may be shared:',
        bullets: [
            'With vendors/suppliers when RFQs are submitted',
            'With consultants when expert engagement is requested',
            'When required by law or regulatory authorities',
        ],
        content: ['Only relevant information necessary for the intended purpose is shared.'],
    },
    {
        title: '6. Data Storage & Security',
        content: [
            'We implement reasonable technical and organizational measures to safeguard information.',
            'However, no digital transmission or storage system can be guaranteed as completely secure.',
            'Users are responsible for safeguarding their login credentials.',
        ],
    },
    {
        title: '7. Cookies',
        content: [
            'The Platform may use cookies and similar technologies to enhance user experience, analyze traffic, and improve services.',
            'Users may disable cookies through browser settings, though certain features may be limited.',
        ],
    },
    {
        title: '8. Data Retention',
        content: [
            'Information is retained as long as necessary for business, legal compliance, dispute resolution, and enforcement of agreements.',
            'Users may request deletion of personal data subject to legal obligations.',
        ],
    },
    {
        title: '9. Third-Party Links',
        content: [
            'The Platform may contain links to third-party websites.',
            'We are not responsible for the privacy practices or content of external sites.',
        ],
    },
    {
        title: '10. User Rights',
        content: [
            'Subject to applicable Indian laws, users may request access, correction, or deletion of their personal information and may withdraw consent where applicable.',
        ],
    },
    {
        title: '11. Limitation of Responsibility',
        content: [
            'GasCart functions as a marketplace facilitator.',
            'Commercial transactions between buyers and suppliers are independent agreements.',
            'Stut Instruments is not responsible for product performance, delivery, or disputes unless expressly agreed in writing.',
        ],
    },
    {
        title: '12. Policy Updates',
        content: [
            'This Privacy Policy may be updated periodically.',
            'Changes will be posted on this page with a revised effective date. Continued use of the Platform constitutes acceptance of updated terms.',
        ],
    },
    {
        title: '13. Contact Information',
        content: ['For privacy-related concerns or requests, please contact:'],
        contact: true,
    },
];

const PrivacyPolicy: React.FC = () => {
    return (
        <div className="bg-white min-h-screen">
            {/* Header */}
            <div className="bg-neutral-900 text-white py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                    <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-4">
                        Legal
                    </span>
                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Privacy Policy</h1>
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

                            {/* Intro line */}
                            {section.intro && (
                                <p className="text-gray-600 leading-relaxed mb-3">{section.intro}</p>
                            )}

                            {/* Top-level bullets */}
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

                            {/* Subsections (e.g. 3.1, 3.2) */}
                            {section.subsections && (
                                <div className="space-y-6">
                                    {section.subsections.map((sub, k) => (
                                        <div key={k}>
                                            <p className="font-semibold text-gray-800 mb-2">{sub.subtitle}</p>
                                            <ul className="list-none space-y-2">
                                                {sub.bullets.map((b, j) => (
                                                    <li key={j} className="flex items-start gap-2 text-gray-600">
                                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                                        {b}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Paragraph content */}
                            {section.content && (
                                <div className="space-y-3">
                                    {section.content.map((para, j) => (
                                        <p key={j} className="text-gray-600 leading-relaxed">
                                            {para}
                                        </p>
                                    ))}
                                </div>
                            )}

                            {/* Contact block */}
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
                                        <a
                                            href="mailto:info@gascart.in"
                                            className="text-primary hover:underline"
                                        >
                                            info@gascart.in
                                        </a>
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Registered Address: No 52, Kelagina Onikeri, Melina Onikeri Post,
                                        Sirsi, 581402, Uttara Kannada, Karnataka, India
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

export default PrivacyPolicy;

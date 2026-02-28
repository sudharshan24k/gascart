import React, { useState } from 'react';
import { ChevronDown, Shield, Mail, MapPin, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Section {
    title: string;
    intro?: string;
    bullets?: string[];
    subsections?: { subtitle: string; bullets: string[] }[];
    content?: string[];
    contact?: boolean;
}

const sections: Section[] = [
    {
        title: 'Introduction',
        content: [
            'Stut Instruments ("Company", "we", "us", or "our") operates the website www.gascart.in ("Platform").',
            'This Privacy Policy describes how we collect, use, disclose, and protect information when users access or use the Platform.',
            'By accessing or using the Platform, you agree to the practices described in this Privacy Policy.',
        ],
    },
    {
        title: 'Nature of the Platform',
        content: [
            'GasCart is a B2B marketplace and knowledge platform serving the CBG, Bio-CNG, and conventional CNG ecosystem.',
            'The Platform facilitates equipment discovery, RFQ submissions, vendor listings, consultant engagement, and access to educational content.',
            'Unless expressly stated, Stut Instruments does not manufacture or directly supply listed equipment.',
        ],
    },
    {
        title: 'Information We Collect',
        subsections: [
            {
                subtitle: 'Information Provided by Users',
                bullets: [
                    'Name & Company name',
                    'Email address & Phone number',
                    'Business address',
                    'GST details (if applicable)',
                    'Project and technical data submitted through RFQs',
                    'Vendor registration information',
                    'Consultant profile details',
                ],
            },
            {
                subtitle: 'Automatically Collected Information',
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
        title: 'Purpose of Data Collection',
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
        title: 'Information Sharing',
        intro: 'Information may be shared:',
        bullets: [
            'With vendors/suppliers when RFQs are submitted',
            'With consultants when expert engagement is requested',
            'When required by law or regulatory authorities',
        ],
        content: ['Only relevant information necessary for the intended purpose is shared.'],
    },
    {
        title: 'Data Storage & Security',
        content: [
            'We implement reasonable technical and organizational measures to safeguard information.',
            'However, no digital transmission or storage system can be guaranteed as completely secure.',
            'Users are responsible for safeguarding their login credentials.',
        ],
    },
    {
        title: 'Cookies',
        content: [
            'The Platform may use cookies and similar technologies to enhance user experience, analyze traffic, and improve services.',
            'Users may disable cookies through browser settings, though certain features may be limited.',
        ],
    },
    {
        title: 'Data Retention',
        content: [
            'Information is retained as long as necessary for business, legal compliance, dispute resolution, and enforcement of agreements.',
            'Users may request deletion of personal data subject to legal obligations.',
        ],
    },
    {
        title: 'Third-Party Links',
        content: [
            'The Platform may contain links to third-party websites.',
            'We are not responsible for the privacy practices or content of external sites.',
        ],
    },
    {
        title: 'User Rights',
        content: [
            'Subject to applicable Indian laws, users may request access, correction, or deletion of their personal information and may withdraw consent where applicable.',
        ],
    },
    {
        title: 'Limitation of Responsibility',
        content: [
            'GasCart functions as a marketplace facilitator.',
            'Commercial transactions between buyers and suppliers are independent agreements.',
            'Stut Instruments is not responsible for product performance, delivery, or disputes unless expressly agreed in writing.',
        ],
    },
    {
        title: 'Policy Updates',
        content: [
            'This Privacy Policy may be updated periodically.',
            'Changes will be posted on this page with a revised effective date. Continued use of the Platform constitutes acceptance of updated terms.',
        ],
    },
    {
        title: 'Contact Information',
        content: ['For privacy-related concerns or requests, please contact:'],
        contact: true,
    },
];

const AccordionSection: React.FC<{ section: Section; index: number }> = ({ section, index }) => {
    const [open, setOpen] = useState(index === 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
            <button
                onClick={() => setOpen(!open)}
                className="w-full text-left flex items-center gap-5 px-6 py-5 group"
            >
                <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xs font-black">
                    {String(index + 1).padStart(2, '0')}
                </span>
                <span className="flex-1 text-base font-bold text-gray-900 group-hover:text-primary transition-colors">
                    {section.title}
                </span>
                <ChevronDown
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                />
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 pb-6 border-t border-gray-50 pt-4 space-y-4">
                            {section.intro && (
                                <p className="text-gray-500 font-medium">{section.intro}</p>
                            )}

                            {section.bullets && (
                                <ul className="space-y-2">
                                    {section.bullets.map((b, j) => (
                                        <li key={j} className="flex items-start gap-3 text-gray-600">
                                            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                            {b}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {section.subsections && (
                                <div className="space-y-5">
                                    {section.subsections.map((sub, k) => (
                                        <div key={k} className="bg-neutral-50 rounded-xl p-4">
                                            <p className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                                                {sub.subtitle}
                                            </p>
                                            <ul className="space-y-2">
                                                {sub.bullets.map((b, j) => (
                                                    <li key={j} className="flex items-start gap-3 text-gray-600 text-sm">
                                                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                                        {b}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {section.content && (
                                <div className="space-y-2">
                                    {section.content.map((para, j) => (
                                        <p key={j} className="text-gray-600 leading-relaxed">{para}</p>
                                    ))}
                                </div>
                            )}

                            {section.contact && (
                                <div className="mt-2 bg-neutral-900 rounded-2xl p-5 space-y-3 text-white">
                                    <p className="font-bold text-white text-lg">Stut Instruments</p>
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <Globe className="w-4 h-4 text-primary flex-shrink-0" />
                                        <a href="https://www.gascart.in" className="text-primary hover:underline" target="_blank" rel="noreferrer">
                                            www.gascart.in
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                                        <a href="mailto:info@gascart.in" className="text-primary hover:underline">
                                            info@gascart.in
                                        </a>
                                    </div>
                                    <div className="flex items-start gap-2 text-gray-300">
                                        <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                        <span className="text-sm">No 52, Kelagina Onikeri, Melina Onikeri Post, Sirsi, 581402, Uttara Kannada, Karnataka, India</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const PrivacyPolicy: React.FC = () => {
    return (
        <div className="bg-neutral-50 min-h-screen">
            {/* Hero */}
            <div className="relative bg-neutral-900 text-white overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 via-neutral-900 to-neutral-900" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -mr-40 -mt-40" />
                <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 mb-6">
                        <Shield className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-300">Legal · Privacy</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-display font-black mb-4 leading-tight">
                        Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-200">Policy</span>
                    </h1>
                    <p className="text-gray-400 text-lg mb-3">
                        <span className="text-white font-semibold">Stut Instruments</span> · Operating{' '}
                        <a href="https://www.gascart.in" className="text-primary hover:underline" target="_blank" rel="noreferrer">www.gascart.in</a>
                    </p>
                    <p className="text-gray-500 text-sm">Effective Date: 26 February 2026</p>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-16">
                <div className="space-y-4">
                    {sections.map((section, i) => (
                        <AccordionSection key={i} section={section} index={i} />
                    ))}
                </div>
                <p className="text-center text-gray-400 text-sm mt-12">
                    Last updated: 26 February 2026 · Stut Instruments · www.gascart.in
                </p>
            </div>
        </div>
    );
};

export default PrivacyPolicy;

import React, { useState } from 'react';
import { ChevronDown, FileText, Mail, MapPin, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Section {
    title: string;
    intro?: string;
    bullets?: string[];
    content?: string[];
    contact?: boolean;
}

const sections: Section[] = [
    {
        title: 'Acceptance of Terms',
        content: [
            'By accessing, browsing, registering, or creating a login on www.gascart.in ("Platform"), you agree to be legally bound by these Terms of Service.',
            'Creation of a user account or login shall constitute full acceptance of these Terms.',
            'If you do not agree with any part of these Terms, you must discontinue use of the Platform immediately.',
        ],
    },
    {
        title: 'Nature of the Platform',
        content: [
            'GasCart, operated by Stut Instruments, is a B2B marketplace and sourcing facilitation platform serving the CBG, Bio-CNG, and conventional CNG ecosystem.',
            'The Platform connects buyers, vendors, manufacturers, consultants, and service providers.',
            'GasCart is NOT an e-commerce seller, reseller, stockist, distributor, or manufacturer of listed products unless explicitly stated.',
            'GasCart acts solely as a facilitator or sourcing intermediary between buyers and sellers.',
        ],
    },
    {
        title: 'Buyer Responsibilities',
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
        title: 'Vendor Responsibility',
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
        title: 'No Commercial Liability',
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
        title: 'Payments and Transactions',
        content: [
            'GasCart may facilitate transactions directly through the Platform or may operate on an introduction-based commission model.',
            'Where transactions occur directly between buyer and seller, GasCart is not a party to the commercial contract.',
            'Any payment processing services, if enabled, shall not transfer ownership or seller liability to GasCart.',
        ],
    },
    {
        title: 'Intellectual Property',
        content: [
            'All content, branding, structure, and intellectual property related to the Platform are owned by Stut Instruments unless otherwise stated.',
            'Users may not reproduce, copy, distribute, or exploit Platform content without written permission.',
        ],
    },
    {
        title: 'User Conduct',
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
        title: 'Data & Privacy',
        content: [
            'Use of the Platform is also governed by the Privacy Policy published on www.gascart.in.',
            'Users consent to data sharing necessary for RFQ processing and vendor engagement.',
        ],
    },
    {
        title: 'Limitation of Role',
        content: [
            'GasCart functions as a sourcing facilitator.',
            'It does not assume responsibility for inspection, certification, quality verification, or contractual enforcement between parties.',
            'Buyers and vendors enter into contracts at their own discretion and risk.',
        ],
    },
    {
        title: 'Governing Law & Jurisdiction',
        content: [
            'These Terms shall be governed by and interpreted in accordance with the laws of India.',
            'Any disputes arising out of or relating to the use of the Platform shall be subject to the exclusive jurisdiction of courts located in Sirsi, Karnataka.',
        ],
    },
    {
        title: 'Amendments',
        content: [
            'Stut Instruments reserves the right to modify these Terms at any time.',
            'Continued use of the Platform after updates constitutes acceptance of the revised Terms.',
        ],
    },
    {
        title: 'Contact Information',
        content: ['For queries related to these Terms:'],
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
                                        <span className="text-sm">No 52, Kelagina Onikeri, Melina Onikeri Post, Sirsi 581402, Karnataka, India</span>
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

const TermsOfService: React.FC = () => {
    return (
        <div className="bg-neutral-50 min-h-screen">
            {/* Hero */}
            <div className="relative bg-neutral-900 text-white overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 via-neutral-900 to-neutral-900" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -mr-40 -mt-40" />
                <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 mb-6">
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-300">Legal · Terms</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-display font-black mb-4 leading-tight">
                        Terms of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-200">Service</span>
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

export default TermsOfService;

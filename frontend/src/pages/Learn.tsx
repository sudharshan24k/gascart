import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, FileText, Lightbulb, Zap, Shield, HelpCircle } from 'lucide-react';

const Learn: React.FC = () => {
    const categories = [
        {
            title: "Bio-CNG Basics",
            icon: Lightbulb,
            description: "Understand the fundamentals of Bio-CNG production and its benefits.",
            articles: ["What is Bio-CNG?", "Environmental Impact", "Production Process"]
        },
        {
            title: "Technical Guides",
            icon: Zap,
            description: "Deep dives into plant setup, equipment, and conversion kits.",
            articles: ["Plant Design Standards", "Equipment Maintenance", "Safety Protocols"]
        },
        {
            title: "Industry Insights",
            icon: FileText,
            description: "Latest trends, market analysis, and case studies in India.",
            articles: ["Policy & Subsidies", "Market Forecast 2026", "Successful Case Studies"]
        }
    ];

    return (
        <div className="pt-32 pb-24 min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Knowledge <span className="text-primary">Hub</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Your comprehensive resource for everything related to Bio-CNG, Renewable Energy, and Industrial Green Transitions.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {categories.map((cat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition-all"
                        >
                            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                                <cat.icon className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">{cat.title}</h3>
                            <p className="text-gray-600 mb-6 leading-relaxed">{cat.description}</p>
                            <ul className="space-y-3">
                                {cat.articles.map((art, j) => (
                                    <li key={j} className="flex items-center gap-2 text-primary font-medium cursor-pointer hover:underline">
                                        <BookOpen className="w-4 h-4" />
                                        {art}
                                    </li>
                                line
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>

                {/* FAQ Block */}
                <div className="mt-24">
                    <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                    <div className="max-w-3xl mx-auto space-y-4">
                        {[
                            { q: "How much space is required for a Bio-CNG plant?", a: "Minimum space requirements depend on capacity, typically starting from 1-2 acres for small scale industrial plants." },
                            { q: "What are the government subsidies available?", a: "Current SATAT initiatives and MNRE schemes provide significant capital subsidies and floor prices for Bio-CNG." }
                        ].map((faq, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <HelpCircle className="w-5 h-5 text-primary" /> {faq.q}
                                </h4>
                                <p className="text-gray-600">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Learn;

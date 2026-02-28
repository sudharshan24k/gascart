import React from 'react';
import { motion } from 'framer-motion';
import { Database, Zap, Truck, Recycle } from 'lucide-react';
import InteractiveDiagram from '../components/technology/InteractiveDiagram';

const Technology: React.FC = () => {
    const steps = [
        {
            icon: Recycle,
            title: "Learn & Define Requirements",
            description: "Understand the relevant CBG or CNG technology through structured learning modules.",
            details: "Define capacity, pressure, purity, and application requirements before initiating any sourcing or supplier interaction. Structured learning ensures your team starts with a clear technical foundation, reducing costly misalignments downstream.",
            color: "text-primary",
            bg: "bg-primary-50"
        },
        {
            icon: Database,
            title: "Compare & Shortlist Components",
            description: "Evaluate industrial-grade components using specification-driven comparison tools.",
            details: "Review technical parameters, compatibility, and supplier credentials to shortlist suitable options aligned with project requirements. Our structured comparison framework helps procurement teams make informed, defensible decisions faster.",
            color: "text-primary",
            bg: "bg-primary-50"
        },
        {
            icon: Zap,
            title: "Raise Structured RFQ & Engage Suppliers",
            description: "Submit an industrial-style RFQ outlining precise technical specifications.",
            details: "Receive supplier responses, clarify technical queries, and engage in structured discussions to ensure alignment before commercial negotiation. GasCart's RFQ framework ensures every supplier interaction is documented, traceable, and technically sound.",
            color: "text-primary",
            bg: "bg-primary-50"
        },
        {
            icon: Truck,
            title: "Negotiate & Place Order",
            description: "Finalize commercial terms directly with the supplier or through the GasCart platform.",
            details: "Confirm scope, documentation, delivery schedules, and proceed with structured order placement for confident execution. Every order is backed by a verified supplier, clear specifications, and a structured procurement trail.",
            color: "text-primary",
            bg: "bg-primary-50"
        }
    ];

    const [openStep, setOpenStep] = React.useState<number | null>(null);

    return (
        <div className="bg-white">
            <section className="bg-primary-dark text-white py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary opacity-20 pattern-grid-lg"></div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">Innovative & Relatable Sourcing</h1>
                    <p className="text-xl opacity-90 max-w-3xl mx-auto">
                        Our structured marketplace replicates industrial purchasing process, not a pure marketplace but a tool for education, comparison, RFQ management, and supplier engagement. You remain within your current purchasing practice.
                    </p>
                </div>
            </section>

            <section className="py-32 bg-gradient-to-b from-white via-gray-50/50 to-white relative overflow-hidden">
                {/* Subtle background decorations */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    {/* Section Header */}
                    <div className="text-center max-w-4xl mx-auto mb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary/10 via-blue-500/10 to-primary/10 border border-primary/20 text-primary rounded-full mb-8 backdrop-blur-sm"
                        >
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-xs font-black uppercase tracking-[0.3em]">How It Works</span>
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-display font-black mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent"
                        >
                            Your Procurement Journey on GasCart
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-gray-600 leading-relaxed font-medium max-w-2xl mx-auto"
                        >
                            Walk through GasCart's structured procurement journey — from understanding the technology to placing a verified order. Click each step to explore how we help your team source smarter.
                        </motion.p>
                    </div>

                    {/* Interactive Diagram Component */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
                    >
                        <InteractiveDiagram />
                    </motion.div>
                </div>
            </section>

            <section className="py-24 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <h2 className="text-3xl font-display font-bold text-center mb-12">Detailed Step Breakdown</h2>
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                            >
                                <button
                                    onClick={() => setOpenStep(openStep === index ? null : index)}
                                    className="w-full text-left p-6 md:p-8 flex items-center justify-between"
                                >
                                    <div className="flex items-center">
                                        <div className={`w-12 h-12 ${step.bg} ${step.color} rounded-xl flex items-center justify-center mr-6`}>
                                            <step.icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <span className="text-sm font-bold text-primary mb-1 block uppercase tracking-wider">Step 0{index + 1}</span>
                                            <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                                        </div>
                                    </div>
                                    <div className={`transition-transform duration-300 ${openStep === index ? 'rotate-180' : ''}`}>
                                        <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </button>
                                {openStep === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        className="px-6 pb-8 md:px-24 text-gray-600 border-t border-gray-50 pt-6"
                                    >
                                        <p className="text-lg leading-relaxed">
                                            {step.details}
                                        </p>
                                    </motion.div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Technology;

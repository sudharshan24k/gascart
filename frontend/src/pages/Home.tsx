import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Zap, CheckCircle, TrendingUp, Shield } from 'lucide-react';
import processGraphic from '../assets/process-graphic.png';
import biogasHero from '../assets/biogas-plant-hero.png';
import cngStationCard from '../assets/cng-station-card.png';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-neutral-900 text-white">
                {/* Background Gradient & Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-neutral-900 to-neutral-900 opacity-90 z-0"></div>
                <div className="absolute inset-0" style={{ backgroundImage: `url(${biogasHero})`, backgroundSize: 'cover', backgroundPosition: 'center' }}><div className="absolute inset-0 bg-neutral-900/60 mix-blend-multiply" /></div>
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent z-0"></div>

                {/* Animated Shapes */}
                <div className="absolute top-20 right-20 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute bottom-20 left-20 w-72 h-72 bg-secondary-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 item-center py-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex flex-col justify-center"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 w-fit mb-6">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-success-500"></span>
                            </span>
                            <span className="text-sm font-medium text-success-50 tracking-wide uppercase">The Future of Energy</span>
                        </div>
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold mb-6 leading-[1.1] tracking-tight">
                            Pioneering <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-200">Sustainable Fuel</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-xl leading-relaxed">
                            CBG & CNG marketplace | Supermarket for Oil & Gas Industry —<br />
                            All components, equipment, and expertise in one structured platform.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/shop" className="btn btn-primary btn-lg shadow-glow-primary hover:scale-105 active:scale-95">
                                Explore Products
                            </Link>
                            <Link to="/our-process" className="btn btn-outline border-white/30 text-white hover:bg-white hover:text-neutral-900 hover:border-white transition-all btn-lg">
                                Our Process
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-8 mt-16 border-t border-white/10 pt-8">
                            <div>
                                <h4 className="text-3xl font-bold text-white mb-1">98%</h4>
                                <p className="text-sm text-gray-400 font-medium">Efficiency Rate</p>
                            </div>
                            <div>
                                <h4 className="text-3xl font-bold text-white mb-1">130+</h4>
                                <p className="text-sm text-gray-400 font-medium">Returning Customers</p>
                            </div>
                            <div>
                                <h4 className="text-3xl font-bold text-white mb-1">365</h4>
                                <p className="text-sm text-gray-400 font-medium">Days Support</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="hidden lg:block relative"
                    >
                        {/* Abstract Composition */}
                        <div className="relative z-10">
                            <div className="glass-dark p-6 rounded-3xl border border-white/10 shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                                <img
                                    src={cngStationCard}
                                    alt="Industrial Plant"
                                    className="rounded-2xl w-full h-[400px] object-cover shadow-inner"
                                />
                                <div className="absolute -bottom-6 -right-6 glass p-6 rounded-2xl shadow-xl flex items-center gap-4 max-w-xs animate-float">
                                    <div className="w-12 h-12 rounded-full bg-success-100 flex items-center justify-center text-success-600">
                                        <Leaf className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Physically Audited.</p>
                                        <p className="text-xs text-gray-500">Multi-Step Verified Suppliers.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features / Value Props */}
            <section className="py-24 bg-white relative z-10 -mt-8 rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Why Choose Gascart</span>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-6">Engineered for Excellence</h2>
                        <p className="text-lg text-gray-500">We combine cutting-edge technology with practical industrial applications to deliver superior results.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Zap,
                                title: "High Uptime",
                                desc: "Customers who source through GasCart achieve improved plant uptime with minimal execution and maintenance effort.",
                                color: "bg-primary-100 text-primary-600"
                            },
                            {
                                icon: Shield,
                                title: "Reliability First",
                                desc: "Built Around Industrial-Grade Components and a Carefully Evaluated Supplier Network.",
                                color: "bg-secondary-100 text-secondary-600"
                            },
                            {
                                icon: TrendingUp,
                                title: "Scalable Solutions",
                                desc: "Empowering your procurement team with a platform to achieve more with fewer resources.",
                                color: "bg-neutral-100 text-neutral-600"
                            }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-8 rounded-3xl bg-neutral-50 hover:bg-white hover:shadow-xl border border-transparent hover:border-neutral-100 transition-all duration-300 group"
                            >
                                <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Process Section - Modernized */}
            <section className="py-24 bg-neutral-50 overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="text-secondary font-bold tracking-wider uppercase text-sm mb-2 block">Our Workflow</span>
                            <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900 mb-6">Streamlined for Maximum Output</h2>
                            <p className="text-lg text-gray-600 mb-8 max-w-lg">
                                From learning the system to sourcing the right components, each step is designed for structured and efficient decision-making.
                            </p>

                            <ul className="space-y-6">
                                {[
                                    "Structured technology understanding before procurement",
                                    "Specification-driven component comparison",
                                    "Industrial-style RFQ and supplier evaluation",
                                    "Expert-backed validation and purchase execution"
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-success-100 flex items-center justify-center mt-1">
                                            <CheckCircle className="w-4 h-4 text-success-600" />
                                        </div>
                                        <span className="text-gray-700 font-medium text-lg">{item}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-10">
                                <Link to="/our-process" className="btn btn-outline border-neutral-300 hover:border-primary hover:text-primary gap-2">
                                    How GasCart Works <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary-100 to-secondary-100 rounded-[2.5rem] transform rotate-3 scale-105 opacity-50 z-0"></div>
                            <div className="relative z-10 bg-white p-4 rounded-[2rem] shadow-2xl border border-white/40 backdrop-blur-sm">
                                <img
                                    src={processGraphic}
                                    alt="Process Diagram"
                                    className="w-full h-auto rounded-3xl"
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary-900 z-0">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-secondary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
                </div>

                <div className="container mx-auto px-4 z-10 relative text-center">
                    <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">Ready to Power Your Future?</h2>
                    <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
                        Join hundreds of industries switching to greener fuel &amp; modern purchasing. Get a custom consultation for your plant or source components with ease.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/contact" className="btn btn-secondary btn-lg shadow-lg shadow-secondary/30">
                            Partner with Us
                        </Link>
                        <Link to="/shop" className="btn btn-outline text-white border-white/20 hover:bg-white/10 hover:border-white">
                            Browse Marketplace
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Zap, Settings, Mail } from 'lucide-react';
import processGraphic from '../assets/process-graphic.png';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-primary-dark to-primary min-h-[500px] md:h-[600px] flex items-center text-white overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4 md:mb-6 leading-tight">
                            Clean Biomethane & <span className="text-primary-light">Bio-CNG Tech</span>
                        </h1>
                        <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 text-gray-100 opacity-90 max-w-lg">
                            Pioneering Sustainable Energy for a Greener Tomorrow. High-efficiency gasification solutions for your industrial needs.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                            <Link to="/shop" className="bg-secondary hover:bg-secondary-dark text-white px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg text-center flex items-center justify-center">
                                Shop Products
                            </Link>
                            <Link to="/technology" className="bg-transparent border-2 border-white hover:bg-white hover:text-primary-dark text-white px-8 py-4 rounded-full font-bold text-lg transition-all text-center flex items-center justify-center">
                                Our Technology
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="hidden lg:block relative"
                    >
                        <div className="relative">
                            <div className="absolute -top-20 -left-20 w-80 h-80 bg-primary-light rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
                            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-secondary-light rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-700"></div>
                            <img
                                src="https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                                alt="Green Energy"
                                className="rounded-2xl shadow-2xl relative z-10 border-4 border-white/20 w-full max-w-lg mx-auto transform rotate-2 hover:rotate-0 transition-transform duration-500"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Process Section Overview */}
            <section className="py-24 bg-neutral-light">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-primary font-bold tracking-wider uppercase text-sm">Industrial Excellence</span>
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mt-2 mb-4">Our Technology at a Glance</h2>
                        <div className="w-24 h-1 bg-primary mx-auto rounded"></div>
                        <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
                            A streamlined process designed to maximize output and minimize environmental footprint.
                        </p>
                    </div>

                    <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl overflow-hidden mb-12 border border-neutral-dark/20 transform hover:shadow-2xl transition-shadow duration-300">
                        <img
                            src={processGraphic}
                            alt="Gascart Process Diagram"
                            className="w-full h-auto object-contain max-h-[600px] mx-auto mix-blend-multiply"
                        />
                    </div>

                    <div className="text-center">
                        <Link to="/technology" className="inline-flex items-center bg-primary text-white font-bold px-8 py-3 rounded-full hover:bg-primary-dark transition-all group shadow-md hover:shadow-lg">
                            Explore Technical Details <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Quick Access Grid */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Technology */}
                        <Link to="/technology" className="group p-8 bg-neutral-light/50 rounded-2xl border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-xl transition-all">
                            <div className="w-14 h-14 bg-primary text-white rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Zap className="h-7 w-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Our Tech</h3>
                            <p className="text-gray-600 text-sm mb-4">Discover how we process waste into value.</p>
                            <span className="text-primary font-bold text-sm flex items-center">View Process <ArrowRight className="ml-1 h-4 w-4" /></span>
                        </Link>

                        {/* Shop */}
                        <Link to="/shop" className="group p-8 bg-neutral-light/50 rounded-2xl border border-transparent hover:border-secondary/20 hover:bg-white hover:shadow-xl transition-all">
                            <div className="w-14 h-14 bg-secondary text-white rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Leaf className="h-7 w-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Product Shop</h3>
                            <p className="text-gray-600 text-sm mb-4">Premium Biomethane & Bio-CNG products.</p>
                            <span className="text-secondary font-bold text-sm flex items-center">Shop Now <ArrowRight className="ml-1 h-4 w-4" /></span>
                        </Link>

                        {/* About */}
                        <Link to="/about" className="group p-8 bg-neutral-light/50 rounded-2xl border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-xl transition-all">
                            <div className="w-14 h-14 bg-primary-light text-white rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Settings className="h-7 w-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Our Mission</h3>
                            <p className="text-gray-600 text-sm mb-4">Learn about our commitment to green energy.</p>
                            <span className="text-primary font-bold text-sm flex items-center">Read Story <ArrowRight className="ml-1 h-4 w-4" /></span>
                        </Link>

                        {/* Contact */}
                        <Link to="/contact" className="group p-8 bg-neutral-light/50 rounded-2xl border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-xl transition-all">
                            <div className="w-14 h-14 bg-gray-900 text-white rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Mail className="h-7 w-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Contact Us</h3>
                            <p className="text-gray-600 text-sm mb-4">Get in touch with our expert team today.</p>
                            <span className="text-gray-900 font-bold text-sm flex items-center">Get Started <ArrowRight className="ml-1 h-4 w-4" /></span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-primary-dark text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-pattern-grid opacity-5"></div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Revolutionizing Bio-CNG Production</h2>
                    <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                        Join the transition to professional, high-efficiency sustainable energy.
                    </p>
                    <Link to="/contact" className="bg-secondary hover:bg-secondary-dark text-white px-10 py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-secondary/50">
                        Partner with Us
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;

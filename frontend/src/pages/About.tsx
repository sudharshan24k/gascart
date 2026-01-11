import React from 'react';
import { Target, Eye, Award, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';

const About: React.FC = () => {
    return (
        <div className="bg-white">
            {/* Header */}
            <section className="bg-neutral-light py-24 border-b border-neutral-dark/10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="text-secondary font-bold tracking-wider uppercase text-sm">Industrial Visionaries</span>
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mt-2 mb-6">
                            Pioneering Gascart.in
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Redefining the energy landscape through high-performance biomethane and bio-CNG conversion systems.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Overview Section */}
            <section className="py-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl font-display font-bold text-gray-900 mb-6">Who We Are</h2>
                            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                Gascart is a pioneering technology company dedicated to providing sustainable energy solutions. We specialize in the design, development, and implementation of advanced biomethane and Bio-CNG gasification plants.
                            </p>
                            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                Our team of experts combines decades of engineering experience with a passion for environmental stewardship, delivering systems that not only generate clean energy but also solve waste management challenges.
                            </p>
                            <div className="flex items-center space-x-4 mt-8">
                                <Leaf className="text-primary h-6 w-6" />
                                <span className="text-lg font-medium text-gray-800">Commited to a net-zero future</span>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute -inset-4 bg-primary/20 rounded-2xl transform rotate-3 blur-lg"></div>
                            <img
                                src="https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                                alt="Team at work"
                                className="rounded-2xl shadow-xl w-full relative z-10"
                            />
                            <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-xl shadow-xl border border-gray-100 hidden md:block z-20">
                                <div className="flex items-center space-x-5">
                                    <div className="bg-primary/10 p-4 rounded-full text-primary">
                                        <Award className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <p className="text-4xl font-bold text-gray-900">10+</p>
                                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Years of Experience</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-24 bg-primary text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-pattern-grid opacity-10"></div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="bg-white/10 p-10 rounded-3xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors">
                            <div className="bg-white text-primary p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 shadow-lg">
                                <Target className="h-8 w-8" />
                            </div>
                            <h2 className="text-3xl font-display font-bold mb-4">Our Mission</h2>
                            <p className="text-lg text-primary-50 leading-relaxed">
                                To empower communities and industries with clean, renewable energy solutions that reduce carbon footprints and promote a circular economy. We aim to make sustainable technology accessible and efficient for everyone.
                            </p>
                        </div>
                        <div className="bg-white/10 p-10 rounded-3xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors">
                            <div className="bg-white text-primary p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 shadow-lg">
                                <Eye className="h-8 w-8" />
                            </div>
                            <h2 className="text-3xl font-display font-bold mb-4">Our Vision</h2>
                            <p className="text-lg text-primary-50 leading-relaxed">
                                To be the global leader in bio-energy technology, fostering a world where waste is viewed as a valuable resource and clean energy powers our future development without compromising the environment.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values/Team/Stats (Optional Addition) */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-5xl">
                    <h2 className="text-3xl font-display font-bold text-gray-900 mb-12">Our Core Values</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: 'Innovation', desc: 'Constantly pushing boundaries to improve efficiency.' },
                            { title: 'Sustainability', desc: 'Environmental responsibility is at the heart of everything we do.' },
                            { title: 'Integrity', desc: 'Building trust through transparent and ethical business practices.' }
                        ].map((value, idx) => (
                            <div key={idx} className="p-8 bg-gray-50 rounded-2xl hover:shadow-lg transition-all hover:-translate-y-1">
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;

import React from 'react';
import { PenTool, Box, Activity, Settings, CheckSquare, ClipboardList, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Services: React.FC = () => {
    const services = [
        {
            icon: PenTool,
            title: "Plant Design & Installation",
            description: "Custom engineering solutions tailored to your specific feedstock and capacity requirements. From feasibility studies to full-scale turnkey installation.",
        },
        {
            icon: Box,
            title: "Equipment Supply",
            description: "We supply high-quality, durable equipment including crushers, digestors, purification systems, and bottling units sourced from top-tier manufacturers.",
        },
        {
            icon: CheckSquare,
            title: "Commissioning & Training",
            description: "Rigorous testing and commissioning protocols ensure your plant operates at peak performance. We provide comprehensive training for your operational staff.",
        },
        {
            icon: ClipboardList,
            title: "RFQ Preparation",
            description: "Expert guidance to create comprehensive RFQs. We help align your technical expectations and commercial requirements to ensure vendors provide accurate, all-inclusive quotes.",
        },
        {
            icon: Users,
            title: "Vendor Selection",
            description: "Unbiased evaluation of suppliers. We help you balance technical specs, experience, price, and delivery terms based on your specific priorities for capital equipment.",
        },
        {
            icon: Activity,
            title: "Maintenance & Support",
            description: "Ongoing technical support and scheduled maintenance packages to minimize downtime and ensure the longevity of your investment.",
        }
    ];

    return (
        <div className="bg-white">
            <section className="bg-gray-50 py-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <span className="text-secondary font-bold tracking-wider uppercase text-sm">What We Do</span>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mt-2 mb-6">Services & Products</h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        End-to-end support for your bio-energy journey. We help you every step of the way.
                    </p>
                </div>
            </section>

            <section className="py-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {services.map((service, index) => (
                            <div key={index} className="bg-white p-10 rounded-2xl shadow-lg border border-gray-100 hover:border-secondary/50 transition-all duration-300 group hover:-translate-y-1">
                                <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary-dark rounded-2xl flex items-center justify-center mb-8 text-white transform group-hover:rotate-6 transition-transform shadow-lg shadow-secondary/20">
                                    <service.icon className="h-8 w-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    {service.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 bg-primary text-white text-center">
                <div className="container mx-auto px-4 max-w-4xl">
                    <Settings className="h-16 w-16 mx-auto mb-6 opacity-80 animate-spin-slow" />
                    <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Need a Custom Solution?</h2>
                    <p className="text-xl text-primary-50 mb-10">
                        Every project is unique. Contact our engineering team to discuss your specific requirements.
                    </p>
                    <Link to="/contact" className="bg-white text-primary px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-50 transition-colors shadow-lg">
                        Get in Touch
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Services;

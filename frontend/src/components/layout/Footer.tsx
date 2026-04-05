import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Mail, MapPin, Phone, Linkedin, Twitter, Facebook } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-neutral-900 text-white pt-20 pb-10 border-t border-neutral-800">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
                    {/* Brand Column */}
                    <div className="lg:col-span-4">
                        <Link to="/" className="flex items-center mb-6 group">
                            <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
                                <Leaf className="h-8 w-8 text-primary" />
                            </div>
                            <span className="ml-3 text-3xl font-display font-bold text-white tracking-tight">
                                Gascart<span className="text-primary">.</span>
                            </span>
                        </Link>
                        <p className="text-gray-400 mb-8 leading-relaxed max-w-sm">
                            Empowering both Bio-CNG and conventional CNG ecosystems with a unified platform for components, machinery, and spares. Join us in building efficient and sustainable gas infrastructure.
                        </p>
                        <div className="flex space-x-4">
                            {[Linkedin, Twitter, Facebook].map((Icon, idx) => (
                                <a
                                    key={idx}
                                    href="#"
                                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all duration-300 hover:-translate-y-1"
                                >
                                    <Icon className="h-5 w-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Link Columns */}
                    <div className="lg:col-span-2">
                        <h4 className="text-lg font-bold mb-6 text-white font-display">Company</h4>
                        <ul className="space-y-4">
                            {[
                                { name: 'About Us', path: '/about-us' },
                                { name: 'Job Pool', path: '/careers' },
                                { name: 'Knowledge Hub', path: '/learn' },
                                { name: 'Platform Documents', path: '/learn' },
                                { name: 'Contact', path: '/contact' }
                            ].map((item) => (
                                <li key={item.name}>
                                    <Link to={item.path} className="text-gray-400 hover:text-primary transition-colors flex items-center group">
                                        <span className="group-hover:translate-x-1 transition-transform">{item.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-3">
                        <h4 className="text-lg font-bold mb-6 text-white font-display">Solutions</h4>
                        <ul className="space-y-4">
                            {['Plant Design', 'Equipment Supply', 'Commissioning', 'Maintenance'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-gray-400 hover:text-primary transition-colors flex items-center group">
                                        <span className="group-hover:translate-x-1 transition-transform">{item}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-3">
                        <h4 className="text-lg font-bold mb-6 text-white font-display">Get in Touch</h4>
                        <ul className="space-y-6">
                            <li className="flex items-start">
                                <MapPin className="h-6 w-6 text-primary mr-4 mt-1 flex-shrink-0" />
                                <span className="text-gray-400">No 5, Rajdhani Building, KHB Colony, Sirsi 581401 KA</span>
                            </li>
                            <li className="flex items-center">
                                <Phone className="h-5 w-5 text-primary mr-4 flex-shrink-0" />
                                <span className="text-gray-400">973 990 3856 <span className="text-gray-500 text-xs">(SMS for call back)</span></span>
                            </li>
                            <li className="flex items-center">
                                <Mail className="h-5 w-5 text-primary mr-4 flex-shrink-0" />
                                <a href="mailto:info@gascart.in" className="text-gray-400 hover:text-primary transition-colors">info@gascart.in</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-500">
                            © {new Date().getFullYear()} Gascart Inc. All rights reserved.
                        </p>
                        <div className="flex gap-6 text-sm text-gray-500">
                            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                            <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Mail, MapPin, Phone, Linkedin, Twitter, Facebook } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-900 text-white pt-12 md:pt-16 pb-8 border-t border-gray-800">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                    {/* Company Info */}
                    <div className="sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center mb-6">
                            <Leaf className="h-8 w-8 text-primary" />
                            <span className="ml-2 text-2xl font-bold">Gascart</span>
                        </div>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            Leading the way in clean biomethane and Bio-CNG gasification solutions. Transforming waste into sustainable energy for a greener future.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-primary transition-all transform hover:scale-110">
                                <Linkedin className="h-6 w-6" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-primary transition-all transform hover:scale-110">
                                <Twitter className="h-6 w-6" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-primary transition-all transform hover:scale-110">
                                <Facebook className="h-6 w-6" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 text-white">Quick Links</h3>
                        <ul className="space-y-3">
                            <li><Link to="/" className="text-gray-400 hover:text-primary transition-colors">Home</Link></li>
                            <li><Link to="/about" className="text-gray-400 hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link to="/services" className="text-gray-400 hover:text-primary transition-colors">Services</Link></li>
                            <li><Link to="/technology" className="text-gray-400 hover:text-primary transition-colors">Technology</Link></li>
                            <li><Link to="/shop" className="text-gray-400 hover:text-primary transition-colors">Products</Link></li>
                            <li><Link to="/contact" className="text-gray-400 hover:text-primary transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 text-white">Our Services</h3>
                        <ul className="space-y-3">
                            <li className="text-gray-400 hover:text-white transition-colors cursor-default">Plant Design & Installation</li>
                            <li className="text-gray-400 hover:text-white transition-colors cursor-default">Equipment Supply</li>
                            <li className="text-gray-400 hover:text-white transition-colors cursor-default">Commissioning & Training</li>
                            <li className="text-gray-400 hover:text-white transition-colors cursor-default">Maintenance & Support</li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 text-white">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start">
                                <MapPin className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                                <span className="text-gray-400">123 Innovation Drive, Green Tech Park, CA 90210</span>
                            </li>
                            <li className="flex items-center">
                                <Phone className="h-6 w-6 text-primary mr-3 flex-shrink-0" />
                                <span className="text-gray-400">+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-center">
                                <Mail className="h-6 w-6 text-primary mr-3 flex-shrink-0" />
                                <a href="mailto:info@gascart.com" className="text-gray-400 hover:text-primary transition-colors">info@gascart.com</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} Gascart. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

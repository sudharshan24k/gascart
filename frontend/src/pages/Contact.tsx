import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Placeholder for form submission logic
        console.log('Form submitted:', formData);
        alert('Thank you for your message! We will get back to you soon.');
        setFormData({ name: '', email: '', phone: '', message: '' });
    };

    return (
        <div className="bg-white">
            <section className="bg-primary-dark text-white py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-pattern-grid opacity-10"></div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">Let's Connect</h1>
                    <p className="text-xl text-primary-50 max-w-3xl mx-auto opacity-90">
                        Discuss your bio-energy requirements with our technical implementation team.
                    </p>
                </div>
            </section>

            <section className="py-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        {/* Contact Info */}
                        <div>
                            <span className="text-primary font-bold tracking-wider uppercase text-sm">Operation Hub</span>
                            <h2 className="text-3xl font-display font-bold text-gray-900 mt-2 mb-8">Reach Gascart Directly</h2>
                            <div className="space-y-8">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 bg-neutral-light p-4 rounded-xl text-primary">
                                        <MapPin className="h-6 w-6" />
                                    </div>
                                    <div className="ml-6">
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">Main Facility</h3>
                                        <p className="text-gray-600">
                                            Plot No. 45, Industrial Area Phase II,<br />
                                            Biogas Industrial Park, IN 110021
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="flex-shrink-0 bg-neutral-light p-4 rounded-xl text-primary">
                                        <Phone className="h-6 w-6" />
                                    </div>
                                    <div className="ml-6">
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">Technical Support</h3>
                                        <p className="text-gray-600 font-medium">+91 (800) 555-0199</p>
                                        <p className="text-gray-500 text-sm mt-1">Available 24/7 for Plant Operations</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="flex-shrink-0 bg-neutral-light p-4 rounded-xl text-primary">
                                        <Mail className="h-6 w-6" />
                                    </div>
                                    <div className="ml-6">
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">Electronic Correspondence</h3>
                                        <p className="text-gray-600">contact@gascart.in</p>
                                        <p className="text-gray-600">sales@gascart.in</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 bg-gray-50 p-8 rounded-3xl border border-gray-100 flex flex-col items-center sm:flex-row sm:justify-between gap-6">
                                <div className="text-center sm:text-left">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Prefer instant chat?</h3>
                                    <p className="text-gray-600">Our engineers are online on WhatsApp.</p>
                                </div>
                                <a
                                    href="https://wa.me/91XXXXXXXXXX"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-[#25D366] hover:bg-[#128C7E] text-white px-8 py-3 rounded-full font-bold flex items-center shadow-lg transition-transform active:scale-95 whitespace-nowrap"
                                >
                                    Chat on WhatsApp
                                </a>
                            </div>

                            <div className="mt-8 w-full h-64 bg-neutral-light rounded-3xl overflow-hidden border border-neutral-dark/20 relative">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d224345.83923307525!2d77.0688975!3d28.5272803!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd5b347eb62d%3A0x37205b71dbbd3b!2sNew%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1673891234567!5m2!1sen!2sin"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Gascart Location"
                                ></iframe>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl border border-neutral-light">
                            <h2 className="text-2xl font-bold text-gray-900 mb-8">Industrial Inquiry Form</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                            placeholder="Enter your name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            id="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                            placeholder="email@company.com"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                        placeholder="+91-XXXXX-XXXXX"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-2">Message Description</label>
                                    <textarea
                                        id="message"
                                        rows={5}
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                        placeholder="Please describe your requirements..."
                                        required
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-primary/30 flex items-center justify-center space-x-2"
                                >
                                    <Send className="h-5 w-5" />
                                    <span>Submit Inquiry</span>
                                </button>
                                <p className="text-center text-xs text-gray-500 mt-4">
                                    By submitting this form, you agree to being contacted regarding your inquiry.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;

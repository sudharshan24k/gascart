const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand */}
                    <div>
                        <h3 className="text-2xl font-display font-bold text-white mb-4">Gascart</h3>
                        <p className="text-gray-400">
                            Premium quality essentials delivered with care.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-bold mb-4">Shop</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="#" className="hover:text-primary-500">All Products</a></li>
                            <li><a href="#" className="hover:text-primary-500">New Arrivals</a></li>
                            <li><a href="#" className="hover:text-primary-500">Best Sellers</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Company</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="#" className="hover:text-primary-500">About Us</a></li>
                            <li><a href="#" className="hover:text-primary-500">Contact</a></li>
                            <li><a href="#" className="hover:text-primary-500">Terms</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Newsletter</h4>
                        <form className="flex">
                            <input
                                type="email"
                                placeholder="Your email"
                                className="bg-gray-800 text-white px-4 py-2 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-primary-500 w-full"
                            />
                            <button className="bg-primary-600 px-4 py-2 rounded-r-lg hover:bg-primary-700">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
                <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
                    © {new Date().getFullYear()} Gascart. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;

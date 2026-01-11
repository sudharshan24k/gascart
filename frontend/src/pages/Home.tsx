import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div>
            {/* Hero Section */}
            <section className="relative bg-gray-900 text-white h-[600px] flex items-center">
                <div className="absolute inset-0 overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
                        alt="Hero"
                        className="w-full h-full object-cover opacity-50"
                    />
                </div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight">
                        Elevate Your <br /> Lifestyle
                    </h1>
                    <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
                        Discover our curated collection of premium essentials designed for modern living.
                    </p>
                    <Link
                        to="/shop"
                        className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-4 rounded-full transition-transform hover:scale-105"
                    >
                        Shop Collection
                    </Link>
                </div>
            </section>

            {/* Featured Categories - Placeholder */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-display font-bold text-center mb-12">Featured Categories</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-8 h-64 flex items-center justify-center">
                                <span className="text-gray-400 font-medium">Category {i}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;

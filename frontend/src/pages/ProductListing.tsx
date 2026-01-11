import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Filter } from 'lucide-react';

// Mock data until API is connected
const MOCK_PRODUCTS = [
    { id: '1', name: 'Premium Leather Bag', price: 129.99, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80', category: 'Accessories' },
    { id: '2', name: 'Minimalist Watch', price: 199.50, image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80', category: 'Accessories' },
    { id: '3', name: 'Ceramic Vase Set', price: 45.00, image: 'https://images.unsplash.com/photo-1578500494198-246f612d3e3d?auto=format&fit=crop&w=800&q=80', category: 'Home' },
    { id: '4', name: 'Wireless Headphones', price: 299.00, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', category: 'Electronics' },
];

const ProductListing = () => {
    const [products, setProducts] = useState(MOCK_PRODUCTS);
    const [activeCategory, setActiveCategory] = useState('All');

    // In real implementation, this would fetch from API based on filters
    useEffect(() => {
        if (activeCategory === 'All') {
            setProducts(MOCK_PRODUCTS);
        } else {
            setProducts(MOCK_PRODUCTS.filter(p => p.category === activeCategory));
        }
    }, [activeCategory]);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-display font-bold">Shop Full Collection</h1>
                <button className="flex items-center text-gray-600 hover:text-primary-600">
                    <Filter className="w-5 h-5 mr-2" />
                    Filter
                </button>
            </div>

            <div className="flex gap-8">
                {/* Sidebar Filters - Desktop */}
                <aside className="hidden md:block w-64 flex-shrink-0">
                    <h3 className="font-bold mb-4">Categories</h3>
                    <ul className="space-y-2">
                        {['All', 'Accessories', 'Home', 'Electronics', 'Clothing'].map(cat => (
                            <li key={cat}>
                                <button
                                    onClick={() => setActiveCategory(cat)}
                                    className={`block w-full text-left ${activeCategory === cat ? 'text-primary-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    {cat}
                                </button>
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* Product Grid */}
                <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map((product) => (
                        <Link key={product.id} to={`/product/${product.id}`} className="group">
                            <div className="bg-gray-100 rounded-xl overflow-hidden mb-4 relative aspect-[4/5]">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                            <h3 className="font-medium text-lg mb-1">{product.name}</h3>
                            <p className="text-gray-600">${product.price.toFixed(2)}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductListing;

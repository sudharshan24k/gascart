import { useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import { Plus, Minus, ShoppingBag } from 'lucide-react';

const ProductDetail = () => {
    const { id } = useParams();
    const { dispatch } = useCart();
    const [quantity, setQuantity] = useState(1);

    // Mock Data
    const product = {
        id: id || '1',
        name: 'Premium Leather Bag',
        price: 129.99,
        description: 'Handcrafted with premium Italian leather, this bag features a spacious interior, durable hardware, and a timeless design suitable for any occasion.',
        image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
        colors: ['Black', 'Brown', 'Tan'],
        sizes: ['One Size']
    };

    const handleAddToCart = () => {
        dispatch({
            type: 'ADD_ITEM',
            payload: {
                id: product.id,
                name: product.name,
                price: product.price,
                quantity,
                image: product.image
            }
        });
        // Can add toast notification here
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Gallery */}
                <div className="bg-gray-100 rounded-2xl overflow-hidden aspect-square">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>

                {/* Info */}
                <div>
                    <h1 className="text-4xl font-display font-bold mb-4">{product.name}</h1>
                    <p className="text-2xl text-gray-900 font-medium mb-6">${product.price}</p>

                    <p className="text-gray-600 mb-8 leading-relaxed">
                        {product.description}
                    </p>

                    <div className="mb-8">
                        <h3 className="font-bold mb-3">Color</h3>
                        <div className="flex space-x-3">
                            {product.colors.map(color => (
                                <button key={color} className="border border-gray-300 px-4 py-2 rounded-lg hover:border-primary-600 focus:ring-2 focus:ring-primary-500">
                                    {color}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center space-x-6 mb-8">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="p-3 hover:text-primary-600"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center font-medium">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="p-3 hover:text-primary-600"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl flex items-center justify-center space-x-2 transition-transform active:scale-95"
                    >
                        <ShoppingBag className="w-5 h-5" />
                        <span>Add to Cart - ${(product.price * quantity).toFixed(2)}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;

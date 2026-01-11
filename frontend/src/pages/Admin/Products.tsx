import { Plus } from 'lucide-react';
import { useState } from 'react';

const AdminProducts = () => {
    // Mock Data
    const [products] = useState([
        { id: 1, name: 'Premium Leather Bag', price: 129.99, stock: 45, category: 'Accessories' },
        { id: 2, name: 'Minimalist Watch', price: 199.50, stock: 12, category: 'Accessories' },
        { id: 3, name: 'Ceramic Vase Set', price: 45.00, stock: 8, category: 'Home' },
    ]);

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Products</h2>
                <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                    <Plus className="w-5 h-5" />
                    <span>Add Product</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                        <tr>
                            <th className="py-4 px-6 font-medium">Product Name</th>
                            <th className="py-4 px-6 font-medium">Category</th>
                            <th className="py-4 px-6 font-medium">Price</th>
                            <th className="py-4 px-6 font-medium">Stock</th>
                            <th className="py-4 px-6 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td className="py-4 px-6 font-medium">{product.name}</td>
                                <td className="py-4 px-6 text-gray-500">{product.category}</td>
                                <td className="py-4 px-6">${product.price.toFixed(2)}</td>
                                <td className="py-4 px-6 text-gray-500">{product.stock} units</td>
                                <td className="py-4 px-6">
                                    <button className="text-primary-600 hover:underline mr-4">Edit</button>
                                    <button className="text-red-500 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminProducts;

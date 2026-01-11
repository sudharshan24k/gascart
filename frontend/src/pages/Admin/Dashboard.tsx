import { DollarSign, ShoppingBag, Users, TrendingUp } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ElementType;
    trend: number;
}

const StatCard = ({ title, value, icon: Icon, trend }: StatCardProps) => (
    <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary-50 rounded-lg text-primary-600">
                <Icon className="w-6 h-6" />
            </div>
            <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'} flex items-center`}>
                <TrendingUp className="w-4 h-4 mr-1" />
                {trend}%
            </span>
        </div>
        <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
        <h4 className="text-2xl font-bold">{value}</h4>
    </div>
);

const AdminDashboard = () => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-8">Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Revenue" value="$45,231.89" icon={DollarSign} trend={12.5} />
                <StatCard title="Total Orders" value="356" icon={ShoppingBag} trend={8.2} />
                <StatCard title="Active Customers" value="2,104" icon={Users} trend={5.3} />
                <StatCard title="Avg. Order Value" value="$126.50" icon={TrendingUp} trend={-2.1} />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="font-bold text-lg mb-6">Recent Orders</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 text-gray-500 text-sm">
                                <th className="pb-4 font-medium">Order ID</th>
                                <th className="pb-4 font-medium">Customer</th>
                                <th className="pb-4 font-medium">Date</th>
                                <th className="pb-4 font-medium">Total</th>
                                <th className="pb-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {[1001, 1002, 1003, 1004].map(id => (
                                <tr key={id}>
                                    <td className="py-4 font-medium">#{id}</td>
                                    <td className="py-4">John Doe</td>
                                    <td className="py-4 text-gray-500">Oct 24, 2023</td>
                                    <td className="py-4">$129.99</td>
                                    <td className="py-4">
                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                                            Delivered
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

'use client';

import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, FileText, Package, Activity } from 'lucide-react';


interface ChartData {
    monthlyData: Array<{ month: string; pdfs: number; users: number }>;
    distributionData: Array<{ name: string; value: number; color: string }>;
    recentActivity: Array<{ time: string; action: string; user: string }>;
    stats: {
        totalUsers: number;
        totalDistributors: number;
        totalPdfs: number;
        activeSessions: number;
    };
}

interface DashboardChartsProps {
    data: ChartData;
}

interface StatsCardProps {
    title: string;
    value: string;
    change: string;
    icon: React.ReactNode;
    color: string;
    delay: number;
}

const StatsCard = ({ title, value, change, icon, color, delay }: StatsCardProps) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover-scale transition-all duration-300 relative overflow-hidden group"
    >
        {/* Gradient Background Overlay */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${color}`}></div>

        <div className="relative z-10 flex items-center justify-between">
            <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">{title}</p>
                <p className="text-4xl font-bold text-gray-900 mb-2">{value}</p>
                <p className={`text-sm mt-1 flex items-center gap-1 font-medium ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    <TrendingUp className="w-4 h-4" />
                    {change} from last month
                </p>
            </div>
            <div className={`p-4 rounded-2xl ${color} transform group-hover:scale-110 transition-transform duration-300`}>
                {icon}
            </div>
        </div>
    </motion.div>
);

export function DashboardCharts({ data }: DashboardChartsProps) {
    const { monthlyData, distributionData, recentActivity, stats } = data;

    return (
        <div className="space-y-6">
            {/* Stats Grid with Stagger Animation */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Users"
                    value={stats.totalUsers.toString()}
                    change="+12%"
                    icon={<Users className="w-8 h-8 text-white" />}
                    color="bg-gradient-to-br from-blue-500 to-blue-600"
                    delay={0}
                />
                <StatsCard
                    title="Distributors"
                    value={stats.totalDistributors.toString()}
                    change="+8%"
                    icon={<Package className="w-8 h-8 text-white" />}
                    color="bg-gradient-to-br from-green-500 to-green-600"
                    delay={0.1}
                />
                <StatsCard
                    title="Total PDFs"
                    value={stats.totalPdfs.toString()}
                    change="+23%"
                    icon={<FileText className="w-8 h-8 text-white" />}
                    color="bg-gradient-to-br from-purple-500 to-purple-600"
                    delay={0.2}
                />
                <StatsCard
                    title="Active Users"
                    value={stats.activeSessions.toString()}
                    change="+5%"
                    icon={<Activity className="w-8 h-8 text-white" />}
                    color="bg-gradient-to-br from-orange-500 to-orange-600"
                    delay={0.3}
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Monthly Overview with Area Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-100 p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Monthly Overview</h3>
                            <p className="text-sm text-gray-600 mt-1">Last 6 months performance</p>
                        </div>
                        <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                            +23% Growth
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={320}>
                        <AreaChart data={monthlyData}>
                            <defs>
                                <linearGradient id="colorPdfs" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                    padding: '12px'
                                }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Area
                                type="monotone"
                                dataKey="pdfs"
                                name="PDF Uploads"
                                stroke="#10b981"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorPdfs)"
                            />
                            <Area
                                type="monotone"
                                dataKey="users"
                                name="New Users"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorUsers)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Distribution Pie Chart */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
                >
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <PieChart>
                            <Pie
                                data={distributionData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }: any) => {
                                    const percentage = ((percent || 0) * 100).toFixed(0);
                                    return percentage !== '0' ? `${name.split(' ')[0]}\n${percentage}%` : '';
                                }}
                                outerRadius={90}
                                fill="#8884d8"
                                dataKey="value"
                                animationBegin={0}
                                animationDuration={800}
                            >
                                {distributionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                        {distributionData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-gray-700">{item.name}</span>
                                </div>
                                <span className="font-semibold text-gray-900">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Activity and Bar Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Performance Bar Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
                >
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Performance</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                    padding: '12px'
                                }}
                            />
                            <Legend />
                            <Bar dataKey="pdfs" name="PDF Uploads" fill="#10b981" radius={[8, 8, 0, 0]} />
                            <Bar dataKey="users" name="New Users" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
                >
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto">
                        {recentActivity.map((activity, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8 + index * 0.1 }}
                                className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0"
                            >
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0 animate-pulse-slow"></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {activity.user} • {activity.time}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <button className="w-full mt-4 text-sm text-green-600 hover:text-green-700 font-semibold transition-colors hover-scale">
                        View All Activity →
                    </button>
                </motion.div>
            </div>
        </div>
    );
}

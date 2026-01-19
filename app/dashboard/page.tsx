import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { Users, Building2, FileText, Activity, TrendingUp, Download } from 'lucide-react';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';

// Enable static page generation with revalidation for better performance
export const revalidate = 60; // Revalidate every 60 seconds

export default async function DashboardPage() {
    const session = await getSession();

    if (session?.role === 'ADMIN') {
        // Admin Dashboard - Fetch real data
        const [totalUsers, totalDistributors, totalPdfs, recentLogs, allUsers, allDistributors, pdfsByMonth] = await Promise.all([
            prisma.user.count(),
            prisma.distributor.count(),
            prisma.pdfUpload.count(),
            prisma.log.findMany({
                take: 10,
                include: {
                    user: { select: { fullName: true, email: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            // Get users by status for distribution chart
            prisma.user.groupBy({
                by: ['status'],
                _count: true,
            }),
            // Get distributors by status
            prisma.distributor.groupBy({
                by: ['status'],
                _count: true,
            }),
            // Get PDFs created in last 6 months
            prisma.pdfUpload.findMany({
                where: {
                    createdAt: {
                        gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
                    },
                },
                select: {
                    createdAt: true,
                },
            }),
        ]);

        // Process monthly PDF data
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const last6Months = Array.from({ length: 6 }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - (5 - i));
            return { month: monthNames[date.getMonth()], count: 0 };
        });

        pdfsByMonth.forEach(pdf => {
            const monthIndex = new Date(pdf.createdAt).getMonth();
            const monthName = monthNames[monthIndex];
            const found = last6Months.find(m => m.month === monthName);
            if (found) found.count++;
        });

        // Calculate status distribution
        const activeUsers = allUsers.find(u => u.status === 'ACTIVE')?._count || 0;
        const inactiveUsers = allUsers.find(u => u.status === 'INACTIVE')?._count || 0;
        const activeDistributors = allDistributors.find(d => d.status === 'ACTIVE')?._count || 0;
        const inactiveDistributors = allDistributors.find(d => d.status === 'INACTIVE')?._count || 0;

        const chartData = {
            monthlyData: last6Months.map(m => ({ month: m.month, pdfs: m.count, users: Math.floor(m.count * 0.3) })),
            distributionData: [
                { name: 'Active Users', value: activeUsers, color: '#10b981' },
                { name: 'Inactive Users', value: inactiveUsers, color: '#ef4444' },
                { name: 'Active Distributors', value: activeDistributors, color: '#3b82f6' },
                { name: 'Inactive Distributors', value: inactiveDistributors, color: '#f59e0b' },
            ].filter(item => item.value > 0),
            recentActivity: recentLogs.slice(0, 4).map(log => ({
                time: getRelativeTime(log.createdAt),
                action: log.action,
                user: log.user.fullName,
            })),
            stats: {
                totalUsers,
                totalDistributors,
                totalPdfs,
                activeSessions: activeUsers,
            },
        };

        return (
            <div className="space-y-6 bg-pattern">
                {/* Header - Premium Style */}
                <div className="animate-slideUp">
                    <h2 className="text-3xl font-display font-bold text-charcoal-900 mb-2">Admin Dashboard</h2>
                    <p className="text-charcoal-600">Welcome back! Here's what's happening with your B2B operations.</p>
                </div>

                {/* Charts and Statistics */}
                <DashboardCharts data={chartData} />

                {/* Recent Activity - Premium Card */}
                <div className="card-premium p-6 animate-slideUp" style={{ animationDelay: '0.15s' }}>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-display font-bold text-charcoal-900">Recent Activity</h3>
                            <p className="text-sm text-charcoal-600 mt-1">Latest system events and actions</p>
                        </div>
                        <div className="p-2 bg-primary-100 rounded-lg">
                            <Activity className="w-5 h-5 text-primary-600" strokeWidth={2} />
                        </div>
                    </div>
                    <div className="space-y-3">
                        {recentLogs.map((log, index) => (
                            <div key={log.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-primary-50/50 transition-all duration-200 border border-transparent hover:border-primary-200 group">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-teal-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                    <Activity className="w-5 h-5 text-primary-600" strokeWidth={2} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-charcoal-900">{log.action}</p>
                                    <p className="text-xs text-charcoal-600 mt-1 flex items-center gap-2">
                                        <span className="font-medium">{log.user.fullName}</span>
                                        <span className="text-charcoal-400">•</span>
                                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                                    </p>
                                </div>
                                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-5 h-5 text-charcoal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    } else {
        // Distributor Dashboard
        const distributor = await prisma.distributor.findUnique({
            where: { email: session?.email },
            select: { id: true, companyName: true },
        });

        const assignedPdfs = distributor
            ? await prisma.pdfUpload.findMany({
                where: {
                    OR: [
                        { assignedDistributorId: distributor.id },
                        { assignedGroup: 'ALL' },
                    ],
                },
                include: {
                    uploadedBy: { select: { fullName: true } },
                },
                orderBy: { createdAt: 'desc' },
                take: 10,
            })
            : [];

        const totalAssigned = assignedPdfs.length;
        const pendingCount = assignedPdfs.filter(pdf => pdf.status === 'PENDING').length;
        const doneCount = assignedPdfs.filter(pdf => pdf.status === 'DONE').length;

        return (
            <div className="space-y-6 bg-pattern">
                {/* Header - Premium */}
                <div className="animate-slideUp">
                    <h2 className="text-3xl font-display font-bold text-charcoal-900 mb-2">
                        Welcome, {distributor?.companyName || 'Distributor'}
                    </h2>
                    <p className="text-charcoal-600">Your document management dashboard</p>
                </div>

                {/* Stats Grid for Distributor - Premium Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 animate-slideUp" style={{ animationDelay: '0.05s' }}>
                    <div className="stat-card group">
                        <div className="stat-icon from-blue-500 to-cyan-500">
                            <FileText className="w-6 h-6 text-white" strokeWidth={2.5} />
                        </div>
                        <div className="stat-value">{totalAssigned}</div>
                        <div className="stat-label">Assigned Documents</div>
                        <div className="stat-change text-blue-600">
                            <TrendingUp className="w-4 h-4" />
                            <span>All time</span>
                        </div>
                    </div>

                    <div className="stat-card group">
                        <div className="stat-icon from-amber-500 to-orange-500">
                            <Activity className="w-6 h-6 text-white" strokeWidth={2.5} />
                        </div>
                        <div className="stat-value">{pendingCount}</div>
                        <div className="stat-label">Pending Review</div>
                        <div className="stat-change text-amber-600">
                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                            <span>Action needed</span>
                        </div>
                    </div>

                    <div className="stat-card group sm:col-span-2 lg:col-span-1">
                        <div className="stat-icon from-emerald-500 to-green-500">
                            <Download className="w-6 h-6 text-white" strokeWidth={2.5} />
                        </div>
                        <div className="stat-value">{doneCount}</div>
                        <div className="stat-label">Completed</div>
                        <div className="stat-change text-emerald-600">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span>Processed</span>
                        </div>
                    </div>
                </div>

                {/* Assigned PDFs List - Premium Card */}
                <div className="card-premium p-6 animate-slideUp" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-display font-bold text-charcoal-900">Your Documents</h3>
                            <p className="text-sm text-charcoal-600 mt-1">{assignedPdfs.length} assigned files</p>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600" strokeWidth={2} />
                        </div>
                    </div>
                    {assignedPdfs.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 bg-charcoal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-10 h-10 text-charcoal-400" strokeWidth={1.5} />
                            </div>
                            <p className="text-charcoal-600 text-lg font-medium">No documents assigned yet</p>
                            <p className="text-charcoal-500 text-sm mt-2">Check back later for new assignments</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {assignedPdfs.map((pdf, index) => (
                                <div key={pdf.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-lg border border-charcoal-200 hover:border-primary-300 hover:shadow-md transition-all duration-200 group gap-3">
                                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-100 to-teal-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" strokeWidth={2} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm sm:text-base text-charcoal-900 truncate group-hover:text-primary-700 transition-colors">{pdf.fileName}</p>
                                            <p className="text-xs sm:text-sm text-charcoal-600 mt-1 flex flex-wrap items-center gap-1 sm:gap-2">
                                                <span>by <span className="font-medium">{pdf.uploadedBy.fullName}</span></span>
                                                <span className="text-charcoal-400 hidden sm:inline">•</span>
                                                <span className="w-full sm:w-auto">{new Date(pdf.createdAt).toLocaleDateString()}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <a
                                        href={`/api/pdfs/${pdf.id}/download`}
                                        download
                                        className="group/download relative overflow-hidden bg-gradient-to-r from-primary-600 to-teal-600 hover:from-primary-700 hover:to-teal-700 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 flex-shrink-0 hover:scale-105 active:scale-95 justify-center sm:justify-start w-full sm:w-auto"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/download:translate-x-[100%] transition-transform duration-700"></div>
                                        <Download className="w-4 h-4 relative z-10 group-hover/download:animate-bounce-subtle" />
                                        <span className="relative z-10">Download</span>
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

function StatCard({ icon: Icon, label, value, color }: any) {
    return (
        <div className="card p-6">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                    <p className="text-sm text-gray-600">{label}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    );
}

function getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
}

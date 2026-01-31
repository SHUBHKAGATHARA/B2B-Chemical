'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { FileText, Calendar, Plus, Save, Trash2, Edit2, X, Share2, ExternalLink, ChevronRight, Newspaper, Clock, TrendingUp, Bookmark, Eye, MessageCircle, ArrowUpRight, Sparkles, Tag } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { authStorage } from '@/lib/auth-storage';

interface NewsItem {
    id: string;
    title: string;
    content: string;
    category: string;
    publishDate: string;
    source?: string;
    author?: { fullName: string };
}

export default function NewsManagementPage() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [expandedNews, setExpandedNews] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        category: 'General Announcement',
        publishDate: new Date().toISOString().split('T')[0],
        content: '',
        source: '',
    });

    useEffect(() => {
        const user = authStorage.getUser();
        if (user && user.role === 'ADMIN') {
            setIsAdmin(true);
        }
        loadNews();
    }, []);

    const loadNews = async () => {
        try {
            setLoading(true);
            const response = await apiClient.getNews({ limit: '50' });
            // Sort by date, most recent first
            const sortedNews = (response.data || []).sort((a: NewsItem, b: NewsItem) => 
                new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
            );
            setNews(sortedNews);
        } catch (error) {
            console.error('Failed to load news:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                publishDate: new Date(formData.publishDate).toISOString(),
            };

            if (editingItem) {
                await apiClient.updateNews(editingItem.id, payload);
            } else {
                await apiClient.createNews(payload);
            }

            setIsEditing(false);
            setEditingItem(null);
            resetForm();
            loadNews();
        } catch (error: any) {
            console.error('Failed to save news:', error);
            alert('Failed to save news: ' + error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this news article?')) return;
        try {
            await apiClient.deleteNews(id);
            loadNews();
        } catch (error: any) {
            console.error('Failed to delete news:', error);
            alert('Failed to delete news');
        }
    };

    const handleEdit = (item: NewsItem) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            category: item.category,
            publishDate: item.publishDate.split('T')[0],
            content: item.content,
            source: item.source || '',
        });
        setIsEditing(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            category: 'General Announcement',
            publishDate: new Date().toISOString().split('T')[0],
            content: '',
            source: '',
        });
        setEditingItem(null);
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Industry Update': return 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-200';
            case 'Product Launch': return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-200';
            case 'Regulatory': return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-200';
            case 'Company News': return 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-200';
            default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-200';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Industry Update': return <TrendingUp className="w-3.5 h-3.5" />;
            case 'Product Launch': return <Sparkles className="w-3.5 h-3.5" />;
            case 'Regulatory': return <FileText className="w-3.5 h-3.5" />;
            case 'Company News': return <Newspaper className="w-3.5 h-3.5" />;
            default: return <Tag className="w-3.5 h-3.5" />;
        }
    };

    const getReadingTime = (content: string) => {
        const wordsPerMinute = 200;
        const words = content.split(/\s+/).length;
        const minutes = Math.ceil(words / wordsPerMinute);
        return minutes;
    };

    const getGradientBackground = (index: number) => {
        const gradients = [
            'from-teal-50 via-cyan-50/50 to-transparent',
            'from-emerald-50 via-teal-100/50 to-transparent',
            'from-purple-50 via-purple-100/50 to-transparent',
            'from-green-50 via-green-100/50 to-transparent',
            'from-pink-50 via-pink-100/50 to-transparent',
        ];
        return gradients[index % gradients.length];
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Dashboard</span>
                    <ChevronRight className="w-4 h-4" />
                    <span>News</span>
                    {isAdmin && (
                        <>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-gray-900 font-medium">Upload</span>
                        </>
                    )}
                </div>
            </div>

            {/* Header */}
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-300/20 via-cyan-300/20 to-emerald-300/20 rounded-3xl blur-3xl"></div>
                <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl shadow-lg shadow-teal-200">
                            <Newspaper className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-teal-700 to-gray-900 bg-clip-text text-transparent">
                                {isAdmin ? 'News Management' : 'Latest News & Updates'}
                            </h1>
                        </div>
                    </div>
                    <p className="text-gray-600 text-lg ml-16">
                        {isAdmin 
                            ? 'Create and publish engaging announcements to keep everyone informed.'
                            : 'Stay ahead with the latest company announcements, industry insights, and updates.'
                        }
                    </p>
                </div>
            </div>

            {!isEditing && isAdmin && (
                <div className="mb-8">
                    <button
                        onClick={() => { resetForm(); setIsEditing(true); }}
                        className="group px-8 py-4 bg-gradient-to-r from-teal-400 via-cyan-500 to-teal-500 text-white rounded-2xl font-bold hover:from-teal-500 hover:via-cyan-600 hover:to-teal-600 transition-all duration-300 shadow-xl shadow-teal-200 hover:shadow-2xl hover:shadow-teal-300 hover:-translate-y-1 active:translate-y-0 flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        </div>
                        <span className="text-lg">Create New Article</span>
                        <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                    </button>
                </div>
            )}

            {/* Editor View - Admin Only */}
            {isEditing && isAdmin ? (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900">
                            {editingItem ? 'Edit Article' : 'Create New Article'}
                        </h3>
                        <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none"
                                placeholder="Enter a catchy headline for your news..."
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Category */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none">
                                    <option value="General Announcement">General Announcement</option>
                                    <option value="Industry Update">Industry Update</option>
                                    <option value="Product Launch">Product Launch</option>
                                    <option value="Company News">Company News</option>
                                    <option value="Regulatory">Regulatory</option>
                                </select>
                            </div>

                            {/* Publish Date */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Publish Date</label>
                                <input
                                    type="date"
                                    value={formData.publishDate}
                                    onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none"
                                />
                            </div>
                        </div>

                        {/* Source */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Source / Reference (Optional)</label>
                            <input
                                type="text"
                                value={formData.source}
                                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none"
                                placeholder="e.g. BBC Reuters..."
                            />
                        </div>

                        {/* Content */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Content <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none min-h-[200px]"
                                placeholder="Write your news content here. You can use Markdown formatting."
                                required
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-400 to-cyan-500 text-white rounded-xl font-semibold hover:from-teal-500 hover:to-cyan-600 transition-all duration-300 shadow-md hover:shadow-teal-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 justify-center group">
                                <Save className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                                {editingItem ? 'Update Article' : 'Publish Article'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                /* News List View */
                <>
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400 mb-4"></div>
                            <p className="text-gray-500">Loading latest news...</p>
                        </div>
                    ) : news.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                            <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900">No News Yet</h3>
                            <p className="text-gray-500 mb-6">
                                {isAdmin 
                                    ? 'Start by creating your first announcement.'
                                    : 'No news or announcements have been posted yet.'
                                }
                            </p>
                            {isAdmin && (
                                <button
                                    onClick={() => { resetForm(); setIsEditing(true); }}
                                    className="px-6 py-3 bg-gradient-to-r from-teal-400 to-cyan-500 text-white rounded-xl font-semibold hover:from-teal-500 hover:to-cyan-600 transition-all duration-300 shadow-md hover:shadow-teal-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 group">
                                    <span className="flex items-center gap-2">
                                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                                        Create Article
                                    </span>
                                </button>
                            )}
                        </div>
                    ) : (
                        <div>
                            {/* All Articles Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {news.map((item, index) => (
                                    <div 
                                        key={item.id} 
                                        className="group relative bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-transparent hover:-translate-y-2"
                                    >
                                        {/* Gradient header */}
                                        <div className={`h-2 bg-gradient-to-r ${getGradientBackground(index)}`}></div>
                                        <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${getGradientBackground(index)} opacity-50`}></div>
                                        
                                        <div className="relative p-6">
                                            {/* Category Badge */}
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${getCategoryColor(item.category)}`}>
                                                    {getCategoryIcon(item.category)}
                                                    {item.category}
                                                </span>
                                            </div>

                                            {/* Title */}
                                            <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-teal-600 transition-colors line-clamp-2 leading-tight">
                                                {item.title}
                                            </h4>

                                            {/* Excerpt - Collapsed by default */}
                                            <div className="mb-4">
                                                {expandedNews === item.id ? (
                                                    <div className="space-y-3">
                                                        <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{item.content}</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">{item.content}</p>
                                                )}
                                            </div>

                                            {/* View Details Button */}
                                            <button 
                                                onClick={() => setExpandedNews(expandedNews === item.id ? null : item.id)}
                                                className="w-full px-4 py-2.5 bg-gradient-to-r from-teal-400 to-cyan-500 text-white rounded-lg font-semibold hover:from-teal-500 hover:to-cyan-600 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                                                <Eye className="w-4 h-4" />
                                                {expandedNews === item.id ? 'Hide Details' : 'View Details'}
                                            </button>

                                            {/* Meta Information */}
                                            <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                                                <div className="flex flex-col gap-2 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {new Date(item.publishDate).toLocaleDateString('en-US', { 
                                                            month: 'short', 
                                                            day: 'numeric' 
                                                        })}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {getReadingTime(item.content)} min read
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                                        {(item.author?.fullName || 'Admin').charAt(0)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Admin Actions */}
                                            {isAdmin && (
                                                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="flex-1 p-2 bg-teal-50 text-teal-600 hover:bg-teal-100 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md border border-teal-100 flex items-center justify-center gap-1.5 text-sm font-semibold"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="flex-1 p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md border border-red-100 flex items-center justify-center gap-1.5 text-sm font-semibold"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Hover Effect Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-teal-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

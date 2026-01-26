'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { FileText, Calendar, Plus, Save, Trash2, Edit2, X, Share2, ExternalLink, ChevronRight } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

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

    const [formData, setFormData] = useState({
        title: '',
        category: 'General Announcement',
        publishDate: new Date().toISOString().split('T')[0],
        content: '',
        source: '',
    });

    useEffect(() => {
        loadNews();
    }, []);

    const loadNews = async () => {
        try {
            setLoading(true);
            const response = await apiClient.getNews({ limit: '50' });
            setNews(response.data || []);
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
            case 'Industry Update': return 'bg-blue-100 text-blue-700';
            case 'Product Launch': return 'bg-purple-100 text-purple-700';
            case 'Regulatory': return 'bg-red-100 text-red-700';
            case 'Company News': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Dashboard</span>
                    <ChevronRight className="w-4 h-4" />
                    <span>News</span>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-gray-900 font-medium">Upload</span>
                </div>
            </div>

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">News Upload</h1>
                <p className="text-gray-600">
                    Create and publish new announcements to the company portal.
                </p>
            </div>

            {!isEditing && (
                <div className="mb-6">
                    <button
                        onClick={() => { resetForm(); setIsEditing(true); }}
                        className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md hover:shadow-orange-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        Add News
                    </button>
                </div>
            )}

            {/* Editor View */}
            {isEditing ? (
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
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
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                >
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
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none min-h-[200px]"
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
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md hover:shadow-orange-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 justify-center group"
                            >
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
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-4"></div>
                            <p className="text-gray-500">Loading latest news...</p>
                        </div>
                    ) : news.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900">No News Yet</h3>
                            <p className="text-gray-500 mb-6">Start by creating your first announcement.</p>
                            <button
                                onClick={() => { resetForm(); setIsEditing(true); }}
                                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md hover:shadow-orange-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 group"
                            >
                                <span className="flex items-center gap-2">
                                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                                    Create Article
                                </span>
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {news.map((item) => (
                                <div key={item.id} className="bg-white rounded-2xl border border-gray-200 p-6 transition-all hover:shadow-md hover:border-orange-200 group">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getCategoryColor(item.category)}`}>
                                                    {item.category}
                                                </span>
                                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(item.publishDate).toLocaleDateString()}
                                                </span>
                                                {item.source && (
                                                    <span className="text-sm text-gray-400 flex items-center gap-1 border-l pl-3 border-gray-300">
                                                        <Share2 className="w-3.5 h-3.5" />
                                                        {item.source}
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-700 transition-colors">
                                                {item.title}
                                            </h3>

                                            <p className="text-gray-600 line-clamp-2 mb-4">
                                                {item.content}
                                            </p>

                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                <span>Posted by {item.author?.fullName || 'Admin'}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="group p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md border border-blue-100"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="group p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md border border-red-100"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

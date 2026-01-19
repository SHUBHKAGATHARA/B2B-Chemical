'use client';

import { useState, useEffect } from 'react';
import { FileText, Calendar, Plus, Save, Trash2, Edit2, X, Share2, Search, ExternalLink } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'react-hot-toast';

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
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        category: 'General',
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
            // toast.error('Failed to load news');
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
                // toast.success('News updated successfully');
            } else {
                await apiClient.createNews(payload);
                // toast.success('News created successfully');
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
            // toast.success('News deleted successfully');
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
            category: 'General',
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
        <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">News & Announcements</h2>
                    <p className="text-gray-600 mt-1 text-sm sm:text-base">Keep your distributors informed with the latest updates</p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => { resetForm(); setIsEditing(true); }}
                        className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2 justify-center"
                    >
                        <Plus className="w-5 h-5" />
                        Add News
                    </button>
                )}
            </div>

            {/* Editor View */}
            {isEditing ? (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-slideInRight">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            {editingItem ? <Edit2 className="w-5 h-5 text-blue-600" /> : <Plus className="w-5 h-5 text-green-600" />}
                            {editingItem ? 'Edit Article' : 'Create New Article'}
                        </h3>
                        <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Title */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Article Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none font-medium"
                                    placeholder="Enter a catchy title..."
                                    required
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
                                >
                                    <option value="General">General</option>
                                    <option value="Industry Update">Industry Update</option>
                                    <option value="Product Launch">Product Launch</option>
                                    <option value="Company News">Company News</option>
                                    <option value="Regulatory">Regulatory</option>
                                </select>
                            </div>

                            {/* Publish Date */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Publish Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="date"
                                        value={formData.publishDate}
                                        onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            {/* Source */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Source / Reference (Optional)</label>
                                <div className="relative">
                                    <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        value={formData.source}
                                        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
                                        placeholder="e.g. Industry Magazine, External Link..."
                                    />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Content <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none min-h-[200px]"
                                    placeholder="Write the full article content here..."
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="w-full sm:w-auto px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors order-2 sm:order-1"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="w-full sm:w-auto px-8 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2 justify-center order-1 sm:order-2"
                            >
                                <Save className="w-5 h-5" />
                                {editingItem ? 'Update Article' : 'Publish Article'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                /* News Grid View */
                <>
                    {/* Search/Filter Bar (Placeholder for future) */}
                    {/* <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex gap-4"> ... </div> */}

                    {loading ? (
                        <div className="text-center py-20">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
                            <p className="text-gray-500">Loading latest news...</p>
                        </div>
                    ) : news.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900">No News Yet</h3>
                            <p className="text-gray-500 mb-6">Start by creating your first announcement.</p>
                            <button
                                onClick={() => { resetForm(); setIsEditing(true); }}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                            >
                                Create Article
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {news.map((item) => (
                                <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md hover:border-green-200 group">
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

                                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
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
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import {
    FileText, Calendar, Plus, Save, Trash2, Edit2, X, ExternalLink,
    ChevronRight, Newspaper, Clock, TrendingUp, Eye, ArrowUpRight,
    Sparkles, Tag, Upload, ImageIcon, CheckCircle2, AlertCircle,
    Loader2, XCircle,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { authStorage } from '@/lib/auth-storage';

interface NewsItem {
    id: string;
    title: string;
    content: string;
    category: string;
    publishDate: string;
    source?: string;
    imageUrl?: string;
    author?: { fullName: string };
}

// ── Image Upload Widget ──────────────────────────────────────
type UploadState = 'idle' | 'uploading' | 'success' | 'error';

function ImageUploader({
    value,
    onChange,
}: {
    value: string;
    onChange: (url: string) => void;
}) {
    const [uploadState, setUploadState] = useState<UploadState>('idle');
    const [dragOver, setDragOver] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [preview, setPreview] = useState(value);
    const [previewError, setPreviewError] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync preview with external value (e.g. when editing an existing article)
    useEffect(() => {
        setPreview(value);
        setPreviewError(false);
        if (value) setUploadState('idle');
    }, [value]);

    const uploadFile = async (file: File) => {
        // Client-side validation
        if (!file.type.startsWith('image/')) {
            setUploadError('Only image files are allowed (JPEG, PNG, GIF, WebP).');
            setUploadState('error');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setUploadError('Image must be smaller than 5 MB.');
            setUploadState('error');
            return;
        }

        setUploadState('uploading');
        setUploadError('');
        setUploadProgress(0);

        // Show local preview immediately while uploading
        const localUrl = URL.createObjectURL(file);
        setPreview(localUrl);

        // Animate progress (fake — real XHR progress would require XMLHttpRequest)
        const timer = setInterval(() => {
            setUploadProgress((p) => Math.min(p + 10, 85));
        }, 150);

        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('folder', 'news-images');

            const res = await fetch('/api/upload', { method: 'POST', body: fd });
            const json = await res.json();

            clearInterval(timer);

            if (!res.ok || !json.data?.url) {
                throw new Error(json.error?.message || 'Upload failed');
            }

            setUploadProgress(100);
            setUploadState('success');
            setPreview(json.data.url);
            onChange(json.data.url);
        } catch (err: unknown) {
            clearInterval(timer);
            URL.revokeObjectURL(localUrl);
            setPreview(value); // revert to previous
            setUploadState('error');
            setUploadError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
        }
    };

    const handleFiles = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        uploadFile(files[0]);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
    };

    const clearImage = () => {
        setPreview('');
        setUploadState('idle');
        setUploadError('');
        setUploadProgress(0);
        setPreviewError(false);
        onChange('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
                Featured Image <span className="font-normal text-gray-400">(Optional)</span>
            </label>

            {/* Drop zone — shown when no image */}
            {!preview && (
                <div
                    role="button"
                    tabIndex={0}
                    aria-label="Upload image"
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                    className={`
                        relative flex flex-col items-center justify-center gap-3
                        border-2 border-dashed rounded-xl p-8 cursor-pointer
                        transition-all duration-200 select-none
                        ${dragOver
                            ? 'border-teal-400 bg-teal-50 scale-[1.01]'
                            : uploadState === 'error'
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-300 bg-gray-50 hover:border-teal-400 hover:bg-teal-50'
                        }
                    `}
                >
                    {uploadState === 'uploading' ? (
                        <>
                            <Loader2 className="w-10 h-10 text-teal-400 animate-spin" />
                            <p className="text-sm font-semibold text-teal-600">Uploading…</p>
                            {/* Progress bar */}
                            <div className="w-full max-w-xs bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full transition-all duration-200"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-400">{uploadProgress}%</p>
                        </>
                    ) : (
                        <>
                            <div className={`p-4 rounded-2xl ${dragOver ? 'bg-teal-100' : 'bg-white'} shadow-sm border border-gray-200 transition-colors`}>
                                <ImageIcon className={`w-8 h-8 ${dragOver ? 'text-teal-500' : 'text-gray-400'} transition-colors`} />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold text-gray-700">
                                    Drop image here, or{' '}
                                    <span className="text-teal-600 underline underline-offset-2">browse</span>
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    JPEG, PNG, GIF, WebP — max 5 MB
                                </p>
                            </div>
                        </>
                    )}

                    {uploadState === 'error' && (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs font-medium">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {uploadError}
                        </div>
                    )}
                </div>
            )}

            {/* Preview — shown when image is selected / uploaded */}
            {preview && (
                <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group">
                    {/* Image */}
                    {!previewError ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-48 object-cover"
                            onError={() => setPreviewError(true)}
                        />
                    ) : (
                        <div className="w-full h-48 flex flex-col items-center justify-center gap-2 bg-gray-100">
                            <XCircle className="w-8 h-8 text-gray-400" />
                            <p className="text-xs text-gray-500">Image failed to load</p>
                        </div>
                    )}

                    {/* Upload-success badge */}
                    {uploadState === 'success' && (
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Uploaded
                        </div>
                    )}

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-1.5 px-3 py-2 bg-white text-gray-900 rounded-lg font-semibold text-xs hover:bg-gray-100 transition-colors shadow"
                        >
                            <Upload className="w-3.5 h-3.5" />
                            Replace
                        </button>
                        <button
                            type="button"
                            onClick={clearImage}
                            className="flex items-center gap-1.5 px-3 py-2 bg-red-500 text-white rounded-lg font-semibold text-xs hover:bg-red-600 transition-colors shadow"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remove
                        </button>
                    </div>
                </div>
            )}

            {/* URL fallback input */}
            <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium px-2">or paste URL</span>
                <div className="flex-1 h-px bg-gray-200" />
            </div>
            <input
                type="url"
                value={preview.startsWith('blob:') ? '' : preview}
                onChange={(e) => {
                    const url = e.target.value;
                    setPreview(url);
                    setPreviewError(false);
                    onChange(url);
                    if (url) setUploadState('idle');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none text-sm text-gray-600 placeholder:text-gray-400"
                placeholder="https://example.com/image.jpg"
            />

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
            />
        </div>
    );
}

// ── Main Page ────────────────────────────────────────────────
export default function NewsManagementPage() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [expandedNews, setExpandedNews] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        category: 'General Announcement',
        publishDate: new Date().toISOString().split('T')[0],
        content: '',
        source: '',
        imageUrl: '',
    });

    useEffect(() => {
        const user = authStorage.getUser();
        if (user && user.role === 'ADMIN') setIsAdmin(true);
        loadNews();
    }, []);

    const loadNews = async () => {
        try {
            setLoading(true);
            const response = await apiClient.getNews({ limit: '50' });
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
        setSaving(true);
        try {
            const payload = {
                ...formData,
                imageUrl: formData.imageUrl || undefined,
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
        } catch (error: unknown) {
            console.error('Failed to save news:', error);
            alert('Failed to save news: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this news article?')) return;
        try {
            await apiClient.deleteNews(id);
            loadNews();
        } catch {
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
            imageUrl: item.imageUrl || '',
        });
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setFormData({
            title: '',
            category: 'General Announcement',
            publishDate: new Date().toISOString().split('T')[0],
            content: '',
            source: '',
            imageUrl: '',
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

    const getReadingTime = (content: string) =>
        Math.max(1, Math.ceil(content.split(/\s+/).length / 200));

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
                            <span className="text-gray-900 font-medium">Management</span>
                        </>
                    )}
                </div>
            </div>

            {/* Header */}
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-300/20 via-cyan-300/20 to-emerald-300/20 rounded-3xl blur-3xl" />
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
                        className="group px-8 py-4 bg-gradient-to-r from-teal-400 via-cyan-500 to-teal-500 text-white rounded-2xl font-bold hover:from-teal-500 hover:via-cyan-600 hover:to-teal-600 transition-all duration-300 shadow-xl shadow-teal-200 hover:shadow-2xl hover:shadow-teal-300 hover:-translate-y-1 active:translate-y-0 flex items-center gap-3"
                    >
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        </div>
                        <span className="text-lg">Create New Article</span>
                        <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                    </button>
                </div>
            )}

            {/* ── Editor (Admin only) ── */}
            {isEditing && isAdmin ? (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-teal-100 rounded-xl">
                                <FileText className="w-5 h-5 text-teal-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingItem ? 'Edit Article' : 'Create New Article'}
                            </h3>
                        </div>
                        <button
                            onClick={() => { setIsEditing(false); resetForm(); }}
                            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                            aria-label="Close editor"
                        >
                            <X className="w-5 h-5" />
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none text-gray-900 placeholder:text-gray-400"
                                placeholder="Enter a catchy headline for your news…"
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
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none text-gray-900"
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
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    <Calendar className="inline w-4 h-4 mr-1 text-gray-400" />
                                    Publish Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.publishDate}
                                    onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none text-gray-900"
                                />
                            </div>
                        </div>

                        {/* Source */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Source / Reference <span className="font-normal text-gray-400">(Optional)</span>
                            </label>
                            <input
                                type="text"
                                value={formData.source}
                                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none text-gray-900 placeholder:text-gray-400"
                                placeholder="e.g. Reuters, BBC, Chemical Week…"
                            />
                        </div>

                        {/* ── Image Uploader ── */}
                        <ImageUploader
                            value={formData.imageUrl}
                            onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
                        />

                        {/* Content */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Content <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none min-h-[220px] resize-y text-gray-900 placeholder:text-gray-400 leading-relaxed"
                                placeholder="Write your news content here. Each paragraph on a new line."
                                required
                            />
                            <p className="mt-1.5 text-xs text-gray-400">
                                {formData.content.split(/\s+/).filter(Boolean).length} words ·{' '}
                                ~{Math.max(1, Math.ceil(formData.content.split(/\s+/).filter(Boolean).length / 200))} min read
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => { setIsEditing(false); resetForm(); }}
                                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-400 to-cyan-500 text-white rounded-xl font-semibold hover:from-teal-500 hover:to-cyan-600 transition-all duration-300 shadow-md hover:shadow-teal-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 justify-center disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                            >
                                {saving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5" />
                                )}
                                {saving ? 'Saving…' : editingItem ? 'Update Article' : 'Publish Article'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                /* ── News List ── */
                <>
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400 mb-4" />
                            <p className="text-gray-500">Loading latest news…</p>
                        </div>
                    ) : news.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                            <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900">No News Yet</h3>
                            <p className="text-gray-500 mb-6">
                                {isAdmin ? 'Start by creating your first announcement.' : 'No news have been posted yet.'}
                            </p>
                            {isAdmin && (
                                <button
                                    onClick={() => { resetForm(); setIsEditing(true); }}
                                    className="px-6 py-3 bg-gradient-to-r from-teal-400 to-cyan-500 text-white rounded-xl font-semibold hover:from-teal-500 hover:to-cyan-600 transition-all duration-300 shadow-md inline-flex items-center gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    Create Article
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {news.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="group relative bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-transparent hover:-translate-y-2"
                                >
                                    {/* Article image thumbnail */}
                                    {item.imageUrl && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <div className="h-40 overflow-hidden border-b border-gray-100">
                                            <img
                                                src={item.imageUrl}
                                                alt={item.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => { (e.currentTarget.parentElement!.style.display = 'none'); }}
                                            />
                                        </div>
                                    )}

                                    {/* Gradient header accent */}
                                    <div className={`h-1.5 bg-gradient-to-r ${getGradientBackground(index)}`} />
                                    <div className={`absolute ${item.imageUrl ? '' : 'top-0'} left-0 right-0 h-24 bg-gradient-to-b ${getGradientBackground(index)} opacity-40`} />

                                    <div className="relative p-6">
                                        {/* Category */}
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

                                        {/* Excerpt / expanded */}
                                        <div className="mb-4">
                                            {expandedNews === item.id ? (
                                                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed text-sm">{item.content}</p>
                                            ) : (
                                                <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">{item.content}</p>
                                            )}
                                        </div>

                                        {/* View Details */}
                                        <button
                                            onClick={() => setExpandedNews(expandedNews === item.id ? null : item.id)}
                                            className="w-full px-4 py-2.5 bg-gradient-to-r from-teal-400 to-cyan-500 text-white rounded-lg font-semibold hover:from-teal-500 hover:to-cyan-600 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-sm"
                                        >
                                            <Eye className="w-4 h-4" />
                                            {expandedNews === item.id ? 'Hide Details' : 'View Details'}
                                        </button>

                                        {/* Meta */}
                                        <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                                            <div className="flex flex-col gap-1.5 text-xs text-gray-500">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(item.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {getReadingTime(item.content)} min read
                                                </span>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                                {(item.author?.fullName || 'A').charAt(0)}
                                            </div>
                                        </div>

                                        {/* Admin actions */}
                                        {isAdmin && (
                                            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                                                <a
                                                    href={`/news/${item.id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 border border-blue-100 flex items-center justify-center gap-1.5 text-sm font-semibold"
                                                    title="View public article"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    View
                                                </a>
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="flex-1 p-2 bg-teal-50 text-teal-600 hover:bg-teal-100 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 border border-teal-100 flex items-center justify-center gap-1.5 text-sm font-semibold"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="flex-1 p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 border border-red-100 flex items-center justify-center gap-1.5 text-sm font-semibold"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-teal-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

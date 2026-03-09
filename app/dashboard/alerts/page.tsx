'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash, AlertCircle, Calendar, ChevronRight, Upload, X, Image as ImageIcon } from 'lucide-react';
import { authStorage } from '@/lib/auth-storage';

interface Alert {
    id: string;
    alertId: string;
    title: string;
    message: string;
    imageUrl?: string | null;
    buttonText?: string | null;
    buttonAction?: string | null;
    status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
    startDate: string;
    endDate?: string | null;
    createdAt: string;
}

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
    });

    useEffect(() => {
        loadAlerts();
    }, []);

    const loadAlerts = async () => {
        try {
            const token = authStorage.getToken();
            const response = await fetch('/api/alerts', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                cache: 'no-store',
            });
            const data = await response.json();
            if (data.success) {
                setAlerts(data.data);
            }
        } catch (error) {
            console.error('Failed to load alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.message.trim()) {
            alert('Title and message are required');
            return;
        }

        setUploading(true);
        try {
            const token = authStorage.getToken();
            let imageUrl = editingAlert?.imageUrl || null;

            // Upload image if a new file is selected
            if (imageFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', imageFile);
                uploadFormData.append('folder', 'alert-images');

                const uploadResponse = await fetch('/api/upload', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: uploadFormData,
                    cache: 'no-store',
                });

                const uploadData = await uploadResponse.json();
                if (uploadData.success) {
                    imageUrl = uploadData.url;
                } else {
                    throw new Error(uploadData.error?.message || 'Image upload failed');
                }
            }

            const url = editingAlert ? `/api/alerts/${editingAlert.id}` : '/api/alerts';
            const method = editingAlert ? 'PUT' : 'POST';

            const payload = {
                title: formData.title.trim(),
                message: formData.message.trim(),
                imageUrl: imageUrl,
                status: 'ACTIVE',
                startDate: formData.startDate,
                endDate: formData.endDate || null,
            };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
                cache: 'no-store',
            });

            const data = await response.json();
            if (data.success) {
                loadAlerts();
                resetForm();
                setShowModal(false);
            } else {
                alert(data.error?.message || 'Operation failed');
            }
        } catch (error: any) {
            alert(error.message || 'Operation failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this alert?')) {
            return;
        }

        try {
            const token = authStorage.getToken();
            const response = await fetch(`/api/alerts/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                cache: 'no-store',
            });

            const data = await response.json();
            if (data.success) {
                loadAlerts();
            } else {
                alert(data.error?.message || 'Delete failed');
            }
        } catch (error: any) {
            alert(error.message || 'Delete failed');
        }
    };

    const handleEdit = (alert: Alert) => {
        setEditingAlert(alert);
        setFormData({
            title: alert.title,
            message: alert.message,
            startDate: alert.startDate.split('T')[0],
            endDate: alert.endDate ? alert.endDate.split('T')[0] : '',
        });
        setImagePreview(alert.imageUrl || '');
        setImageFile(null);
        setShowModal(true);
    };

    const resetForm = () => {
        setEditingAlert(null);
        setFormData({
            title: '',
            message: '',
            startDate: new Date().toISOString().split('T')[0],
            endDate: '',
        });
        setImageFile(null);
        setImagePreview('');
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                alert('Please select a valid image file');
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview('');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-100 text-green-800';
            case 'INACTIVE':
                return 'bg-gray-100 text-gray-800';
            case 'EXPIRED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Dashboard</span>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-gray-900 font-medium">Alerts Management</span>
                </div>
            </div>

            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Alerts Management</h1>
                    <p className="text-gray-600">
                        Create and manage system-wide alerts for all users
                    </p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Create Alert
                </button>
            </div>

            {/* Alerts List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                        <p className="text-gray-500 mt-4">Loading alerts...</p>
                    </div>
                ) : alerts.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-semibold mb-2">No alerts yet</p>
                        <p className="text-sm">Create your first alert to notify users</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {alerts.map((alert) => (
                            <div key={alert.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                            <AlertCircle className="w-6 h-6 text-orange-600" />
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                    {alert.title}
                                                </h3>
                                                <p className="text-gray-600 text-sm line-clamp-2">
                                                    {alert.message}
                                                </p>
                                            </div>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                                                {alert.status}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>
                                                    {new Date(alert.startDate).toLocaleDateString()}
                                                    {alert.endDate && ` - ${new Date(alert.endDate).toLocaleDateString()}`}
                                                </span>
                                            </div>
                                            <span className="text-gray-400">•</span>
                                            <span>ID: {alert.alertId}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEdit(alert)}
                                                className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(alert.id)}
                                                className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                                            >
                                                <Trash className="w-4 h-4" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
                            <h3 className="text-lg font-bold">
                                {editingAlert ? 'Edit Alert' : 'Create New Alert'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                                className="p-1 hover:bg-white/10 rounded transition-colors"
                            >
                                <Plus className="w-5 h-5 rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                    placeholder="Alert title"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Message <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none"
                                    placeholder="Alert message"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Alert Image (Optional)
                                </label>
                                
                                {!imagePreview ? (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                            id="alert-image-upload"
                                        />
                                        <label htmlFor="alert-image-upload" className="cursor-pointer">
                                            <div className="flex flex-col items-center">
                                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                                                    <ImageIcon className="w-8 h-8 text-orange-500" />
                                                </div>
                                                <p className="text-sm text-gray-600 mb-1">Click to upload image</p>
                                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                                            </div>
                                        </label>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <img
                                            src={imagePreview}
                                            alt="Alert preview"
                                            className="w-full h-48 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        End Date (Optional)
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-xl font-semibold transition-colors"
                                    disabled={uploading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {uploading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            {imageFile ? 'Uploading...' : 'Saving...'}
                                        </>
                                    ) : (
                                        <>{editingAlert ? 'Update Alert' : 'Create Alert'}</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

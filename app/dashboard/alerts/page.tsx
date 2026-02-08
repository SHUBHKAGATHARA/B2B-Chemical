'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Plus, Edit, Trash, Calendar, Image as ImageIcon, AlertCircle, CheckCircle, XCircle, Upload, X } from 'lucide-react';
import { authStorage } from '@/lib/auth-storage';

interface Alert {
    id: string;
    alertId: string;
    title: string;
    message: string;
    imageUrl: string | null;
    buttonText: string | null;
    buttonAction: string | null;
    status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
    startDate: string;
    endDate: string | null;
    createdAt: string;
}

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        imageUrl: '',
        status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
    });

    useEffect(() => {
        const user = authStorage.getUser();
        if (user && user.role === 'ADMIN') {
            setIsAdmin(true);
            loadAlerts();
        }
    }, []);

    const loadAlerts = async () => {
        try {
            const response = await fetch('/api/alerts');

            // Check if response is ok before trying to parse
            if (!response.ok) {
                console.error('Failed to fetch alerts:', response.status, response.statusText);
                setLoading(false);
                return;
            }

            // Check if response has content
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.error('Response is not JSON:', contentType);
                setLoading(false);
                return;
            }

            const text = await response.text();
            if (!text) {
                console.error('Empty response body');
                setLoading(false);
                return;
            }

            const data = JSON.parse(text);
            if (data.success) {
                setAlerts(data.data.alerts || []);
            }
        } catch (error) {
            console.error('Failed to load alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (file: File) => {
        setUploadingImage(true);
        try {
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            uploadFormData.append('folder', 'alerts');

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: uploadFormData,
            });

            const data = await response.json();

            if (data.success && data.data.url) {
                setFormData({ ...formData, imageUrl: data.data.url });
                setImagePreview(data.data.url);
            } else {
                alert('Failed to upload image');
                setImageFile(null);
            }
        } catch (error) {
            alert('Failed to upload image');
            setImageFile(null);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }
            setImageFile(file);
            handleImageUpload(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview('');
        setFormData({ ...formData, imageUrl: '' });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Client-side validation
        if (formData.title.trim().length < 3) {
            alert('Title must be at least 3 characters long');
            return;
        }
        if (formData.title.trim().length > 200) {
            alert('Title must be less than 200 characters');
            return;
        }
        if (formData.message.trim().length < 10) {
            alert('Message must be at least 10 characters long');
            return;
        }

        try {
            const url = editingAlert ? `/api/alerts/${editingAlert.id}` : '/api/alerts';
            const method = editingAlert ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            // Check if response is ok before trying to parse
            if (!response.ok) {
                console.error('Failed to save alert:', response.status, response.statusText);
                alert(`Failed to save alert: ${response.statusText}`);
                return;
            }

            // Check if response has content
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.error('Response is not JSON:', contentType);
                alert('Server returned invalid response');
                return;
            }

            const text = await response.text();
            if (!text) {
                console.error('Empty response body');
                alert('Server returned empty response');
                return;
            }

            const data = JSON.parse(text);

            if (data.success) {
                alert('Alert saved successfully!');
                loadAlerts();
                closeModal();
            } else {
                // Display detailed error message
                const errorMsg = data.error?.message || 'Failed to save alert';
                console.error('[Alert Form] Error:', data);
                alert(errorMsg);
            }
        } catch (error: any) {
            console.error('Error saving alert:', error);
            alert('Failed to save alert: ' + error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this alert?')) return;

        try {
            const response = await fetch(`/api/alerts/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                loadAlerts();
            }
        } catch (error) {
            alert('Failed to delete alert');
        }
    };

    const openModal = (alert?: Alert) => {
        if (alert) {
            setEditingAlert(alert);
            setFormData({
                title: alert.title,
                message: alert.message,
                imageUrl: alert.imageUrl || '',
                status: alert.status === 'EXPIRED' ? 'INACTIVE' : alert.status,
                startDate: alert.startDate.split('T')[0],
                endDate: alert.endDate ? alert.endDate.split('T')[0] : '',
            });
            setImagePreview(alert.imageUrl || '');
        } else {
            setEditingAlert(null);
            setFormData({
                title: '',
                message: '',
                imageUrl: '',
                status: 'ACTIVE',
                startDate: new Date().toISOString().split('T')[0],
                endDate: '',
            });
            setImagePreview('');
        }
        setImageFile(null);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingAlert(null);
        setImageFile(null);
        setImagePreview('');
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            ACTIVE: 'bg-green-100 text-green-800',
            INACTIVE: 'bg-gray-100 text-gray-800',
            EXPIRED: 'bg-red-100 text-red-800',
        };
        const icons = {
            ACTIVE: <CheckCircle className="w-3 h-3" />,
            INACTIVE: <XCircle className="w-3 h-3" />,
            EXPIRED: <AlertCircle className="w-3 h-3" />,
        };
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
                {icons[status as keyof typeof icons]}
                {status}
            </span>
        );
    };

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600">Only administrators can manage alerts.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Alert Management</h1>
                        <p className="text-gray-600">
                            Create and manage alerts that will be shown to distributors when they open the mobile app
                        </p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Create Alert
                    </button>
                </div>
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
                        <Bell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium">No alerts created yet</p>
                        <p className="text-sm mt-2">Create your first alert to notify distributors</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    <th className="px-6 py-3">Alert</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Start Date</th>
                                    <th className="px-6 py-3">End Date</th>
                                    <th className="px-6 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {alerts.map((alert) => (
                                    <tr key={alert.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-3">
                                                {alert.imageUrl && (
                                                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <ImageIcon className="w-6 h-6 text-orange-600" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-900">{alert.title}</p>
                                                    <p className="text-sm text-gray-600 line-clamp-2">{alert.message}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(alert.status)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(alert.startDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {alert.endDate ? new Date(alert.endDate).toLocaleDateString() : 'No end date'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => openModal(alert)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(alert.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {editingAlert ? 'Edit Alert' : 'Create New Alert'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Alert Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                    placeholder="Enter alert title"
                                    required
                                />
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Message <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none"
                                    placeholder="Enter alert message"
                                    rows={4}
                                    required
                                />
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Alert Image (Optional)
                                </label>

                                {!imagePreview ? (
                                    <div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageSelect}
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploadingImage}
                                            className="w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all flex flex-col items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {uploadingImage ? (
                                                <>
                                                    <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                                    <span className="text-sm text-gray-600">Uploading...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-8 h-8 text-gray-400" />
                                                    <span className="text-sm text-gray-600">Click to upload image</span>
                                                    <span className="text-xs text-gray-500">PNG, JPG up to 5MB</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <img
                                            src={imagePreview}
                                            alt="Alert preview"
                                            className="w-full h-48 object-cover rounded-lg border border-gray-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                                <p className="mt-1 text-xs text-gray-500">Upload an image to display with the alert</p>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Start Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                    />
                                </div>
                            </div>



                            {/* Status */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md hover:shadow-lg"
                                >
                                    {editingAlert ? 'Update Alert' : 'Create Alert'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { Building2, Mail, Phone, MapPin, FileText, Upload, Save, Trash2, AlertCircle, CheckCircle, Image as ImageIcon } from 'lucide-react';

interface CompanySettings {
    id: string;
    companyName: string;
    distributorName: string | null;
    email: string;
    phone: string;
    address: string;
    taxRegistrationId: string | null;
    logoUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

export default function CompanySettingsPage() {
    const [settings, setSettings] = useState<CompanySettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        companyName: '',
        distributorName: '',
        email: '',
        phone: '',
        address: '',
        taxRegistrationId: '',
    });

    // Fetch existing settings
    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/company-settings');

            if (response.status === 404) {
                // No settings exist yet
                setSettings(null);
                setLoading(false);
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to fetch company settings');
            }

            const data = await response.json();
            setSettings(data.data);
            setFormData({
                companyName: data.data.companyName || '',
                distributorName: data.data.distributorName || '',
                email: data.data.email || '',
                phone: data.data.phone || '',
                address: data.data.address || '',
                taxRegistrationId: data.data.taxRegistrationId || '',
            });
            setLogoPreview(data.data.logoUrl);
        } catch (err: any) {
            console.error('Fetch error:', err);
            setError(err.message || 'Failed to load company settings');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setError('Invalid file type. Only PNG, JPG, JPEG, and WEBP are allowed.');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setError('File size exceeds 5MB limit.');
            return;
        }

        setLogoFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setLogoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.companyName || !formData.email || !formData.phone || !formData.address) {
            setError('Please fill in all required fields');
            return;
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return;
        }

        try {
            setSaving(true);
            setError(null);
            setSuccess(null);

            const formDataToSend = new FormData();
            formDataToSend.append('companyName', formData.companyName);
            formDataToSend.append('distributorName', formData.distributorName);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('phone', formData.phone);
            formDataToSend.append('address', formData.address);
            formDataToSend.append('taxRegistrationId', formData.taxRegistrationId);

            if (logoFile) {
                formDataToSend.append('logo', logoFile);
            }

            const response = await fetch('/api/company-settings', {
                method: 'POST',
                body: formDataToSend,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to save company settings');
            }

            setSuccess('Company settings saved successfully!');
            setSettings(data.data);
            setLogoFile(null);

            // Refresh settings
            await fetchSettings();
        } catch (err: any) {
            console.error('Save error:', err);
            setError(err.message || 'Failed to save company settings');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!settings) return;

        if (!confirm('Are you sure you want to delete company settings? This action cannot be undone.')) {
            return;
        }

        try {
            setSaving(true);
            setError(null);
            setSuccess(null);

            const response = await fetch(`/api/company-settings?id=${settings.id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete company settings');
            }

            setSuccess('Company settings deleted successfully!');
            setSettings(null);
            setFormData({
                companyName: '',
                distributorName: '',
                email: '',
                phone: '',
                address: '',
                taxRegistrationId: '',
            });
            setLogoPreview(null);
        } catch (err: any) {
            console.error('Delete error:', err);
            setError(err.message || 'Failed to delete company settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Settings</h1>
                <p className="text-gray-600">Manage your company information and branding</p>
            </div>

            {/* Alerts */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-semibold text-red-900 mb-1">Error</h3>
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                </div>
            )}

            {success && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-semibold text-green-900 mb-1">Success</h3>
                        <p className="text-sm text-green-700">{success}</p>
                    </div>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 space-y-6">
                    {/* Logo Upload */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                            Company Logo
                        </label>
                        <div className="flex items-start gap-6">
                            {/* Logo Preview */}
                            <div className="flex-shrink-0">
                                <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                                    {logoPreview ? (
                                        <img
                                            src={logoPreview}
                                            alt="Company Logo"
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <ImageIcon className="w-12 h-12 text-gray-400" />
                                    )}
                                </div>
                            </div>

                            {/* Upload Button */}
                            <div className="flex-1">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png,image/jpg,image/jpeg,image/webp"
                                    onChange={handleLogoChange}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <Upload className="w-4 h-4" />
                                    Upload Logo
                                </button>
                                <p className="mt-2 text-xs text-gray-500">
                                    PNG, JPG, JPEG, or WEBP. Max 5MB.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Company Name */}
                    <div>
                        <label htmlFor="companyName" className="block text-sm font-semibold text-gray-900 mb-2">
                            Company Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                id="companyName"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleInputChange}
                                required
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                placeholder="Enter company name"
                            />
                        </div>
                    </div>

                    {/* Distributor Name */}
                    <div>
                        <label htmlFor="distributorName" className="block text-sm font-semibold text-gray-900 mb-2">
                            Distributor Name
                        </label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                id="distributorName"
                                name="distributorName"
                                value={formData.distributorName}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                placeholder="Enter distributor name (optional)"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                placeholder="company@example.com"
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div>
                        <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label htmlFor="address" className="block text-sm font-semibold text-gray-900 mb-2">
                            Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <textarea
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                required
                                rows={3}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                                placeholder="Enter company address"
                            />
                        </div>
                    </div>

                    {/* Tax/Registration ID */}
                    <div>
                        <label htmlFor="taxRegistrationId" className="block text-sm font-semibold text-gray-900 mb-2">
                            Tax / Registration ID
                        </label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                id="taxRegistrationId"
                                name="taxRegistrationId"
                                value={formData.taxRegistrationId}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                placeholder="Enter tax or registration ID (optional)"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl flex items-center justify-between">
                    <div>
                        {settings && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={saving}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Settings
                            </button>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Settings
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Last Updated Info */}
            {settings && (
                <div className="mt-4 text-sm text-gray-500 text-center">
                    Last updated: {new Date(settings.updatedAt).toLocaleString()}
                </div>
            )}
        </div>
    );
}

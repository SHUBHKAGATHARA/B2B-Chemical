'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { Building, Globe, Phone, Upload, Save, Edit3 } from 'lucide-react';

export default function CompanySettingsPage() {
    const [showEditModal, setShowEditModal] = useState(false);
    const [companyData, setCompanyData] = useState({
        name: 'Spentica Chemicals Inc.',
        address: '4821 Innovation Drive, Tech Valley, CA 94043',
        phone: '+1 (555) 123-4567',
        website: 'https://spentica.com',
        logo: null as File | null,
    });
    const [formData, setFormData] = useState({ ...companyData });
    const [errors, setErrors] = useState<any>({});

    const handleSave = () => {
        const newErrors: any = {};
        if (!formData.name.trim()) newErrors.name = 'Company name is required';
        if (formData.phone && !/^\+?[\d\s\-()]+$/.test(formData.phone)) {
            newErrors.phone = 'Invalid phone number format';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setCompanyData({ ...formData });
        setShowEditModal(false);
        setErrors({});
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, logo: e.target.files[0] });
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-gray-900">Company Settings</h2>
                <p className="text-gray-600 mt-1">Manage your organization's profile and preferences</p>
            </div>

            {/* Company Name Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Company Name</h3>
                        <p className="text-sm text-gray-600 mt-1">Official registered name of the organization</p>
                    </div>
                    <button
                        onClick={() => setShowEditModal(true)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                        <Edit3 className="w-5 h-5" />
                    </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 font-medium">{companyData.name}</p>
                </div>
            </div>

            {/* Logo Upload Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Logo Upload</h3>
                        <p className="text-sm text-gray-600 mt-1">Manage your company branding assets</p>
                    </div>
                    <div className="p-2 bg-green-50 rounded-lg">
                        <Upload className="w-5 h-5 text-green-600" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Current Logo */}
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                        <div className="w-20 h-20 mx-auto mb-3 bg-green-100 rounded-lg flex items-center justify-center">
                            <Building className="w-10 h-10 text-green-600" />
                        </div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Current Logo</p>
                    </div>

                    {/* Upload New */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors cursor-pointer">
                        <input
                            type="file"
                            id="logo-upload"
                            accept=".svg,.png,.jpg,.jpeg"
                            onChange={handleLogoChange}
                            className="hidden"
                        />
                        <label htmlFor="logo-upload" className="cursor-pointer">
                            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                            <p className="text-sm font-medium text-gray-700 mb-1">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-500">SVG, PNG, JPG (max. 800x400px)</p>
                        </label>
                        <button className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                            Browse Files
                        </button>
                    </div>
                </div>
            </div>

            {/* Contact Info Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Contact Info</h3>
                        <p className="text-sm text-gray-600 mt-1">Public contact details for your portal</p>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <Phone className="w-5 h-5 text-blue-600" />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="border-l-4 border-gray-300 pl-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Office Address</p>
                        <p className="text-gray-900 flex items-center gap-2">
                            <Building className="w-4 h-4 text-gray-400" />
                            {companyData.address}
                        </p>
                    </div>

                    <div className="border-l-4 border-gray-300 pl-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Phone Number</p>
                        <p className="text-gray-900 flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {companyData.phone}
                        </p>
                    </div>

                    <div className="border-l-4 border-gray-300 pl-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Website</p>
                        <p className="text-gray-900 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-gray-400" />
                            {companyData.website}
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-slideInRight">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Edit3 className="w-5 h-5 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Edit Company Details</h3>
                            </div>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Company Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Company Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => {
                                            setFormData({ ...formData, name: e.target.value });
                                            setErrors({ ...errors, name: '' });
                                        }}
                                        className={`w-full pl-11 pr-4 py-3 border-2 ${errors.name ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none`}
                                        placeholder="Enter company name"
                                    />
                                </div>
                                {errors.name && (
                                    <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        {errors.name}
                                    </div>
                                )}
                            </div>

                            {/* Office Address */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Office Address</label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
                                        placeholder="Enter office address"
                                    />
                                </div>
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => {
                                            setFormData({ ...formData, phone: e.target.value });
                                            setErrors({ ...errors, phone: '' });
                                        }}
                                        className={`w-full pl-11 pr-4 py-3 border-2 ${errors.phone ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none`}
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>
                                {errors.phone && (
                                    <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        {errors.phone}
                                    </div>
                                )}
                            </div>

                            {/* Website */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Website</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="url"
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
                                        placeholder="https://spentica.com"
                                    />
                                </div>
                            </div>

                            {/* Verification Badge */}
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                                <div className="p-1.5 bg-blue-600 rounded-full flex-shrink-0">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-blue-900">Verified Organization</p>
                                    <p className="text-xs text-blue-700 mt-1">This company profile has been verified and is active on the platform.</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

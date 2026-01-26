'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Building2, Mail, Key, X, ChevronRight, Eye } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function DistributorsPage() {
    const [distributors, setDistributors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDistributor, setEditingDistributor] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        companyName: '',
        email: '',
        password: '',
        status: 'ACTIVE',
    });

    useEffect(() => {
        loadDistributors();
    }, []);

    const loadDistributors = async () => {
        try {
            const response = await apiClient.getDistributors();
            setDistributors(response.data || []);
        } catch (error) {
            console.error('Failed to load distributors');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingDistributor) {
                await apiClient.updateDistributor(editingDistributor.id, formData);
            } else {
                await apiClient.createDistributor(formData);
            }
            setShowModal(false);
            resetForm();
            loadDistributors();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this distributor?')) return;
        try {
            await apiClient.deleteDistributor(id);
            loadDistributors();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleEdit = (distributor: any) => {
        setEditingDistributor(distributor);
        setFormData({
            companyName: distributor.companyName,
            email: distributor.email,
            password: '',
            status: distributor.status,
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            companyName: '',
            email: '',
            password: '',
            status: 'ACTIVE',
        });
        setEditingDistributor(null);
    };

    const filteredDistributors = distributors.filter(dist =>
        dist.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dist.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Dashboard</span>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-gray-900 font-medium">Distributors</span>
                </div>
            </div>

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Distributors</h1>
                <p className="text-gray-600">
                    Manage your distribution network and partner organizations.
                </p>
            </div>

            {/* Search and Add */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by company name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        />
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md hover:shadow-orange-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 justify-center group"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        Add Distributor
                    </button>
                </div>
            </div>

            {/* Distributors Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">ALL DISTRIBUTORS</h3>
                </div>

                {loading ? (
                    <div className="p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                        <p className="text-gray-500 mt-4">Loading distributors...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Company</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredDistributors.map((dist) => (
                                    <tr key={dist.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center">
                                                    <span className="text-white font-semibold text-sm">
                                                        {getInitials(dist.companyName)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{dist.companyName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600">{dist.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${dist.status === 'ACTIVE'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${dist.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                                                {dist.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(dist.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(dist)}
                                                    className="group p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md border border-blue-100"
                                                    title="Edit Distributor"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(dist.id)}
                                                    className="group p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md border border-red-100"
                                                    title="Delete Distributor"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredDistributors.length === 0 && (
                            <div className="p-12 text-center">
                                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500">No distributors found</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between rounded-t-2xl">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingDistributor ? 'Edit Distributor' : 'Add New Distributor'}
                            </h3>
                            <button
                                onClick={() => { setShowModal(false); resetForm(); }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Company Logo Preview */}
                            <div className="flex justify-center mb-4">
                                <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-2xl">
                                        {formData.companyName ? getInitials(formData.companyName) : 'CO'}
                                    </span>
                                </div>
                            </div>

                            {/* Company Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Company Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                        placeholder="Enter company name"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                        placeholder="company@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Password {editingDistributor && '(leave blank to keep current)'}
                                </label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                        placeholder="••••••••••••••••"
                                        required={!editingDistributor}
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                                <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="status"
                                            value="ACTIVE"
                                            checked={formData.status === 'ACTIVE'}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-4 h-4 text-green-500 focus:ring-green-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Active</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="status"
                                            value="INACTIVE"
                                            checked={formData.status === 'INACTIVE'}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-4 h-4 text-gray-500 focus:ring-gray-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Inactive</span>
                                    </label>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); resetForm(); }}
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg"
                                >
                                    {editingDistributor ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

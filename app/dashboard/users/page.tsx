'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, User, Mail, Key, Shield, Eye, X, ChevronRight, Calendar, Clock } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [viewingUser, setViewingUser] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        role: 'DISTRIBUTOR',
        status: 'ACTIVE',
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await apiClient.getUsers();
            setUsers(response.data || []);
        } catch (error) {
            console.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await apiClient.updateUser(editingUser.id, formData);
            } else {
                await apiClient.createUser(formData);
            }
            setShowModal(false);
            resetForm();
            loadUsers();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await apiClient.deleteUser(id);
            loadUsers();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleEdit = (user: any) => {
        setEditingUser(user);
        setFormData({
            fullName: user.fullName,
            email: user.email,
            password: '',
            role: user.role,
            status: user.status,
        });
        setShowModal(true);
    };

    const handleView = (user: any) => {
        setViewingUser(user);
        setShowViewModal(true);
    };

    const resetForm = () => {
        setFormData({
            fullName: '',
            email: '',
            password: '',
            role: 'DISTRIBUTOR',
            status: 'ACTIVE',
        });
        setEditingUser(null);
    };

    const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <span className="text-gray-900 font-medium">User Management</span>
                </div>
            </div>

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
                <p className="text-gray-600">
                    Manage system users, roles, and permissions across your organization.
                </p>
            </div>

            {/* Search and Add */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
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
                        Add New User
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">ALL USERS</h3>
                </div>

                {loading ? (
                    <div className="p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                        <p className="text-gray-500 mt-4">Loading users...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center">
                                                    <span className="text-white font-semibold text-sm">
                                                        {getInitials(user.fullName)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{user.fullName}</p>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-4 h-4 text-gray-400" />
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'ADMIN'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {user.role === 'ADMIN' ? 'Administrator' : 'Distributor'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'ACTIVE'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                                                {user.status === 'ACTIVE' ? 'Active User' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleView(user)}
                                                    className="group p-2 bg-teal-50 text-teal-600 hover:bg-teal-100 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md border border-teal-100"
                                                    title="View Profile"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="group p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md border border-blue-100"
                                                    title="Edit User"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="group p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md border border-red-100"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && (
                            <div className="p-12 text-center">
                                <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500">No users found</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Edit/Add User Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between rounded-t-2xl">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingUser ? 'Edit User Profile' : 'Add New User'}
                            </h3>
                            <button
                                onClick={() => { setShowModal(false); resetForm(); }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Avatar Preview */}
                            <div className="flex justify-center mb-4">
                                <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-2xl">
                                        {formData.fullName ? getInitials(formData.fullName) : 'AJ'}
                                    </span>
                                </div>
                            </div>

                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                        placeholder="Alice Johnson"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email ID <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                        placeholder="alice@spenticachemicals.com"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Role */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                >
                                    <option value="ADMIN">Administrator</option>
                                    <option value="DISTRIBUTOR">Distributor</option>
                                </select>
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
                                        <span className="text-sm font-medium text-gray-700">Active User</span>
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

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Password {editingUser && '(leave blank to keep current)'}
                                </label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                        placeholder="••••••••••••••••"
                                        required={!editingUser}
                                    />
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
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View User Profile Modal */}
            {showViewModal && viewingUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">User Profile Details</h3>
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Avatar and Name */}
                            <div className="text-center mb-6">
                                <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-white font-bold text-3xl">
                                        {getInitials(viewingUser.fullName)}
                                    </span>
                                </div>
                                <h4 className="text-xl font-bold text-gray-900">{viewingUser.fullName}</h4>
                                <p className="text-gray-600 mt-1">{viewingUser.email}</p>
                                <div className="flex items-center justify-center gap-2 mt-3">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${viewingUser.role === 'ADMIN'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        <Shield className="w-3 h-3" />
                                        {viewingUser.role === 'ADMIN' ? 'Administrator' : 'Distributor'}
                                    </span>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${viewingUser.status === 'ACTIVE'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${viewingUser.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                                        {viewingUser.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>

                            {/* Account Info */}
                            <div className="border-t border-gray-200 pt-4">
                                <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">ACCOUNT INFO</h5>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Registration Date</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {new Date(viewingUser.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Last Login</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {viewingUser.lastLogin ? new Date(viewingUser.lastLogin).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Just now'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => {
                                        setShowViewModal(false);
                                        handleEdit(viewingUser);
                                    }}
                                    className="flex-1 px-4 py-2.5 border border-orange-500 text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Edit className="w-4 h-4" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => setShowViewModal(false)}
                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-md"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

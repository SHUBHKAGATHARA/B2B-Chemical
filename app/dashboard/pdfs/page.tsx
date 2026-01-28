'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { Upload, Download, FileText, Search, Filter, X, ChevronRight, Building2, Users, Trash } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { authStorage } from '@/lib/auth-storage';

export default function PdfsPage() {
    const [pdfs, setPdfs] = useState<any[]>([]);
    const [distributors, setDistributors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [file, setFile] = useState<File | null>(null);
    const [distributorType, setDistributorType] = useState<'ALL' | 'SINGLE' | 'MULTIPLE'>('ALL');
    const [selectedDistributors, setSelectedDistributors] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const user = authStorage.getUser();
        if (user && user.role === 'ADMIN') {
            setIsAdmin(true);
        }
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Check user role
            const user = authStorage.getUser();
            const isAdminUser = user && user.role === 'ADMIN';
            
            // Distributors don't need the distributors list
            if (isAdminUser) {
                const [pdfsData, distsData] = await Promise.all([
                    apiClient.getPdfs(),
                    apiClient.getDistributors(),
                ]);
                setPdfs(pdfsData.data || []);
                setDistributors(distsData.data || []);
            } else {
                // Distributors only need PDFs
                const pdfsData = await apiClient.getPdfs();
                setPdfs(pdfsData.data || []);
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.FormEvent | React.MouseEvent) => {
        e.preventDefault();
        if (!file) return;

        // Validation
        if (distributorType !== 'ALL' && selectedDistributors.length === 0) {
            alert('Please select at least one distributor');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('assignedGroup', distributorType);
            if (distributorType !== 'ALL') {
                formData.append('distributorIds', JSON.stringify(selectedDistributors));
            }

            await apiClient.uploadPdf(formData);
            resetForm();
            loadData();
        } catch (error: any) {
            alert(error.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const resetForm = () => {
        setFile(null);
        setDistributorType('ALL');
        setSelectedDistributors([]);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === 'application/pdf') {
                setFile(droppedFile);
            } else {
                alert('Please upload only PDF files');
            }
        }
    };

    const filteredPdfs = pdfs.filter(pdf =>
        pdf.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pdf.uploadedBy?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this PDF? This action cannot be undone.')) {
            return;
        }

        try {
            await apiClient.deletePdf(id);
            setPdfs(pdfs.filter(p => p.id !== id));
            setSelectedIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        } catch (error: any) {
            alert(error.message || 'Failed to delete PDF');
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const toggleAll = () => {
        const allFilteredSelected = filteredPdfs.length > 0 && filteredPdfs.every(p => selectedIds.has(p.id));

        if (allFilteredSelected) {
            const newSet = new Set(selectedIds);
            filteredPdfs.forEach(p => newSet.delete(p.id));
            setSelectedIds(newSet);
        } else {
            const newSet = new Set(selectedIds);
            filteredPdfs.forEach(p => newSet.add(p.id));
            setSelectedIds(newSet);
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedIds.size} PDFs? This action cannot be undone.`)) {
            return;
        }

        try {
            await Promise.all(Array.from(selectedIds).map(id => apiClient.deletePdf(id)));
            setPdfs(pdfs.filter(p => !selectedIds.has(p.id)));
            setSelectedIds(new Set());
        } catch (error: any) {
            alert(error.message || 'Failed to delete some PDFs');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{isAdmin ? 'Transfers' : 'Content'}</span>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-gray-900 font-medium">{isAdmin ? 'PDF Transfer' : 'My PDFs'}</span>
                </div>
            </div>

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{isAdmin ? 'PDF Transfer' : 'My PDFs'}</h1>
                <p className="text-gray-600">
                    {isAdmin 
                        ? 'Securely upload and manage your chemical data reports. Ensure all PDF files are compliant with the 2026 safety standards before submission.'
                        : 'View and download PDF documents shared with you.'
                    }
                </p>
            </div>

            {/* Upload Area - Admin Only */}
            {isAdmin && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
                {!file ? (
                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${dragActive
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-300 hover:border-orange-400 hover:bg-gray-50'
                            }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            onChange={(e) => {
                                const selectedFile = e.target.files?.[0];
                                if (selectedFile) {
                                    setFile(selectedFile);
                                }
                            }}
                            className="hidden"
                        />

                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                                <Upload className="w-8 h-8 text-orange-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload New Documents</h3>
                            <p className="text-gray-600 mb-4">
                                Drag & drop your PDF here or click to browse files.
                            </p>
                            <p className="text-sm text-gray-500 mb-6">Supports PDF format up to 25MB.</p>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md hover:shadow-orange-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 group"
                            >
                                <Upload className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                                Browse Files
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-6 transition-all animate-in fade-in slide-in-from-top-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <FileText className="w-8 h-8 text-red-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-lg font-semibold text-gray-900 truncate">{file.name}</p>
                                <p className="text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                            </div>
                            <button
                                onClick={() => setFile(null)}
                                className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                Remove File
                            </button>
                        </div>
                    </div>
                )}

                {/* Distributor Settings Form */}
                <div className="mt-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Distributor Type Dropdown */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Select Distributor Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={distributorType}
                                onChange={(e: any) => {
                                    setDistributorType(e.target.value);
                                    setSelectedDistributors([]);
                                }}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                            >
                                <option value="ALL">All Distributors</option>
                                <option value="SINGLE">Single Distributor</option>
                                <option value="MULTIPLE">Multiple Distributors</option>
                            </select>
                            <p className="mt-1 text-xs text-gray-500">Choose how to assign this PDF to distributors</p>
                        </div>

                        {/* Particular Distributor Selection */}
                        {distributorType !== 'ALL' && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Select Particular Distributor{distributorType === 'MULTIPLE' ? 's' : ''} <span className="text-red-500">*</span>
                                </label>
                                <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto bg-white">
                                    {distributors.length === 0 ? (
                                        <div className="p-8 text-center text-gray-500">
                                            <Building2 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                            <p>No distributors available</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-200">
                                            {distributors.map((dist) => (
                                                <label
                                                    key={dist.id}
                                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                                                >
                                                    <input
                                                        type={distributorType === 'SINGLE' ? 'radio' : 'checkbox'}
                                                        name="distributor"
                                                        checked={selectedDistributors.includes(dist.id)}
                                                        onChange={() => {
                                                            if (distributorType === 'SINGLE') {
                                                                setSelectedDistributors([dist.id]);
                                                            } else {
                                                                setSelectedDistributors(prev =>
                                                                    prev.includes(dist.id)
                                                                        ? prev.filter(id => id !== dist.id)
                                                                        : [...prev, dist.id]
                                                                );
                                                            }
                                                        }}
                                                        className="w-4 h-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-gray-900 truncate">{dist.companyName}</p>
                                                        <p className="text-xs text-gray-500 truncate">{dist.email}</p>
                                                    </div>
                                                    {selectedDistributors.includes(dist.id) && (
                                                        <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                                                    )}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {selectedDistributors.length > 0 && (
                                    <p className="mt-2 text-sm text-teal-600 font-medium">
                                        {selectedDistributors.length} distributor{selectedDistributors.length > 1 ? 's' : ''} selected
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button
                            onClick={handleUpload}
                            disabled={uploading || !file}
                            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md hover:shadow-orange-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 group"
                        >
                            {uploading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    Submit
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            )}

            {/* Recent Transfers / My PDFs */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <h3 className="text-lg font-bold text-gray-900">{isAdmin ? 'RECENT TRANSFERS' : 'MY DOCUMENTS'}</h3>
                        {selectedIds.size > 0 && isAdmin && (
                            <button
                                onClick={handleBulkDelete}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors animate-in fade-in"
                            >
                                <Trash className="w-4 h-4" />
                                Delete ({selectedIds.size})
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search transfers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none w-full md:w-64"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                        <p className="text-gray-500 mt-4">Loading transfers...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    {isAdmin && (
                                        <th className="px-6 py-3 w-4">
                                            <input
                                                type="checkbox"
                                                checked={filteredPdfs.length > 0 && filteredPdfs.every(p => selectedIds.has(p.id))}
                                                onChange={toggleAll}
                                                className="w-4 h-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded cursor-pointer"
                                            />
                                        </th>
                                    )}
                                    <th className="px-6 py-3">Document</th>
                                    <th className="px-6 py-3">Uploaded By</th>
                                    <th className="px-6 py-3">Assignment</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredPdfs.map((pdf) => (
                                    <tr key={pdf.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.has(pdf.id) ? 'bg-orange-50/30' : ''}`}>
                                        {isAdmin && (
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(pdf.id)}
                                                    onChange={() => toggleSelection(pdf.id)}
                                                    className="w-4 h-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded cursor-pointer"
                                                />
                                            </td>
                                        )}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                                    <FileText className="w-5 h-5 text-red-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{pdf.fileName}</p>
                                                    <p className="text-sm text-gray-500">{(pdf.fileSize / 1024).toFixed(2)} KB</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900">{pdf.uploadedBy?.fullName || 'Unknown'}</span>
                                                <span className="text-xs text-gray-500">{pdf.uploadedBy?.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {pdf.assignedGroup === 'ALL' ? 'All Distributors' :
                                                    pdf.assignedGroup === 'SINGLE' ? pdf.distributor?.companyName || 'Single' :
                                                        'Multiple'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${pdf.status === 'ACTIVE'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {pdf.status === 'ACTIVE' ? 'Active' : pdf.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(pdf.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center">
                                                <a
                                                    href={apiClient.getPdfDownloadUrl(pdf.id)}
                                                    download
                                                    className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                                    title="Download"
                                                >
                                                    <Download className="w-5 h-5" />
                                                </a>
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => handleDelete(pdf.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2"
                                                        title="Delete"
                                                    >
                                                        <Trash className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredPdfs.length === 0 && (
                            <div className="p-12 text-center text-gray-500">
                                No transfers found matching your search.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

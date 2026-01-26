'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { Upload, Download, FileText, Search, Filter, X, ChevronRight, Building2, Users } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function PdfsPage() {
    const [pdfs, setPdfs] = useState<any[]>([]);
    const [distributors, setDistributors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [distributorType, setDistributorType] = useState<'ALL' | 'SINGLE' | 'MULTIPLE'>('ALL');
    const [selectedDistributors, setSelectedDistributors] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [pdfsData, distsData] = await Promise.all([
                apiClient.getPdfs(),
                apiClient.getDistributors(),
            ]);
            setPdfs(pdfsData.data || []);
            setDistributors(distsData.data || []);
        } catch (error) {
            console.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
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
            setShowModal(false);
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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Transfers</span>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-gray-900 font-medium">PDF Transfer</span>
                </div>
            </div>

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">PDF Transfer</h1>
                <p className="text-gray-600">
                    Securely upload and manage your chemical data reports. Ensure all PDF files are compliant with the 2026 safety standards before submission.
                </p>
            </div>

            {/* Upload Area */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
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
                                setShowModal(true);
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

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">FILTER BY DATE</label>
                        <input
                            type="date"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CATEGORY</label>
                        <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none">
                            <option>Financial Reports</option>
                            <option>Safety Protocols</option>
                            <option>Chemical Analysis</option>
                            <option>Compliance Documents</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">STATUS</label>
                        <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none">
                            <option>Ready for Review</option>
                            <option>Approved</option>
                            <option>Pending</option>
                            <option>Rejected</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end mt-4">
                    <button className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md hover:shadow-orange-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 group">
                        Submit
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                </div>
            </div>

            {/* Recent Transfers */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">RECENT TRANSFERS</h3>
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
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Document</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Uploaded By</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assignment</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredPdfs.map((pdf) => (
                                    <tr key={pdf.id} className="hover:bg-gray-50 transition-colors">
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
                                            <p className="text-sm font-medium text-gray-900">{pdf.uploadedBy?.fullName || 'Unknown'}</p>
                                            <p className="text-xs text-gray-500">{pdf.uploadedBy?.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                                                {pdf.assignedGroup === 'ALL' ? 'All Distributors' :
                                                    pdf.assignedGroup === 'SINGLE' ? `${pdf.distributor?.companyName || 'N/A'}` :
                                                        'Multiple'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${pdf.status === 'ACTIVE'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {pdf.status === 'ACTIVE' ? 'DONE' : pdf.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(pdf.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center">
                                                <a
                                                    href={apiClient.getPdfDownloadUrl(pdf.id)}
                                                    download
                                                    className="group flex items-center gap-2 px-3 py-2 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md border border-teal-100 font-medium text-xs"
                                                    title="Download PDF"
                                                >
                                                    <Download className="w-4 h-4 group-hover:animate-bounce-subtle" />
                                                    Download
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredPdfs.length === 0 && (
                            <div className="p-12 text-center">
                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500">No transfers found</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between rounded-t-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <Upload className="w-5 h-5 text-orange-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Upload PDF Document</h3>
                            </div>
                            <button
                                onClick={() => { setShowModal(false); resetForm(); }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleUpload} className="p-6 space-y-6">
                            {/* File Display */}
                            {file && (
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <FileText className="w-6 h-6 text-red-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">{file.name}</p>
                                            <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFile(null)}
                                            className="text-red-600 hover:text-red-700 font-medium text-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            )}

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
                                    <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
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
                                                        className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
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
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-900">{dist.companyName}</p>
                                                            <p className="text-sm text-gray-500">{dist.email}</p>
                                                        </div>
                                                        {selectedDistributors.includes(dist.id) && (
                                                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
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

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); resetForm(); }}
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading || !file}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md hover:shadow-orange-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                                >
                                    {uploading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                                            Upload PDF
                                        </>
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

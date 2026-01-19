'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Upload, Download, FileText, Calendar, Filter, X, CheckCircle, Clock } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { getStatusColor } from '@/lib/utils';

export default function PdfsPage() {
    const [pdfs, setPdfs] = useState<any[]>([]);
    const [distributors, setDistributors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [assignType, setAssignType] = useState<'SINGLE' | 'MULTIPLE' | 'ALL'>('ALL');
    const [selectedDistributors, setSelectedDistributors] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
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

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('assignedGroup', assignType);
            if (assignType !== 'ALL') {
                formData.append('distributorIds', JSON.stringify(selectedDistributors));
            }

            await apiClient.uploadPdf(formData);
            setShowModal(false);
            resetForm();
            loadData();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setUploading(false);
        }
    };

    const resetForm = () => {
        setFile(null);
        setAssignType('ALL');
        setSelectedDistributors([]);
    };

    const toggleDistributor = (id: string) => {
        setSelectedDistributors((prev) =>
            prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
        );
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">PDF Management</h2>
                    <p className="text-gray-600 mt-1">Upload and distribute PDF documents to distributors</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2 justify-center"
                >
                    <Upload className="w-4 h-4" />
                    Upload PDF
                </button>
            </div>

            {/* Upload Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total PDFs</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{pdfs.length}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active Uploads</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{pdfs.filter(p => p.status === 'ACTIVE').length}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">This Month</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {pdfs.filter(p => new Date(p.createdAt).getMonth() === new Date().getMonth()).length}
                            </p>
                        </div>
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <Clock className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* PDFs Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Recent Uploads</h3>
                </div>
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <p className="text-gray-500 mt-4">Loading PDFs...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">File</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Uploaded By</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assignment</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {pdfs.map((pdf) => (
                                    <tr key={pdf.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                                    <FileText className="w-5 h-5 text-red-600" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{pdf.fileName}</p>
                                                    <p className="text-sm text-gray-500">{(pdf.fileSize / 1024).toFixed(2)} KB</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-gray-900">{pdf.uploadedBy?.fullName || 'Unknown'}</p>
                                            <p className="text-xs text-gray-500">{pdf.uploadedBy?.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                                {pdf.assignedGroup === 'ALL' ? 'All Distributors' :
                                                    pdf.assignedGroup === 'SINGLE' ? `${pdf.distributor?.companyName || 'N/A'}` :
                                                        'Multiple'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                                pdf.status === 'ACTIVE' 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {pdf.status}
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
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Download PDF"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {pdfs.length === 0 && (
                            <div className="p-12 text-center">
                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500">No PDFs uploaded yet</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-slideInRight">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Upload className="w-5 h-5 text-green-600" />
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
                            {/* Drag & Drop Area */}
                            <div
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                                    dragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400'
                                }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    className="hidden"
                                />
                                {file ? (
                                    <div className="space-y-3">
                                        <div className="w-16 h-16 bg-red-100 rounded-lg mx-auto flex items-center justify-center">
                                            <FileText className="w-8 h-8 text-red-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{file.name}</p>
                                            <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFile(null)}
                                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                                        >
                                            Remove file
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 mb-1">
                                                Drag and drop your PDF here, or{' '}
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="text-green-600 hover:text-green-700 font-semibold"
                                                >
                                                    browse
                                                </button>
                                            </p>
                                            <p className="text-xs text-gray-500">PDF files only, max 10MB</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Assignment Type */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Assignment Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={assignType}
                                    onChange={(e: any) => setAssignType(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
                                >
                                    <option value="ALL">All Distributors</option>
                                    <option value="SINGLE">Single Distributor</option>
                                    <option value="MULTIPLE">Multiple Distributors</option>
                                </select>
                            </div>

                            {/* Distributor Selection */}
                            {assignType !== 'ALL' && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Select Distributors
                                    </label>
                                    <div className="border-2 border-gray-200 rounded-xl p-4 max-h-48 overflow-y-auto space-y-2">
                                        {distributors.map((dist) => (
                                            <label key={dist.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                                                <input
                                                    type={assignType === 'SINGLE' ? 'radio' : 'checkbox'}
                                                    name="distributor"
                                                    checked={selectedDistributors.includes(dist.id)}
                                                    onChange={() => {
                                                        if (assignType === 'SINGLE') {
                                                            setSelectedDistributors([dist.id]);
                                                        } else {
                                                            toggleDistributor(dist.id);
                                                        }
                                                    }}
                                                    className="w-4 h-4 text-green-600"
                                                />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">{dist.companyName}</p>
                                                    <p className="text-xs text-gray-500">{dist.email}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); resetForm(); }}
                                    className="flex-1 px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading || !file}
                                    className="flex-1 px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {uploading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4" />
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

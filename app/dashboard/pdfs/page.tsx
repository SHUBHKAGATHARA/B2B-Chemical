'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, Download, FileText, Search, Filter, X, ChevronRight, Building2, Users, Trash } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { authStorage } from '@/lib/auth-storage';

export default function PdfsPage() {
    const [pdfs, setPdfs] = useState<any[]>([]);
    const [distributors, setDistributors] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [distributorType, setDistributorType] = useState<'ALL' | 'SINGLE' | 'MULTIPLE'>('ALL');
    const [selectedDistributors, setSelectedDistributors] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('');
    const [filterDistributor, setFilterDistributor] = useState<string>('');
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

    // Debug: Log categories whenever they change
    useEffect(() => {
        console.log('[PDF Page] Categories state updated:', categories.length, 'categories');
        console.log('[PDF Page] Categories loading:', categoriesLoading);
        if (categories.length > 0) {
            console.log('[PDF Page] First 3 categories:', categories.slice(0, 3).map(c => c.name));
            console.log('[PDF Page] Sample category IDs:', categories.slice(0, 3).map(c => ({ id: c.id, name: c.name })));
        }
    }, [categories, categoriesLoading]);

    // Debug: Log filter changes
    useEffect(() => {
        if (filterCategory) {
            console.log('[PDF Filter] Category filter changed to:', filterCategory);
            console.log('[PDF Filter] Total PDFs:', pdfs.length);
            console.log('[PDF Filter] Available categories:', categories.length);
        }
    }, [filterCategory]);

    const loadData = async () => {
        try {
            // Check user role
            const user = authStorage.getUser();
            const isAdminUser = user && user.role === 'ADMIN';
            
            // Distributors don't need the distributors list
            if (isAdminUser) {
                const [pdfsData, distsData, categoriesData] = await Promise.all([
                    apiClient.getPdfs(),
                    apiClient.getDistributors(),
                    loadCategories(),
                ]);
                setPdfs(pdfsData.data || []);
                setDistributors(distsData.data || []);
                setCategories(categoriesData || []);
                
                // Debug: Log PDF category information
                console.log('[PDF Page] Loaded', pdfsData.data?.length || 0, 'PDFs');
                if (pdfsData.data && pdfsData.data.length > 0) {
                    console.log('[PDF Page] Sample PDF categories:', pdfsData.data.slice(0, 3).map((p: any) => ({
                        fileName: p.fileName,
                        categoryId: p.categoryId,
                        categoryName: p.category?.name
                    })));
                }
            } else {
                // Distributors only need PDFs and categories
                const [pdfsData, categoriesData] = await Promise.all([
                    apiClient.getPdfs(),
                    loadCategories(),
                ]);
                setPdfs(pdfsData.data || []);
                setCategories(categoriesData || []);
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async (retryCount = 0): Promise<any[]> => {
        const maxRetries = 3;
        const retryDelay = 2000;

        console.log('[PDF Categories] Starting to load categories...');
        setCategoriesLoading(true);

        try {
            const categories = await apiClient.getPdfCategories();
            console.log('[PDF Categories] Loaded categories:', categories.length);
            if (categories.length > 0) {
                console.log('[PDF Categories] First 3 categories:', categories.slice(0, 3).map((c: any) => c.name));
            }
            return categories;
        } catch (error: any) {
            console.error('[PDF Categories] Error loading categories:', error);
            
            if (error.message?.includes('connect') && retryCount < maxRetries) {
                console.log('[PDF Categories] Retrying after error...', retryCount + 1);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                return loadCategories(retryCount + 1);
            } else {
                console.log('[PDF Categories] Failed to load, returning empty array');
                return [];
            }
        } finally {
            setCategoriesLoading(false);
            console.log('[PDF Categories] Loading complete');
        }
    };

    const handleUpload = async (e: React.FormEvent | React.MouseEvent) => {
        e.preventDefault();
        if (!file) return;

        // Validate category selection
        if (!selectedCategory) {
            alert('Please select a category for the PDF');
            return;
        }

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
            if (selectedCategory) {
                formData.append('categoryId', selectedCategory);
            }
            if (description.trim()) {
                formData.append('description', description.trim());
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
        setSelectedCategory('');
        setDescription('');
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

    const filteredPdfs = pdfs.filter(pdf => {
        // Search filter - enhanced to search in more fields
        const matchesSearch = searchTerm === '' ||
            pdf.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pdf.uploadedBy?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pdf.uploadedBy?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pdf.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pdf.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pdf.distributor?.companyName?.toLowerCase().includes(searchTerm.toLowerCase());

        // Category filter - handle both string and number comparison
        const matchesCategory = filterCategory === '' || 
            pdf.categoryId === filterCategory || 
            String(pdf.categoryId) === String(filterCategory);
        
        // Debug logging for category filter
        if (filterCategory && pdf.id) {
            console.log(`[Filter Debug] PDF: ${pdf.fileName}, CategoryId: ${pdf.categoryId} (${typeof pdf.categoryId}), FilterCategory: ${filterCategory} (${typeof filterCategory}), Matches: ${matchesCategory}`);
        }

        // Distributor filter (for admin view) - improved logic
        let matchesDistributor = true;
        if (isAdmin && filterDistributor) {
            if (pdf.assignedGroup === 'ALL') {
                // Always show 'ALL' assigned PDFs regardless of filter
                matchesDistributor = true;
            } else if (pdf.assignedGroup === 'SINGLE' || pdf.assignedGroup === 'MULTIPLE') {
                // For SINGLE or MULTIPLE, check if the filtered distributor matches
                matchesDistributor = pdf.distributor?.id === filterDistributor ||
                    String(pdf.distributor?.id) === String(filterDistributor);
            }
        }

        return matchesSearch && matchesCategory && matchesDistributor;
    });

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

                {/* Category and Description - Show only when file is selected */}
                {file && (
                    <div className="space-y-4 mb-6">
                        {/* Category Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Select Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                required
                                disabled={categoriesLoading}
                            >
                                <option value="">
                                    {categoriesLoading ? 'Loading categories...' : categories.length === 0 ? 'No categories available' : 'Choose a category for this PDF'}
                                </option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            {!categoriesLoading && categories.length > 0 && (
                                <p className="mt-1 text-xs text-gray-500">
                                    Categorize your PDF for better organization ({categories.length} categories available)
                                </p>
                            )}
                            {!categoriesLoading && categories.length === 0 && (
                                <p className="mt-1 text-xs text-red-500">
                                    No categories found. Please contact administrator to create categories.
                                </p>
                            )}
                        </div>

                        {/* Description (Optional) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Description <span className="text-gray-400 text-xs">(Optional)</span>
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                placeholder="Add any additional notes or description for this PDF..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Provide context or important details about this document
                            </p>
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
                            <div className="relative">
                                <select
                                    value={distributorType}
                                    onChange={(e: any) => {
                                        setDistributorType(e.target.value);
                                        setSelectedDistributors([]);
                                    }}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all appearance-none bg-white"
                                >
                                    <option value="ALL">📢 All Distributors</option>
                                    <option value="SINGLE">👤 Single Distributor</option>
                                    <option value="MULTIPLE">👥 Multiple Distributors</option>
                                </select>
                                <Building2 className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <svg
                                    className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                {distributorType === 'ALL' && '🌐 PDF will be available to all registered distributors'}
                                {distributorType === 'SINGLE' && '🎯 Select one specific distributor for this PDF'}
                                {distributorType === 'MULTIPLE' && '✨ Choose multiple distributors to receive this PDF'}
                            </p>
                        </div>

                        {/* Particular Distributor Selection */}
                        {distributorType !== 'ALL' && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Select Distributor{distributorType === 'MULTIPLE' ? 's' : ''} <span className="text-red-500">*</span>
                                </label>
                                {distributors.length === 0 ? (
                                    <div className="border border-gray-300 rounded-lg p-8 text-center text-gray-500">
                                        <Building2 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                        <p>No distributors available</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {/* Select All / Clear All for Multiple Selection */}
                                        {distributorType === 'MULTIPLE' && (
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedDistributors(distributors.map(d => d.id))}
                                                    className="flex-1 px-3 py-2 text-xs font-medium text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
                                                >
                                                    Select All ({distributors.length})
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedDistributors([])}
                                                    className="flex-1 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    Clear All
                                                </button>
                                            </div>
                                        )}
                                        
                                        <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto bg-white shadow-sm">
                                            {distributors.map((dist) => (
                                                <label
                                                    key={dist.id}
                                                    className={`flex items-center gap-3 p-3 cursor-pointer transition-all border-b border-gray-100 last:border-b-0 ${
                                                        selectedDistributors.includes(dist.id)
                                                            ? 'bg-orange-50 hover:bg-orange-100'
                                                            : 'hover:bg-gray-50'
                                                    }`}
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
                                                        className="w-4 h-4 text-orange-500 focus:ring-2 focus:ring-orange-500 border-gray-300 rounded transition-all"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`font-medium truncate ${
                                                            selectedDistributors.includes(dist.id) ? 'text-orange-900' : 'text-gray-900'
                                                        }`}>
                                                            {dist.companyName}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate">{dist.email}</p>
                                                    </div>
                                                    {selectedDistributors.includes(dist.id) && (
                                                        <div className="flex items-center gap-1">
                                                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                                                            <span className="text-xs text-orange-600 font-medium">Selected</span>
                                                        </div>
                                                    )}
                                                </label>
                                            ))}
                                        </div>
                                        {selectedDistributors.length > 0 && (
                                            <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                                                <p className="text-sm text-teal-700 font-medium flex items-center gap-2">
                                                    <Users className="w-4 h-4" />
                                                    {selectedDistributors.length} distributor{selectedDistributors.length > 1 ? 's' : ''} selected
                                                </p>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {selectedDistributors.map(id => {
                                                        const dist = distributors.find(d => d.id === id);
                                                        return dist ? (
                                                            <span
                                                                key={id}
                                                                className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-teal-300 rounded text-xs text-teal-700"
                                                            >
                                                                {dist.companyName}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setSelectedDistributors(prev => prev.filter(did => did !== id))}
                                                                    className="hover:text-red-600 transition-colors"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </span>
                                                        ) : null;
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
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
                        {filteredPdfs.length !== pdfs.length && (
                            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                {filteredPdfs.length} of {pdfs.length} {filteredPdfs.length === 1 ? 'document' : 'documents'}
                            </span>
                        )}
                        {(searchTerm || filterCategory || filterDistributor) && (
                            <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full flex items-center gap-1">
                                <Filter className="w-3 h-3" />
                                {[searchTerm, filterCategory, filterDistributor].filter(Boolean).length} filter{[searchTerm, filterCategory, filterDistributor].filter(Boolean).length > 1 ? 's' : ''} active
                            </span>
                        )}
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
                    <div className="flex flex-col md:flex-row gap-3">
                        {/* Search */}
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search documents..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none w-full md:w-56 transition-all"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Category Filter */}
                        <div className="relative">
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className={`pl-4 pr-10 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none w-full md:w-44 appearance-none transition-all bg-white ${
                                    filterCategory ? 'border-orange-500 bg-orange-50 font-medium text-orange-900' : 'border-gray-300'
                                }`}
                            >
                                <option value="">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            <Filter className={`w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none ${
                                filterCategory ? 'text-orange-500' : 'text-gray-400'
                            }`} />
                            {filterCategory && (
                                <button
                                    onClick={() => setFilterCategory('')}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors shadow-sm"
                                    title="Clear category filter"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>

                        {/* Distributor Filter (Admin Only) */}
                        {isAdmin && (
                            <div className="relative">
                                <select
                                    value={filterDistributor}
                                    onChange={(e) => setFilterDistributor(e.target.value)}
                                    className={`pl-4 pr-10 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none w-full md:w-48 appearance-none transition-all bg-white ${
                                        filterDistributor ? 'border-orange-500 bg-orange-50 font-medium text-orange-900' : 'border-gray-300'
                                    }`}
                                >
                                    <option value="">All Distributors</option>
                                    {distributors.map((dist) => (
                                        <option key={dist.id} value={dist.id}>
                                            {dist.companyName}
                                        </option>
                                    ))}
                                </select>
                                <Building2 className={`w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none ${
                                    filterDistributor ? 'text-orange-500' : 'text-gray-400'
                                }`} />
                                {filterDistributor && (
                                    <button
                                        onClick={() => setFilterDistributor('')}
                                        className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors shadow-sm"
                                        title="Clear distributor filter"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Clear Filters */}
                        {(searchTerm || filterCategory || filterDistributor) && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterCategory('');
                                    setFilterDistributor('');
                                }}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
                            >
                                <X className="w-4 h-4" />
                                Clear Filters
                            </button>
                        )}
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
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <p className="text-sm text-gray-500">{(pdf.fileSize / 1024).toFixed(2)} KB</p>
                                                        {pdf.category && (
                                                            <>
                                                                <span className="text-gray-300">•</span>
                                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                                                    {pdf.category.name}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
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
                            <div className="p-12 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                    <FileText className="w-8 h-8 text-gray-400" />
                                </div>
                                {pdfs.length === 0 ? (
                                    <>
                                        <p className="text-gray-700 font-medium mb-1">No documents found</p>
                                        <p className="text-sm text-gray-500">
                                            {isAdmin ? 'Upload your first PDF to get started' : 'No PDFs have been assigned to you yet'}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-gray-700 font-medium mb-1">No documents match your filters</p>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Try adjusting your search or filter criteria
                                        </p>
                                        <button
                                            onClick={() => {
                                                setSearchTerm('');
                                                setFilterCategory('');
                                                setFilterDistributor('');
                                            }}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                                        >
                                            <X className="w-4 h-4" />
                                            Clear All Filters
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

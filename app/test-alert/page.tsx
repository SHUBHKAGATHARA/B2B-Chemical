'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

/**
 * Alert Popup Test Page
 * Use this to test the alert popup with and without images
 */
export default function AlertPopupTestPage() {
    const [showPopup, setShowPopup] = useState(false);
    const [testImage, setTestImage] = useState('https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=400&fit=crop');
    const [useImage, setUseImage] = useState(true);
    const [imageError, setImageError] = useState(false);

    const testAlert = {
        title: 'Test Alert',
        message: 'This is a test alert to verify the popup system is working correctly with images.',
        imageUrl: useImage ? testImage : null,
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        console.error('[Test] Image failed to load:', e.currentTarget.src);
        setImageError(true);
    };

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        console.log('[Test] Image loaded successfully:', e.currentTarget.src);
        setImageError(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Alert Popup Test Page</h1>

                {/* Controls */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Test Controls</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={useImage}
                                    onChange={(e) => setUseImage(e.target.checked)}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm font-medium">Include Image</span>
                            </label>
                        </div>

                        {useImage && (
                            <div>
                                <label className="block text-sm font-medium mb-2">Image URL:</label>
                                <input
                                    type="text"
                                    value={testImage}
                                    onChange={(e) => setTestImage(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    placeholder="Enter image URL"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Try: https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=400&fit=crop
                                </p>
                            </div>
                        )}

                        <button
                            onClick={() => {
                                setImageError(false);
                                setShowPopup(true);
                                console.log('[Test] Opening popup with image:', useImage);
                            }}
                            className="px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors"
                        >
                            Show Test Popup
                        </button>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">Testing Instructions</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                        <li>Open browser console (F12) to see logs</li>
                        <li>Toggle "Include Image" checkbox to test with/without images</li>
                        <li>Click "Show Test Popup" button</li>
                        <li>Check if popup appears</li>
                        <li>Check console for any errors</li>
                        <li>Try different image URLs to test error handling</li>
                    </ol>
                </div>

                {/* Test Popup */}
                {showPopup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="w-6 h-6" />
                                    <h3 className="text-lg font-bold">Test Alert</h3>
                                </div>
                                <button
                                    onClick={() => setShowPopup(false)}
                                    className="p-1 hover:bg-white/10 rounded transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {testAlert.imageUrl && (
                                    <div className="mb-4 relative">
                                        {imageError ? (
                                            <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                                                <div className="text-center">
                                                    <p className="text-gray-500 text-sm font-medium">Image failed to load</p>
                                                    <p className="text-gray-400 text-xs mt-1">URL: {testAlert.imageUrl.substring(0, 50)}...</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <img
                                                src={testAlert.imageUrl}
                                                alt={testAlert.title}
                                                className="w-full h-48 object-cover rounded-lg"
                                                onError={handleImageError}
                                                onLoad={handleImageLoad}
                                                loading="eager"
                                            />
                                        )}
                                    </div>
                                )}

                                <h4 className="text-xl font-bold text-gray-900 mb-3">
                                    {testAlert.title}
                                </h4>

                                <p className="text-gray-600 leading-relaxed mb-6">
                                    {testAlert.message}
                                </p>

                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setShowPopup(false)}
                                        className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-bold hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                                    >
                                        ✓ Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

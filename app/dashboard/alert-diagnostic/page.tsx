'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function AlertDiagnosticPage() {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [seenAlerts, setSeenAlerts] = useState<string[]>([]);
    const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
    const [apiError, setApiError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDiagnostics();
    }, []);

    const loadDiagnostics = async () => {
        setLoading(true);
        setApiError(null);

        // Load from localStorage
        try {
            const seen = localStorage.getItem('seenAlertPopups');
            const dismissed = localStorage.getItem('dismissedAlerts');
            setSeenAlerts(seen ? JSON.parse(seen) : []);
            setDismissedAlerts(dismissed ? JSON.parse(dismissed) : []);
        } catch (error) {
            console.error('localStorage error:', error);
        }

        // Load from API
        try {
            const response = await fetch('/api/alerts/active');
            const data = await response.json();
            
            if (data.success && data.data) {
                setAlerts(data.data);
            } else {
                setApiError(data.error?.message || 'Failed to load alerts');
            }
        } catch (error: any) {
            setApiError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const clearSeenAlerts = () => {
        localStorage.removeItem('seenAlertPopups');
        setSeenAlerts([]);
        alert('Cleared seen alerts! Refresh the page to see popups again.');
    };

    const clearDismissedAlerts = () => {
        localStorage.removeItem('dismissedAlerts');
        setDismissedAlerts([]);
        alert('Cleared dismissed alerts! Refresh the page to see banners again.');
    };

    const clearAllAlertData = () => {
        localStorage.removeItem('seenAlertPopups');
        localStorage.removeItem('dismissedAlerts');
        setSeenAlerts([]);
        setDismissedAlerts([]);
        alert('Cleared all alert data! Refresh the page to see all alerts again.');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Alert System Diagnostics</h1>
                    <p className="text-gray-600">Debug why alerts aren't showing up</p>
                </div>

                {/* Actions */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={loadDiagnostics}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh Data
                        </button>
                        <button
                            onClick={clearSeenAlerts}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                            Clear Seen Popups
                        </button>
                        <button
                            onClick={clearDismissedAlerts}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                            Clear Dismissed Banners
                        </button>
                        <button
                            onClick={clearAllAlertData}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                            Clear All Alert Data
                        </button>
                    </div>
                </div>

                {/* API Status */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">API Status</h2>
                    {loading ? (
                        <div className="flex items-center gap-2 text-gray-600">
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                            Loading...
                        </div>
                    ) : apiError ? (
                        <div className="flex items-center gap-2 text-red-600">
                            <XCircle className="w-5 h-5" />
                            <span>Error: {apiError}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-5 h-5" />
                            <span>API working - {alerts.length} active alert(s) found</span>
                        </div>
                    )}
                </div>

                {/* Active Alerts */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Active Alerts from API</h2>
                    {alerts.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                            <p>No active alerts found</p>
                            <p className="text-sm mt-1">Create one from the Alerts Management page</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {alerts.map((alert, index) => {
                                const isSeen = seenAlerts.includes(alert.alertId);
                                const isDismissed = dismissedAlerts.includes(alert.alertId);
                                
                                return (
                                    <div
                                        key={alert.id}
                                        className={`border rounded-lg p-4 ${
                                            isSeen || isDismissed ? 'border-gray-300 bg-gray-50' : 'border-orange-300 bg-orange-50'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-bold text-gray-900">{alert.title}</h3>
                                                    {isSeen && (
                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                                                            Seen (Popup)
                                                        </span>
                                                    )}
                                                    {isDismissed && (
                                                        <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded">
                                                            Dismissed (Banner)
                                                        </span>
                                                    )}
                                                    {!isSeen && !isDismissed && (
                                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                                                            Will Show
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-gray-700 text-sm mb-3">{alert.message}</p>
                                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                                    <div>
                                                        <span className="font-medium">Alert ID:</span>{' '}
                                                        <code className="bg-gray-100 px-1 py-0.5 rounded">{alert.alertId}</code>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Status:</span> {alert.status}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Start:</span>{' '}
                                                        {new Date(alert.startDate).toLocaleDateString()}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">End:</span>{' '}
                                                        {alert.endDate ? new Date(alert.endDate).toLocaleDateString() : 'No end date'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* localStorage Data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Seen Popups (localStorage)</h2>
                        {seenAlerts.length === 0 ? (
                            <p className="text-gray-500 text-sm">No alerts marked as seen</p>
                        ) : (
                            <div className="space-y-2">
                                {seenAlerts.map((alertId, index) => (
                                    <div key={index} className="text-xs font-mono bg-gray-50 p-2 rounded">
                                        {alertId}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Dismissed Banners (localStorage)</h2>
                        {dismissedAlerts.length === 0 ? (
                            <p className="text-gray-500 text-sm">No alerts dismissed</p>
                        ) : (
                            <div className="space-y-2">
                                {dismissedAlerts.map((alertId, index) => (
                                    <div key={index} className="text-xs font-mono bg-gray-50 p-2 rounded">
                                        {alertId}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
                    <h3 className="font-bold text-blue-900 mb-2">How to Fix:</h3>
                    <ol className="list-decimal list-inside space-y-1 text-blue-800 text-sm">
                        <li>If alerts are marked as "Seen" or "Dismissed", click the clear buttons above</li>
                        <li>Refresh the dashboard page to see the popup/banner</li>
                        <li>Check that alerts have Status: ACTIVE and valid dates</li>
                        <li>If no active alerts, create one from Alerts Management</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}

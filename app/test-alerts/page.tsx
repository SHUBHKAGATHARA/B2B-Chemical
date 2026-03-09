'use client';

import { useEffect, useState } from 'react';

export default function TestAlertsPage() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAlerts();
    }, []);

    const loadAlerts = async () => {
        try {
            const response = await fetch('/api/alerts/active', {
                cache: 'no-store',
            });
            const data = await response.json();
            console.log('API Response:', data);
            setAlerts(data.data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const clearLocalStorage = () => {
        localStorage.removeItem('seenAlertPopups');
        localStorage.removeItem('dismissedAlerts');
        alert('Cleared! Reload to see alerts.');
        window.location.reload();
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Alert System Test</h1>
            
            <div className="mb-6 space-x-4">
                <button
                    onClick={clearLocalStorage}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                    Clear LocalStorage & Reload
                </button>
                <button
                    onClick={loadAlerts}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Refresh Alerts
                </button>
            </div>

            <div className="mb-6 bg-gray-100 p-4 rounded">
                <h2 className="font-bold mb-2">LocalStorage Status:</h2>
                <p>Seen Popups: {localStorage.getItem('seenAlertPopups') || 'None'}</p>
                <p>Dismissed Banners: {localStorage.getItem('dismissedAlerts') || 'None'}</p>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div>
                    <h2 className="text-xl font-bold mb-4">Active Alerts ({alerts.length}):</h2>
                    {alerts.length === 0 ? (
                        <p className="text-gray-500">No active alerts found</p>
                    ) : (
                        <div className="space-y-4">
                            {alerts.map((alert: any) => (
                                <div key={alert.id} className="bg-white border border-gray-300 p-4 rounded">
                                    <h3 className="font-bold">{alert.title}</h3>
                                    <p className="text-sm text-gray-600">{alert.message}</p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        Alert ID: {alert.alertId} | Status: {alert.status}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

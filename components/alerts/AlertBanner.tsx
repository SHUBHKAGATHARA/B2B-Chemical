'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Alert {
    id: string;
    alertId: string;
    title: string;
    message: string;
    imageUrl: string | null;
    buttonText: string | null;
    buttonAction: string | null;
    startDate: string;
    endDate: string | null;
    createdAt: string;
}

export default function AlertBanner() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [currentAlertIndex, setCurrentAlertIndex] = useState(0);
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAlerts();
        // Load dismissed alerts from localStorage
        const dismissedStr = localStorage.getItem('dismissedAlerts');
        if (dismissedStr) {
            try {
                setDismissed(new Set(JSON.parse(dismissedStr)));
            } catch (e) {
                console.error('Failed to parse dismissed alerts:', e);
            }
        }
    }, []);

    const loadAlerts = async () => {
        try {
            const response = await fetch('/api/alerts/active');

            // Check if response is ok before trying to parse
            if (!response.ok) {
                console.error('Failed to fetch active alerts:', response.status, response.statusText);
                setLoading(false);
                return;
            }

            // Check if response has content
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.error('Response is not JSON:', contentType);
                setLoading(false);
                return;
            }

            const text = await response.text();
            if (!text) {
                console.error('Empty response body');
                setLoading(false);
                return;
            }

            const data = JSON.parse(text);
            if (data.success && data.data.alerts) {
                setAlerts(data.data.alerts);
            }
        } catch (error) {
            console.error('Failed to load alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const dismissAlert = (alertId: string) => {
        const newDismissed = new Set(dismissed);
        newDismissed.add(alertId);
        setDismissed(newDismissed);
        localStorage.setItem('dismissedAlerts', JSON.stringify(Array.from(newDismissed)));

        // Move to next alert if available
        if (currentAlertIndex < activeAlerts.length - 1) {
            setCurrentAlertIndex(currentAlertIndex + 1);
        }
    };

    // Filter out dismissed alerts
    const activeAlerts = alerts.filter(alert => !dismissed.has(alert.alertId));

    // Don't render if loading or no active alerts
    if (loading || activeAlerts.length === 0) {
        return null;
    }

    const currentAlert = activeAlerts[currentAlertIndex];

    if (!currentAlert) {
        return null;
    }

    return (
        <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg overflow-hidden">
                <div className="relative">
                    {/* Close Button */}
                    <button
                        onClick={() => dismissAlert(currentAlert.alertId)}
                        className="absolute top-4 right-4 z-10 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm"
                        title="Dismiss"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>

                    <div className="flex flex-col md:flex-row">
                        {/* Image Section */}
                        {currentAlert.imageUrl && (
                            <div className="md:w-1/3 lg:w-1/4">
                                <img
                                    src={currentAlert.imageUrl}
                                    alt={currentAlert.title}
                                    className="w-full h-48 md:h-full object-cover"
                                />
                            </div>
                        )}

                        {/* Content Section */}
                        <div className={`flex-1 p-6 ${currentAlert.imageUrl ? '' : 'md:p-8'}`}>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-white mb-2">
                                        {currentAlert.title}
                                    </h3>
                                    <p className="text-orange-50 text-base leading-relaxed mb-4">
                                        {currentAlert.message}
                                    </p>
                                </div>
                            </div>

                            {/* Multiple Alerts Indicator */}
                            {activeAlerts.length > 1 && (
                                <div className="mt-4 pt-4 border-t border-white/20">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-orange-100">
                                            Alert {currentAlertIndex + 1} of {activeAlerts.length}
                                        </span>
                                        <div className="flex gap-2">
                                            {activeAlerts.map((_, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setCurrentAlertIndex(index)}
                                                    className={`w-2 h-2 rounded-full transition-all ${index === currentAlertIndex
                                                        ? 'bg-white w-6'
                                                        : 'bg-white/40 hover:bg-white/60'
                                                        }`}
                                                    aria-label={`Go to alert ${index + 1}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

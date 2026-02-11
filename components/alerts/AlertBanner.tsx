'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

interface Alert {
    id: string;
    alertId: string;
    title: string;
    message: string;
    imageUrl?: string | null;
    buttonText?: string | null;
    buttonAction?: string | null;
    status: string;
    startDate: string;
    endDate?: string | null;
}

export default function AlertBanner() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAlerts();
        loadDismissed();
        
        // Refresh alerts every 30 seconds
        const interval = setInterval(() => {
            console.log('[AlertBanner] Auto-refreshing alerts...');
            loadAlerts();
        }, 30000);
        
        // Also check when window regains focus
        const handleFocus = () => {
            console.log('[AlertBanner] Window focused, checking for new alerts...');
            loadAlerts();
        };
        window.addEventListener('focus', handleFocus);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    const loadAlerts = async () => {
        try {
            console.log('[AlertBanner] Fetching active alerts...');
            const response = await fetch('/api/alerts/active');
            const data = await response.json();
            console.log('[AlertBanner] API Response:', data);
            if (data.success && data.data) {
                console.log('[AlertBanner] Loaded alerts:', data.data.length);
                setAlerts(data.data);
            } else {
                console.warn('[AlertBanner] No alerts or unsuccessful response');
            }
        } catch (error) {
            console.error('[AlertBanner] Failed to load alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadDismissed = () => {
        try {
            const stored = localStorage.getItem('dismissedAlerts');
            if (stored) {
                setDismissed(new Set(JSON.parse(stored)));
            }
        } catch (error) {
            console.error('Failed to load dismissed alerts:', error);
        }
    };

    const handleDismiss = (alertId: string) => {
        const newDismissed = new Set(dismissed);
        newDismissed.add(alertId);
        setDismissed(newDismissed);
        localStorage.setItem('dismissedAlerts', JSON.stringify([...newDismissed]));

        // Move to next alert or hide banner
        if (currentIndex >= visibleAlerts.length - 1) {
            setCurrentIndex(Math.max(0, currentIndex - 1));
        }
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % visibleAlerts.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + visibleAlerts.length) % visibleAlerts.length);
    };

    // Filter out dismissed alerts
    const visibleAlerts = alerts.filter((alert) => !dismissed.has(alert.alertId));

    if (loading) {
        console.log('[AlertBanner] Still loading...');
        return null;
    }
    
    if (visibleAlerts.length === 0) {
        console.log('[AlertBanner] No visible alerts (total:', alerts.length, ', dismissed:', dismissed.size, ')');
        return null;
    }
    
    console.log('[AlertBanner] Showing alert:', currentIndex + 1, 'of', visibleAlerts.length);

    const currentAlert = visibleAlerts[currentIndex];

    return (
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg mb-6 rounded-xl overflow-hidden">
            <div className="px-6 py-4">
                <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                        <AlertCircle className="w-6 h-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <h3 className="text-lg font-bold mb-1">{currentAlert.title}</h3>
                                <p className="text-white/90 text-sm leading-relaxed">{currentAlert.message}</p>
                            </div>

                            {/* Image (if available) */}
                            {currentAlert.imageUrl && (
                                <div className="flex-shrink-0">
                                    <img
                                        src={currentAlert.imageUrl}
                                        alt={currentAlert.title}
                                        className="w-24 h-24 object-cover rounded-lg"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Navigation */}
                        {visibleAlerts.length > 1 && (
                            <div className="flex items-center gap-3 mt-3">
                                <button
                                    onClick={handlePrev}
                                    className="p-1 hover:bg-white/10 rounded transition-colors"
                                    title="Previous alert"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-xs text-white/80">
                                    {currentIndex + 1} of {visibleAlerts.length}
                                </span>
                                <button
                                    onClick={handleNext}
                                    className="p-1 hover:bg-white/10 rounded transition-colors"
                                    title="Next alert"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={() => handleDismiss(currentAlert.alertId)}
                        className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
                        title="Dismiss"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

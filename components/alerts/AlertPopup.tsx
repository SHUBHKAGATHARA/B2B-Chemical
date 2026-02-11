'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

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

export default function AlertPopup() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [seen, setSeen] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadAlerts();
        loadSeen();
    }, []);

    const loadAlerts = async () => {
        try {
            const response = await fetch('/api/alerts/active');
            const data = await response.json();
            console.log('[AlertPopup] API Response:', data);
            if (data.success && data.data) {
                console.log('[AlertPopup] Total active alerts:', data.data.length);
                const unseenAlerts = data.data.filter(
                    (alert: Alert) => !isAlertSeen(alert.alertId)
                );
                console.log('[AlertPopup] Unseen alerts:', unseenAlerts.length);
                setAlerts(unseenAlerts);
                if (unseenAlerts.length > 0) {
                    console.log('[AlertPopup] Opening popup with', unseenAlerts.length, 'alerts');
                    setIsOpen(true);
                }
            }
        } catch (error) {
            console.error('Failed to load alerts:', error);
        }
    };

    const loadSeen = () => {
        try {
            const stored = localStorage.getItem('seenAlertPopups');
            console.log('[AlertPopup] Seen alerts in localStorage:', stored);
            if (stored) {
                setSeen(new Set(JSON.parse(stored)));
            }
        } catch (error) {
            console.error('Failed to load seen alerts:', error);
        }
    };

    const isAlertSeen = (alertId: string): boolean => {
        try {
            const stored = localStorage.getItem('seenAlertPopups');
            if (stored) {
                const seenList = JSON.parse(stored);
                return seenList.includes(alertId);
            }
        } catch (error) {
            console.error('Failed to check seen alert:', error);
        }
        return false;
    };

    const markAsSeen = (alertId: string) => {
        const newSeen = new Set(seen);
        newSeen.add(alertId);
        setSeen(newSeen);
        localStorage.setItem('seenAlertPopups', JSON.stringify([...newSeen]));
    };

    const handleClose = () => {
        if (alerts[currentIndex]) {
            markAsSeen(alerts[currentIndex].alertId);
        }

        // Show next alert or close popup
        if (currentIndex < alerts.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setIsOpen(false);
        }
    };

    if (!isOpen || alerts.length === 0 || currentIndex >= alerts.length) {
        return null;
    }

    const currentAlert = alerts[currentIndex];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-6 h-6" />
                        <h3 className="text-lg font-bold">Important Notice</h3>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {currentAlert.imageUrl && (
                        <div className="mb-4">
                            <img
                                src={currentAlert.imageUrl}
                                alt={currentAlert.title}
                                className="w-full h-48 object-cover rounded-lg"
                            />
                        </div>
                    )}

                    <h4 className="text-xl font-bold text-gray-900 mb-3">
                        {currentAlert.title}
                    </h4>

                    <p className="text-gray-600 leading-relaxed mb-6 whitespace-pre-wrap">
                        {currentAlert.message}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-3">
                        <div className="text-sm text-gray-500">
                            {alerts.length > 1 && (
                                <span>
                                    Alert {currentIndex + 1} of {alerts.length}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={handleClose}
                            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all"
                        >
                            {currentIndex < alerts.length - 1 ? 'Next' : 'Close'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

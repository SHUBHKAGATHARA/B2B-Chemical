'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

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

interface AlertPopupProps {
    onClose?: () => void;
}

const ALERT_SEEN_PREFIX = 'alert_seen_';

export function AlertPopup({ onClose }: AlertPopupProps) {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [currentAlertIndex, setCurrentAlertIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch active alerts on component mount
    useEffect(() => {
        fetchActiveAlerts();
    }, []);

    const fetchActiveAlerts = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/alerts/active');

            // Check if response is ok before trying to parse
            if (!response.ok) {
                console.error('Failed to fetch active alerts:', response.status, response.statusText);
                setIsLoading(false);
                return;
            }

            // Check if response has content
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.error('Response is not JSON:', contentType);
                setIsLoading(false);
                return;
            }

            const text = await response.text();
            if (!text) {
                console.error('Empty response body');
                setIsLoading(false);
                return;
            }

            const data = JSON.parse(text);

            if (data.success && data.data) {
                // Filter out alerts that have already been seen
                const unseenAlerts = data.data.alerts.filter((alert: Alert) => {
                    const seenKey = `${ALERT_SEEN_PREFIX}${alert.alertId}`;
                    return !localStorage.getItem(seenKey);
                });

                setAlerts(unseenAlerts);
            }
        } catch (err: any) {
            console.error('Error fetching alerts:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const markAlertAsSeen = (alertId: string) => {
        const seenKey = `${ALERT_SEEN_PREFIX}${alertId}`;
        localStorage.setItem(seenKey, 'true');
    };

    const handleClose = () => {
        if (alerts.length > 0 && currentAlertIndex < alerts.length) {
            markAlertAsSeen(alerts[currentAlertIndex].alertId);
        }

        // Move to next alert or close
        if (currentAlertIndex < alerts.length - 1) {
            setCurrentAlertIndex(currentAlertIndex + 1);
        } else {
            onClose?.();
        }
    };

    // Don't show modal if no alerts or still loading
    if (isLoading || alerts.length === 0 || currentAlertIndex >= alerts.length) {
        return null;
    }

    const currentAlert = alerts[currentAlertIndex];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">{currentAlert.title}</h2>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Alert Image */}
                    {currentAlert.imageUrl && (
                        <div className="w-full rounded-lg overflow-hidden">
                            <img
                                src={currentAlert.imageUrl}
                                alt={currentAlert.title}
                                className="w-full h-auto object-cover max-h-96"
                            />
                        </div>
                    )}

                    {/* Alert Message */}
                    <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700 whitespace-pre-wrap text-base leading-relaxed">
                            {currentAlert.message}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            onClick={handleClose}
                            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                            {currentAlertIndex < alerts.length - 1 ? 'Next' : 'Close'}
                        </button>
                    </div>

                    {/* Alert counter */}
                    {alerts.length > 1 && (
                        <div className="text-center text-sm text-gray-500 pt-2">
                            Alert {currentAlertIndex + 1} of {alerts.length}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


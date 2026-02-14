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
    const [isNavigating, setIsNavigating] = useState(false);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        loadAlerts();
        loadSeen();

        // Refresh alerts every 30 seconds to catch new ones
        const interval = setInterval(() => {
            // Only refresh if popup is closed
            if (!isOpen) {
                console.log('[AlertPopup] Auto-refreshing alerts...');
                loadAlerts();
            }
        }, 30000);

        // Also check when window regains focus
        const handleFocus = () => {
            if (!isOpen) {
                console.log('[AlertPopup] Window focused, checking for new alerts...');
                loadAlerts();
            }
        };
        window.addEventListener('focus', handleFocus);

        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', handleFocus);
        };
    }, [isOpen]);

    const loadAlerts = async () => {
        try {
            console.log('[AlertPopup] Fetching alerts from /api/alerts/active...');
            const response = await fetch('/api/alerts/active');

            if (!response.ok) {
                console.error('[AlertPopup] API returned error status:', response.status, response.statusText);
                return;
            }

            const data = await response.json();
            console.log('[AlertPopup] API Response:', data);

            if (!data.success) {
                console.error('[AlertPopup] API returned unsuccessful response:', data);
                return;
            }

            if (data.success && data.data) {
                console.log('[AlertPopup] Total active alerts:', data.data.length);

                if (data.data.length === 0) {
                    console.log('[AlertPopup] No active alerts found in database');
                    return;
                }

                // Get current seen alerts from localStorage
                const seenIds = getSeenAlertIds();
                console.log('[AlertPopup] Currently seen alert IDs:', seenIds);

                const unseenAlerts = data.data.filter(
                    (alert: Alert) => !seenIds.includes(alert.alertId)
                );
                console.log('[AlertPopup] Unseen alerts:', unseenAlerts.length);

                // Log if any alerts have images
                unseenAlerts.forEach((alert: Alert) => {
                    console.log(`[AlertPopup] Alert "${alert.title}" has image:`, !!alert.imageUrl, alert.imageUrl);
                });

                setAlerts(unseenAlerts);
                if (unseenAlerts.length > 0 && !isOpen) {
                    console.log('[AlertPopup] Opening popup with', unseenAlerts.length, 'alerts');
                    setIsOpen(true);
                    setCurrentIndex(0);
                    setImageError(false); // Reset image error state
                } else if (unseenAlerts.length === 0) {
                    console.log('[AlertPopup] All alerts have been seen');
                }
            } else {
                console.warn('[AlertPopup] Unexpected API response structure:', data);
            }
        } catch (error) {
            console.error('[AlertPopup] Failed to load alerts:', error);
            console.error('[AlertPopup] Error details:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            });
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

    const getSeenAlertIds = (): string[] => {
        try {
            const stored = localStorage.getItem('seenAlertPopups');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to get seen alert IDs:', error);
        }
        return [];
    };

    const markAsSeen = (alertId: string) => {
        const newSeen = new Set(seen);
        newSeen.add(alertId);
        setSeen(newSeen);
        localStorage.setItem('seenAlertPopups', JSON.stringify([...newSeen]));
    };

    const handleClose = () => {
        if (alerts[currentIndex]) {
            const currentAlertId = alerts[currentIndex].alertId;
            console.log('[AlertPopup] Marking alert as seen:', currentAlertId);
            markAsSeen(currentAlertId);
        }

        // Show next alert or close popup
        if (currentIndex < alerts.length - 1) {
            console.log('[AlertPopup] Moving to next alert:', currentIndex + 1, 'of', alerts.length);
            setCurrentIndex(currentIndex + 1);
            setImageError(false); // Reset image error for next alert
        } else {
            console.log('[AlertPopup] All alerts viewed, closing popup');
            setIsOpen(false);
            setCurrentIndex(0);
        }
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        console.error('[AlertPopup] Failed to load image:', e.currentTarget.src);
        console.error('[AlertPopup] Alert title:', alerts[currentIndex]?.title);
        setImageError(true);
    };

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        console.log('[AlertPopup] Image loaded successfully:', e.currentTarget.src);
        console.log('[AlertPopup] Alert title:', alerts[currentIndex]?.title);
        setImageError(false);
    };

    // Early return checks
    if (!isOpen) {
        console.log('[AlertPopup] Popup is closed');
        return null;
    }

    if (alerts.length === 0) {
        console.log('[AlertPopup] No alerts to display');
        return null;
    }

    if (currentIndex >= alerts.length) {
        console.log('[AlertPopup] Current index out of bounds');
        return null;
    }

    const currentAlert = alerts[currentIndex];

    if (!currentAlert) {
        console.error('[AlertPopup] Current alert is undefined');
        return null;
    }

    console.log('[AlertPopup] Rendering popup for alert:', currentAlert.title);
    console.log('[AlertPopup] Has image:', !!currentAlert.imageUrl);
    if (currentAlert.imageUrl) {
        console.log('[AlertPopup] Image URL:', currentAlert.imageUrl);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
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
                        <div className="mb-4 relative">
                            {imageError ? (
                                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                                    <div className="text-center">
                                        <p className="text-gray-500 text-sm font-medium">Image failed to load</p>
                                        <p className="text-gray-400 text-xs mt-1">URL: {currentAlert.imageUrl.substring(0, 50)}...</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <img
                                        src={currentAlert.imageUrl}
                                        alt={currentAlert.title}
                                        className="w-full h-48 object-cover rounded-lg"
                                        onError={handleImageError}
                                        onLoad={handleImageLoad}
                                        loading="eager"
                                    />
                                </>
                            )}
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
                        <div className="text-sm font-medium text-gray-600">
                            {alerts.length > 1 && (
                                <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full">
                                    Alert {currentIndex + 1} of {alerts.length}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={handleClose}
                            className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-bold hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                        >
                            {currentIndex < alerts.length - 1 ? '➜ Next Alert' : '✓ Close'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

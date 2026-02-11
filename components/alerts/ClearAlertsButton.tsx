'use client';

import { Trash2 } from 'lucide-react';

export default function ClearAlertsButton() {
    const clearAllAlerts = () => {
        localStorage.removeItem('seenAlertPopups');
        localStorage.removeItem('dismissedAlerts');
        alert('✅ Cleared all alert data! Refresh the page to see alerts again.');
        window.location.reload();
    };

    return (
        <button
            onClick={clearAllAlerts}
            className="fixed bottom-4 right-4 z-50 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group"
            title="Clear all alert localStorage data"
        >
            <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Clear Alerts</span>
        </button>
    );
}

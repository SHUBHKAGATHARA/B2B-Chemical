'use client';

import AlertPopup from '@/components/alerts/AlertPopup';
import ClearAlertsButton from '@/components/alerts/ClearAlertsButton';

export default function AlertsWrapper() {
    return (
        <>
            <AlertPopup />
            <ClearAlertsButton />
        </>
    );
}

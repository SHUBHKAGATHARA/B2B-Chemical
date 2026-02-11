'use client';

import AlertBanner from '@/components/alerts/AlertBanner';
import AlertPopup from '@/components/alerts/AlertPopup';
import ClearAlertsButton from '@/components/alerts/ClearAlertsButton';

export default function AlertsWrapper() {
    return (
        <>
            <AlertBanner />
            <AlertPopup />
            <ClearAlertsButton />
        </>
    );
}

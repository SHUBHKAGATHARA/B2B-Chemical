'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast = { ...toast, id };
        setToasts((prev) => [...prev, newToast]);

        // Auto remove after duration
        const duration = toast.duration || 5000;
        setTimeout(() => {
            removeToast(id);
        }, duration);
    }, [removeToast]);

    const success = useCallback((title: string, message?: string) => {
        addToast({ type: 'success', title, message });
    }, [addToast]);

    const error = useCallback((title: string, message?: string) => {
        addToast({ type: 'error', title, message });
    }, [addToast]);

    const warning = useCallback((title: string, message?: string) => {
        addToast({ type: 'warning', title, message });
    }, [addToast]);

    const info = useCallback((title: string, message?: string) => {
        addToast({ type: 'info', title, message });
    }, [addToast]);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

interface ToastContainerProps {
    toasts: Toast[];
    removeToast: (id: string) => void;
}

function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-sm">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    );
}

interface ToastItemProps {
    toast: Toast;
    onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
    const icons = {
        success: <CheckCircle className="w-5 h-5" />,
        error: <AlertCircle className="w-5 h-5" />,
        warning: <AlertTriangle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />,
    };

    const styles = {
        success: {
            bg: 'bg-emerald-50 border-emerald-200',
            icon: 'text-emerald-500 bg-emerald-100',
            title: 'text-emerald-800',
            message: 'text-emerald-600',
            progress: 'bg-emerald-500',
        },
        error: {
            bg: 'bg-red-50 border-red-200',
            icon: 'text-red-500 bg-red-100',
            title: 'text-red-800',
            message: 'text-red-600',
            progress: 'bg-red-500',
        },
        warning: {
            bg: 'bg-amber-50 border-amber-200',
            icon: 'text-amber-500 bg-amber-100',
            title: 'text-amber-800',
            message: 'text-amber-600',
            progress: 'bg-amber-500',
        },
        info: {
            bg: 'bg-blue-50 border-blue-200',
            icon: 'text-blue-500 bg-blue-100',
            title: 'text-blue-800',
            message: 'text-blue-600',
            progress: 'bg-blue-500',
        },
    };

    const style = styles[toast.type];

    return (
        <div
            className={`
                relative overflow-hidden
                ${style.bg} border rounded-xl
                shadow-lg shadow-black/5
                animate-slideInRight
                min-w-[320px]
            `}
        >
            <div className="flex items-start gap-3 p-4">
                <div className={`p-2 rounded-lg ${style.icon}`}>
                    {icons[toast.type]}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold ${style.title}`}>{toast.title}</h4>
                    {toast.message && (
                        <p className={`text-sm mt-1 ${style.message}`}>{toast.message}</p>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="text-charcoal-400 hover:text-charcoal-600 transition-colors p-1 rounded-lg hover:bg-black/5"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5">
                <div
                    className={`h-full ${style.progress} animate-shrink-width`}
                    style={{ animationDuration: `${toast.duration || 5000}ms` }}
                />
            </div>
        </div>
    );
}

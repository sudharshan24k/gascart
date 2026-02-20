import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { clsx } from 'clsx';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
    id: string;
    message: string;
    type: ToastType;
    onDismiss: (id: string) => void;
}

const toastConfig = {
    success: {
        icon: CheckCircle,
        className: 'bg-white border-green-500 text-green-700 shadow-green-100',
        iconColor: 'text-green-500'
    },
    error: {
        icon: AlertCircle,
        className: 'bg-white border-red-500 text-red-700 shadow-red-100',
        iconColor: 'text-red-500'
    },
    info: {
        icon: Info,
        className: 'bg-white border-blue-500 text-blue-700 shadow-blue-100',
        iconColor: 'text-blue-500'
    }
};

const Toast: React.FC<ToastProps> = ({ id, message, type, onDismiss }) => {
    const config = toastConfig[type];
    const Icon = config.icon;

    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(id);
        }, 5000);

        return () => clearTimeout(timer);
    }, [id, onDismiss]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className={clsx(
                'flex items-center w-full max-w-sm p-4 mb-4 rounded-xl shadow-lg border border-l-4 pointer-events-auto',
                config.className
            )}
            role="alert"
        >
            <div className={clsx('inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg', config.iconColor)}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="ml-3 text-sm font-semibold">{message}</div>
            <button
                type="button"
                className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8"
                onClick={() => onDismiss(id)}
                aria-label="Close"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
};

export default Toast;

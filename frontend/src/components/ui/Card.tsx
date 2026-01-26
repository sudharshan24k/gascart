import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    shadow?: 'none' | 'sm' | 'md' | 'lg';
    onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
    children,
    className,
    hover = false,
    padding = 'md',
    shadow = 'sm',
    onClick,
}) => {
    const paddingStyles = {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    const shadowStyles = {
        none: 'shadow-none',
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
    };

    return (
        <div
            className={clsx(
                'bg-white rounded-2xl border border-gray-100',
                paddingStyles[padding],
                shadowStyles[shadow],
                hover && 'transition-all duration-300 hover:shadow-lg hover:border-gray-200 cursor-pointer',
                className
            )}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export default Card;

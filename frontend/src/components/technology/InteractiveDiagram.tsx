import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import processFlowImg from '../../assets/process-flow.png';

interface Hotspot {
    id: string;
    x: number; // percentage from left
    y: number; // percentage from top
    title: string;
    tooltip: string;
}

const hotspots: Hotspot[] = [
    {
        id: 'agri-residue',
        x: 22,
        y: 12,
        title: 'Agricultural Residue Input',
        tooltip: 'Crop residue, grass, and farm waste collected as organic feedstock for biogas production.'
    },
    {
        id: 'organic-waste',
        x: 8,
        y: 75,
        title: 'Organic Waste & Slurry Input',
        tooltip: 'Food waste, animal dung, and organic slurry transported to the plant for processing.'
    },
    {
        id: 'crushing',
        x: 8,
        y: 36,
        title: 'Crushing / Pre-Processing Unit',
        tooltip: 'Shreds and breaks down waste to improve digestion efficiency and gas yield.'
    },
    {
        id: 'mixing',
        x: 20,
        y: 53,
        title: 'Mixing Tank',
        tooltip: 'Waste is mixed with water to form a uniform slurry suitable for anaerobic digestion.'
    },
    {
        id: 'digester',
        x: 45,
        y: 45,
        title: 'Anaerobic Digester',
        tooltip: 'Sealed oxygen-free tank where microbes convert organic waste into raw biogas and digestate.'
    },
    {
        id: 'digestate',
        x: 35,
        y: 80,
        title: 'Digestate Storage',
        tooltip: 'Nutrient-rich by-product collected and reused as organic fertilizer.'
    },
    {
        id: 'moisture-removal',
        x: 75,
        y: 18,
        title: 'Moisture Removal System',
        tooltip: 'Removes water vapor from raw biogas to protect downstream equipment.'
    },
    {
        id: 'h2s-removal',
        x: 65,
        y: 28,
        title: 'H₂S Removal (Desulfurization)',
        tooltip: 'Eliminates hydrogen sulfide to prevent corrosion and ensure gas safety.'
    },
    {
        id: 'co2-separation',
        x: 71,
        y: 65,
        title: 'CO₂ Separation / Gas Upgrading',
        tooltip: 'Removes carbon dioxide to upgrade biogas into high-purity Bio-CNG.'
    },
    {
        id: 'compression',
        x: 80,
        y: 78,
        title: 'Compression System',
        tooltip: 'Compresses purified Bio-CNG to high pressure for storage and transport.'
    },
    {
        id: 'storage',
        x: 90,
        y: 60,
        title: 'High-Pressure Storage Tanks',
        tooltip: 'Safely stores compressed Bio-CNG to manage demand and ensure continuous supply.'
    },
    {
        id: 'filling',
        x: 75,
        y: 92,
        title: 'Cylinder Filling Station',
        tooltip: 'Transfers Bio-CNG into cylinders for commercial and industrial use.'
    },
    {
        id: 'distribution',
        x: 18,
        y: 85,
        title: 'Distribution & Delivery',
        tooltip: 'Delivers Bio-CNG cylinders to industries, fuel stations, and commercial customers.'
    },
    {
        id: 'end-usage',
        x: 92,
        y: 88,
        title: 'End Usage',
        tooltip: 'Clean renewable fuel used for vehicles, industries, and power generation.'
    },
    {
        id: 'monitoring',
        x: 80,
        y: 58,
        title: 'Monitoring & Safety Systems',
        tooltip: 'Monitors pressure, flow, and safety to ensure efficient and secure plant operation.'
    }
];

const InteractiveDiagram: React.FC = () => {
    const [activeId, setActiveId] = useState<string | null>(null);

    return (
        <div className="relative w-full max-w-5xl mx-auto overflow-hidden rounded-2xl shadow-2xl bg-white border border-neutral-dark/10 group">
            {/* Main Image */}
            <img
                src={processFlowImg}
                alt="Bio-CNG Process Diagram"
                className="w-full h-auto block select-none pointer-events-none"
            />

            {/* Hotspots Overlay */}
            <div className="absolute inset-0">
                {hotspots.map((spot) => (
                    <div
                        key={spot.id}
                        className="absolute cursor-help group/spot"
                        style={{ left: `${spot.x}%`, top: `${spot.y}%`, transform: 'translate(-50%, -50%)' }}
                        onMouseEnter={() => setActiveId(spot.id)}
                        onMouseLeave={() => setActiveId(null)}
                        onClick={() => setActiveId(activeId === spot.id ? null : spot.id)}
                    >
                        {/* Pulse Animation */}
                        <motion.div
                            className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center relative"
                            initial={{ scale: 0.8 }}
                            animate={{
                                scale: activeId === spot.id ? 1.2 : [0.8, 1.1, 0.8],
                                backgroundColor: activeId === spot.id ? 'rgba(45, 90, 39, 0.5)' : 'rgba(45, 90, 39, 0.2)'
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <div className="w-3 h-3 md:w-4 md:h-4 bg-primary rounded-full shadow-lg border border-white/20" />
                        </motion.div>

                        {/* Tooltip */}
                        <AnimatePresence>
                            {activeId === spot.id && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 z-50 w-48 md:w-64"
                                >
                                    <div className="bg-neutral-dark text-white p-3 md:p-4 rounded-xl shadow-2xl border border-white/10 backdrop-blur-md">
                                        <h4 className="text-sm font-bold mb-1 text-primary-light">{spot.title}</h4>
                                        <p className="text-xs leading-relaxed opacity-90">
                                            {spot.tooltip}
                                        </p>
                                        {/* Tooltip Arrow */}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-neutral-dark" />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>

            {/* Hint Overlay */}
            <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] md:text-xs font-medium text-gray-500 shadow-sm border border-gray-100 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                Hover over nodes to explore process
            </div>
        </div>
    );
};

export default InteractiveDiagram;

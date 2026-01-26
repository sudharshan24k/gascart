import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Factory, Droplet, Zap, FlaskConical, Wind, Package, Truck, CheckCircle2, Activity } from 'lucide-react';

interface ProcessNode {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    position: { x: number; y: number };
    color: string;
    gradient: string;
}

const processNodes: ProcessNode[] = [
    {
        id: 'feedstock',
        title: 'Feedstock Collection',
        description: 'Organic waste from agriculture including crop residue, grass, and farm waste collected as renewable feedstock.',
        icon: Leaf,
        position: { x: 10, y: 20 },
        color: 'from-emerald-500 to-green-600',
        gradient: 'bg-gradient-to-br from-emerald-500/10 to-green-600/10'
    },
    {
        id: 'preprocess',
        title: 'Pre-Processing',
        description: 'Shredding and crushing units break down waste to optimal particle size for enhanced digestion efficiency.',
        icon: Factory,
        position: { x: 25, y: 50 },
        color: 'from-blue-500 to-cyan-600',
        gradient: 'bg-gradient-to-br from-blue-500/10 to-cyan-600/10'
    },
    {
        id: 'mixing',
        title: 'Slurry Mixing',
        description: 'Waste mixed with water in controlled ratios to create uniform slurry for anaerobic digestion.',
        icon: Droplet,
        position: { x: 40, y: 30 },
        color: 'from-sky-500 to-blue-600',
        gradient: 'bg-gradient-to-br from-sky-500/10 to-blue-600/10'
    },
    {
        id: 'digestion',
        title: 'Anaerobic Digestion',
        description: 'Sealed oxygen-free bioreactor where specialized microbes convert organic matter into raw biogas.',
        icon: Activity,
        position: { x: 50, y: 60 },
        color: 'from-amber-500 to-orange-600',
        gradient: 'bg-gradient-to-br from-amber-500/10 to-orange-600/10'
    },
    {
        id: 'purification',
        title: 'Gas Purification',
        description: 'Multi-stage cleaning removes H₂S, moisture, and CO₂ to upgrade biogas to pipeline-quality biomethane.',
        icon: FlaskConical,
        position: { x: 65, y: 40 },
        color: 'from-purple-500 to-violet-600',
        gradient: 'bg-gradient-to-br from-purple-500/10 to-violet-600/10'
    },
    {
        id: 'compression',
        title: 'Compression',
        description: 'Purified biomethane compressed to 200-250 bar for efficient storage and transportation.',
        icon: Zap,
        position: { x: 75, y: 70 },
        color: 'from-yellow-500 to-amber-600',
        gradient: 'bg-gradient-to-br from-yellow-500/10 to-amber-600/10'
    },
    {
        id: 'storage',
        title: 'High-Pressure Storage',
        description: 'Compressed Bio-CNG stored in specialized high-pressure tanks ensuring continuous supply.',
        icon: Package,
        position: { x: 85, y: 50 },
        color: 'from-indigo-500 to-blue-600',
        gradient: 'bg-gradient-to-br from-indigo-500/10 to-blue-600/10'
    },
    {
        id: 'distribution',
        title: 'Distribution',
        description: 'Bio-CNG delivered to industries, CNG stations, and commercial customers via specialized transport.',
        icon: Truck,
        position: { x: 90, y: 25 },
        color: 'from-green-500 to-emerald-600',
        gradient: 'bg-gradient-to-br from-green-500/10 to-emerald-600/10'
    }
];

const InteractiveDiagram: React.FC = () => {
    const [activeNode, setActiveNode] = useState<string | null>(null);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

    const connections = [
        { from: 'feedstock', to: 'preprocess' },
        { from: 'preprocess', to: 'mixing' },
        { from: 'mixing', to: 'digestion' },
        { from: 'digestion', to: 'purification' },
        { from: 'purification', to: 'compression' },
        { from: 'compression', to: 'storage' },
        { from: 'storage', to: 'distribution' }
    ];

    const getNodePosition = (nodeId: string) => {
        const node = processNodes.find(n => n.id === nodeId);
        return node?.position || { x: 0, y: 0 };
    };

    const isNodeActive = (nodeId: string) => {
        return activeNode === nodeId || hoveredNode === nodeId;
    };

    return (
        <div className="relative w-full">
            {/* SVG Flow Diagram */}
            <div className="relative bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-[48px] border border-gray-200/50 shadow-2xl overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute inset-0 opacity-[0.015]">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
                </div>

                <svg
                    viewBox="0 0 100 100"
                    className="w-full h-auto"
                    style={{ minHeight: '600px' }}
                    preserveAspectRatio="xMidYMid meet"
                >
                    {/* Flow Connections with Animated Paths */}
                    <defs>
                        <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {connections.map((conn, idx) => {
                        const from = getNodePosition(conn.from);
                        const to = getNodePosition(conn.to);
                        const isActive = isNodeActive(conn.from) || isNodeActive(conn.to);

                        const midX = (from.x + to.x) / 2;
                        const midY = (from.y + to.y) / 2;
                        const ctrlOffset = 15;

                        return (
                            <g key={idx}>
                                {/* Connection Path */}
                                <motion.path
                                    d={`M ${from.x} ${from.y} Q ${midX} ${midY - ctrlOffset}, ${to.x} ${to.y}`}
                                    fill="none"
                                    stroke={isActive ? "url(#flowGradient)" : "#e5e7eb"}
                                    strokeWidth={isActive ? "0.8" : "0.4"}
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{
                                        pathLength: 1,
                                        opacity: isActive ? 1 : 0.3,
                                        strokeWidth: isActive ? "0.8" : "0.4"
                                    }}
                                    transition={{
                                        pathLength: { duration: 2, delay: idx * 0.2 },
                                        opacity: { duration: 0.3 },
                                        strokeWidth: { duration: 0.3 }
                                    }}
                                    filter={isActive ? "url(#glow)" : undefined}
                                />

                                {/* Animated Flow Particle */}
                                {isActive && (
                                    <motion.circle
                                        r="0.8"
                                        fill="#3b82f6"
                                        filter="url(#glow)"
                                        initial={{ offsetDistance: "0%" }}
                                        animate={{ offsetDistance: "100%" }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "linear"
                                        }}
                                    >
                                        <animateMotion
                                            dur="2s"
                                            repeatCount="indefinite"
                                            path={`M ${from.x} ${from.y} Q ${midX} ${midY - ctrlOffset}, ${to.x} ${to.y}`}
                                        />
                                    </motion.circle>
                                )}
                            </g>
                        );
                    })}
                </svg>

                {/* Interactive Process Nodes */}
                <div className="absolute inset-0 pointer-events-none">
                    {processNodes.map((node, idx) => (
                        <motion.div
                            key={node.id}
                            className="absolute pointer-events-auto"
                            style={{
                                left: `${node.position.x}%`,
                                top: `${node.position.y}%`,
                                transform: 'translate(-50%, -50%)'
                            }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: idx * 0.1, type: 'spring', stiffness: 200 }}
                            onMouseEnter={() => setHoveredNode(node.id)}
                            onMouseLeave={() => setHoveredNode(null)}
                            onClick={() => setActiveNode(activeNode === node.id ? null : node.id)}
                        >
                            {/* Node Container */}
                            <motion.div
                                className="relative cursor-pointer group"
                                animate={{
                                    scale: isNodeActive(node.id) ? 1.15 : 1,
                                    y: isNodeActive(node.id) ? -4 : 0
                                }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            >
                                {/* Pulsing Glow Ring */}
                                <motion.div
                                    className={`absolute inset-0 rounded-full bg-gradient-to-r ${node.color} blur-xl -z-10`}
                                    animate={{
                                        scale: isNodeActive(node.id) ? [1, 1.3, 1] : 1,
                                        opacity: isNodeActive(node.id) ? [0.3, 0.6, 0.3] : 0
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                />

                                {/* Node Circle */}
                                <div className={`w-14 h-14 md:w-20 md:h-20 rounded-full bg-white shadow-2xl border-2 ${isNodeActive(node.id) ? 'border-primary' : 'border-gray-200'} flex items-center justify-center transition-all duration-300 backdrop-blur-xl`}>
                                    <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full bg-gradient-to-br ${node.color} flex items-center justify-center shadow-lg`}>
                                        <node.icon className="w-4 h-4 md:w-6 md:h-6 text-white" strokeWidth={2.5} />
                                    </div>
                                </div>

                                {/* Step Number Badge */}
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-gray-900 to-gray-700 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-lg border-2 border-white">
                                    {idx + 1}
                                </div>
                            </motion.div>

                            {/* Tooltip Card */}
                            <AnimatePresence>
                                {isNodeActive(node.id) && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                        className="absolute left-1/2 top-full mt-6 -translate-x-1/2 z-50 w-72 md:w-80"
                                    >
                                        <div className="relative bg-white/95 backdrop-blur-2xl rounded-[28px] shadow-2xl border border-gray-200/50 overflow-hidden">
                                            {/* Gradient Header */}
                                            <div className={`h-2 bg-gradient-to-r ${node.color}`} />

                                            {/* Content */}
                                            <div className="p-6">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${node.color} flex items-center justify-center shrink-0 shadow-lg`}>
                                                        <node.icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                                                    </div>
                                                    <div className="flex-grow">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Step {idx + 1}</span>
                                                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                        </div>
                                                        <h4 className="text-base font-black text-gray-900 leading-tight">{node.title}</h4>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                                    {node.description}
                                                </p>
                                            </div>

                                            {/* Tooltip Arrow */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-[1px]">
                                                <div className="w-4 h-4 bg-white rotate-45 border-l border-t border-gray-200/50" />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                {/* Interactive Hint */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 }}
                    className="absolute bottom-8 right-8 flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-xl rounded-full shadow-xl border border-gray-200/50"
                >
                    <Wind className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-xs font-bold text-gray-600 tracking-wide">Click nodes to explore the workflow</span>
                </motion.div>
            </div>

            {/* Active Node Details Panel */}
            <AnimatePresence>
                {activeNode && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="mt-10 p-8 bg-gradient-to-br from-gray-50 to-white rounded-[40px] border border-gray-200/50 shadow-xl"
                    >
                        {(() => {
                            const node = processNodes.find(n => n.id === activeNode);
                            if (!node) return null;

                            return (
                                <div className="flex flex-col md:flex-row gap-8 items-center">
                                    <div className={`w-24 h-24 rounded-[28px] bg-gradient-to-br ${node.color} flex items-center justify-center shrink-0 shadow-2xl`}>
                                        <node.icon className="w-12 h-12 text-white" strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-grow text-center md:text-left">
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full mb-3">
                                            <span className="text-[10px] font-black uppercase tracking-widest">Active Process</span>
                                        </div>
                                        <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-3">{node.title}</h3>
                                        <p className="text-gray-600 leading-relaxed font-medium text-lg">{node.description}</p>
                                    </div>
                                </div>
                            );
                        })()}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default InteractiveDiagram;

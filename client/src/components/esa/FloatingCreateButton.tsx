// ESA LIFE CEO 61×21 AGENTS FRAMEWORK
// Floating Create Memory Button with Magnetic Hover Effects
// Following ESA_LIFE_CEO_61x21_AGENTS_FRAMEWORK.md specifications

import { useState, useRef, useEffect } from 'react';
import { Plus, Sparkles, Camera, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingCreateButtonProps {
  onClick: () => void;
  theme?: string;
}

export default function FloatingCreateButton({ onClick, theme = 'light' }: FloatingCreateButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);

  // Magnetic hover effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current || !isHovered) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const magnetStrength = 0.25;
    const maxDistance = 100;
    
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance < maxDistance) {
      const strength = (1 - distance / maxDistance) * magnetStrength;
      setMagneticOffset({
        x: deltaX * strength,
        y: deltaY * strength
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsExpanded(false);
    setMagneticOffset({ x: 0, y: 0 });
  };

  // Pulse animation
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isHovered && Math.random() > 0.7) {
        setIsExpanded(true);
        setTimeout(() => setIsExpanded(false), 600);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <motion.div
      ref={buttonRef}
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ 
        scale: 1, 
        rotate: 0,
        x: magneticOffset.x,
        y: magneticOffset.y
      }}
      transition={{ 
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => {
        setIsHovered(true);
        setIsExpanded(true);
      }}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Glow Effect */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-400 to-cyan-600 blur-2xl opacity-50"
          />
        )}
      </AnimatePresence>

      {/* Main Button */}
      <motion.button
        onClick={onClick}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "relative group",
          "w-16 h-16 rounded-full",
          "bg-gradient-to-br from-teal-400 to-cyan-600",
          "shadow-lg hover:shadow-2xl",
          "transition-all duration-300",
          "flex items-center justify-center",
          "overflow-hidden"
        )}
        data-testid="button-create-memory"
      >
        {/* Ripple Effect Background */}
        <div className="absolute inset-0">
          <motion.div
            animate={isExpanded ? {
              scale: [1, 1.5, 1],
              opacity: [0.3, 0, 0.3],
            } : {}}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 rounded-full bg-white/20"
          />
        </div>

        {/* Icon Container */}
        <motion.div
          animate={{ rotate: isHovered ? 90 : 0 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="relative z-10"
        >
          <Plus className="w-7 h-7 text-white" />
        </motion.div>

        {/* Sparkle Effects */}
        <AnimatePresence>
          {isHovered && (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0, x: -20, y: -20 }}
                animate={{ opacity: 1, scale: 1, x: -25, y: -25 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ delay: 0.1 }}
                className="absolute"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0, x: 20, y: -20 }}
                animate={{ opacity: 1, scale: 1, x: 25, y: -25 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute"
              >
                <Camera className="w-4 h-4 text-pink-300" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0, x: 0, y: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0, y: 25 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute"
              >
                <Edit3 className="w-4 h-4 text-purple-300" />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 10, x: '-50%' }}
            className="absolute bottom-full left-1/2 mb-3 whitespace-nowrap"
          >
            <div className="bg-gray-900 dark:bg-gray-800 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                Create Memory
              </span>
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-800" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Particle Effects on Click */}
      <AnimatePresence>
        {isExpanded && isHovered && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 0, 
                  scale: 0,
                  x: 0,
                  y: 0
                }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: Math.cos(i * 60 * Math.PI / 180) * 40,
                  y: Math.sin(i * 60 * Math.PI / 180) * 40
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ 
                  duration: 0.8,
                  delay: i * 0.05,
                  ease: "easeOut"
                }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <div className="w-2 h-2 bg-gradient-to-r from-teal-400 to-cyan-600 rounded-full" />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
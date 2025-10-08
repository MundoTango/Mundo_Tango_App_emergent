import { motion, type HTMLMotionProps } from 'framer-motion';
import { 
  fadeInVariants, 
  fadeInUpVariants, 
  scaleInVariants, 
  slideInLeftVariants,
  slideInRightVariants,
  staggerContainerVariants,
  staggerItemVariants
} from '@/lib/motion-variants';

interface MotionWrapperProps extends HTMLMotionProps<'div'> {
  delay?: number;
}

export const FadeIn = ({ delay = 0, children, ...props }: MotionWrapperProps) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={fadeInVariants}
    custom={{ delay }}
    {...props}
  >
    {children}
  </motion.div>
);

export const FadeInUp = ({ delay = 0, children, ...props }: MotionWrapperProps) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={fadeInUpVariants}
    style={{ transitionDelay: `${delay}s` }}
    {...props}
  >
    {children}
  </motion.div>
);

export const ScaleIn = ({ delay = 0, children, ...props }: MotionWrapperProps) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={scaleInVariants}
    style={{ transitionDelay: `${delay}s` }}
    {...props}
  >
    {children}
  </motion.div>
);

export const SlideInLeft = ({ delay = 0, children, ...props }: MotionWrapperProps) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={slideInLeftVariants}
    style={{ transitionDelay: `${delay}s` }}
    {...props}
  >
    {children}
  </motion.div>
);

export const SlideInRight = ({ delay = 0, children, ...props }: MotionWrapperProps) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={slideInRightVariants}
    style={{ transitionDelay: `${delay}s` }}
    {...props}
  >
    {children}
  </motion.div>
);

interface StaggerContainerProps extends HTMLMotionProps<'div'> {
  staggerDelay?: number;
  delayChildren?: number;
}

export const StaggerContainer = ({ 
  staggerDelay = 0.08, 
  delayChildren = 0.1,
  children, 
  ...props 
}: StaggerContainerProps) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={staggerContainerVariants}
    custom={{ staggerChildren: staggerDelay, delayChildren }}
    {...props}
  >
    {children}
  </motion.div>
);

export const StaggerItem = ({ children, ...props }: HTMLMotionProps<'div'>) => (
  <motion.div variants={staggerItemVariants} {...props}>
    {children}
  </motion.div>
);

export const AnimatedCard = ({ children, ...props }: HTMLMotionProps<'div'>) => (
  <motion.div
    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
    {...props}
  >
    {children}
  </motion.div>
);

export const AnimatedButton = ({ children, ...props }: HTMLMotionProps<'button'>) => (
  <motion.button
    whileHover={{ scale: 1.05, transition: { duration: 0.15 } }}
    whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
    {...props}
  >
    {children}
  </motion.button>
);

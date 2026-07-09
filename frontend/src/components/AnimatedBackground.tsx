import { motion } from 'framer-motion';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none bg-background">
      {/* Radial gradient mesh overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-background to-background dark:from-blue-950/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-purple-900/5 via-transparent to-transparent dark:from-purple-950/10" />

      {/* Floating blurred animated circles */}
      <motion.div
        className="absolute top-[10%] left-[10%] h-[350px] w-[350px] rounded-full bg-blue-500/10 dark:bg-blue-600/10 blur-[100px] animate-blob"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2 }}
      />
      <motion.div
        className="absolute bottom-[20%] right-[15%] h-[400px] w-[400px] rounded-full bg-purple-500/10 dark:bg-purple-600/10 blur-[120px] animate-blob animation-delay-2000"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.5 }}
      />
      <motion.div
        className="absolute top-[40%] right-[25%] h-[300px] w-[300px] rounded-full bg-cyan-500/10 dark:bg-cyan-600/10 blur-[90px] animate-blob animation-delay-4000"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 3 }}
      />

      {/* Noise Texture layer */}
      <div className="absolute inset-0 noise-bg" />
    </div>
  );
}

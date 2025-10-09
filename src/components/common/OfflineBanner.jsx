import React from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OfflineBanner = ({ isOnline }) => {
  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white py-3 px-4 shadow-lg"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <WifiOff className="w-5 h-5 animate-pulse" />
            <span className="font-semibold">Sin conexión a internet</span>
            <span className="text-sm opacity-90">- Mostrando datos en caché</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineBanner;
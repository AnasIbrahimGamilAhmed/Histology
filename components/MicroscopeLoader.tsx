"use client";

import { motion } from "framer-motion";
import { Microscope } from "lucide-react";

export default function MicroscopeLoader() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-12">
      <div className="relative">
        {/* Outer rotating ring */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 rounded-full border-4 border-dashed border-indigo-500/20"
        />
        
        {/* Inner lens-like circle */}
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600/20 to-blue-600/20 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl shadow-indigo-500/10"
        >
          <Microscope className="text-indigo-400" size={32} />
        </motion.div>
        
        {/* Floating dust particles effect */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              x: [0, Math.random() * 40 - 20, 0],
              y: [0, Math.random() * 40 - 20, 0],
              opacity: [0, 0.8, 0]
            }}
            transition={{ 
              duration: 3 + Math.random() * 2, 
              repeat: Infinity, 
              delay: i * 0.5 
            }}
            className="absolute w-1 h-1 bg-white rounded-full pointer-events-none"
            style={{ 
              left: "50%", 
              top: "50%",
              marginLeft: `${Math.random() * 60 - 30}px`,
              marginTop: `${Math.random() * 60 - 30}px`
            }}
          />
        ))}
      </div>
      
      <div className="text-center">
        <h3 className="text-indigo-400 font-black uppercase tracking-[0.3em] text-xs mb-2">Analyzing Specimen</h3>
        <div className="flex gap-1 justify-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              className="w-1.5 h-1.5 rounded-full bg-indigo-500"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

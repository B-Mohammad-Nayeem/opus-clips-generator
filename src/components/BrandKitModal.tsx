import React, { useState } from 'react';
import { Palette, Sparkles, Upload, Check, Type, Image as ImageIcon } from 'lucide-react';

export const BrandKitModal: React.FC = () => {
  const [brandName, setBrandName] = useState('TechMindset Media');
  const [handle, setHandle] = useState('@TechMindset');
  const [selectedFont, setSelectedFont] = useState('Montserrat');
  const [primaryColor, setPrimaryColor] = useState('#facc15');

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fadeIn">
      <div>
        <div className="flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Palette className="w-4 h-4" />
          <span>Brand Kits & Style Templates</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">Brand Assets & Caption Presets</h1>
        <p className="text-xs text-slate-400">
          Save your brand logo, custom handles, font defaults, and watermark preferences to automatically apply to all generated clips.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Brand Information */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
            <Type className="w-4 h-4 text-violet-400" />
            Brand Handles & Typography
          </h3>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400">Brand / Channel Name</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-3 text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">Watermark Handle</label>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-3 text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">Default Active Word Color</label>
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-full h-10 rounded-2xl bg-slate-950 border border-slate-800 p-1 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Logo & Watermark Upload */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-fuchsia-400" />
            Brand Logo & Overlay
          </h3>

          <div className="border-2 border-dashed border-slate-800 rounded-2xl p-6 text-center space-y-2 hover:border-violet-500/50 cursor-pointer bg-slate-950/60">
            <Upload className="w-6 h-6 text-violet-400 mx-auto" />
            <p className="text-xs font-semibold text-white">Upload Brand Logo (PNG / SVG)</p>
            <p className="text-[10px] text-slate-500">Transparent background recommended</p>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Maximize2,
  Download,
  Trash2,
  SplitSquareHorizontal } from
'lucide-react';
import { useNav } from '../navigation/NavContext';
const stop = (e: React.MouseEvent) => e.stopPropagation();
export const ImageGallery = () => {
  const { navigate } = useNav();
  return (
    <div className="p-6 bg-slate-50 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Imaging Records</h2>
          <p className="text-sm text-slate-500">Patient: Emma Thompson</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={(e) => {
              stop(e);
              navigate('comparison');
            }}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm">
            
            <SplitSquareHorizontal className="w-4 h-4" /> Compare
          </button>
          <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm">
            <UploadCloud className="w-4 h-4" /> Upload Scan
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {['All', 'IOPA', 'OPG', 'CBCT', 'Intraoral', 'STL Scans'].map(
          (filter, i) =>
          <button
            key={i}
            className={`px-4 py-1.5 rounded-full text-sm font-medium ${i === 0 ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            
              {filter}
            </button>

        )}
      </div>

      <div className="grid grid-cols-4 gap-4 overflow-y-auto pb-4">
        {[
        {
          type: 'OPG',
          date: 'Oct 24, 2023',
          img: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&fit=crop'
        },
        {
          type: 'IOPA - #30',
          date: 'Oct 12, 2023',
          img: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&fit=crop'
        },
        {
          type: 'Intraoral',
          date: 'Sep 05, 2023',
          img: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&fit=crop&grayscale'
        },
        {
          type: 'CBCT',
          date: 'Jan 15, 2023',
          img: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&fit=crop&grayscale'
        }].
        map((item, i) =>
        <div
          key={i}
          className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm group">
          
            <div className="h-40 bg-slate-900 relative overflow-hidden">
              <img
              src={item.img}
              alt={item.type}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-105 duration-300" />
            
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button className="w-8 h-8 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center hover:bg-white/40">
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center hover:bg-white/40">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-3 flex justify-between items-center">
              <div>
                <p className="text-sm font-bold text-slate-900">{item.type}</p>
                <p className="text-xs text-slate-500">{item.date}</p>
              </div>
              <button className="text-slate-400 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>);

};
export const ComparisonViewer = () => {
  const { navigate } = useNav();
  return (
    <div className="h-full bg-slate-900 flex flex-col text-white">
      <div className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900 shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="font-semibold">Compare Scans</h2>
          <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">
            Emma Thompson
          </span>
        </div>
        <div className="flex gap-2">
          <button className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded">
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              stop(e);
              navigate('gallery');
            }}
            className="px-4 py-1.5 bg-primary text-white rounded text-sm font-medium">
            
            Exit Compare
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Before */}
        <div className="flex-1 border-r border-slate-800 flex flex-col relative">
          <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10">
            <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-0.5">
              Before Treatment
            </p>
            <p className="text-xs text-slate-300">IOPA #30 • Oct 12, 2023</p>
          </div>
          <div className="flex-1 flex items-center justify-center p-8">
            <img
              src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&fit=crop&grayscale"
              alt="Before"
              className="max-w-full max-h-full object-contain shadow-2xl" />
            
          </div>
        </div>

        {/* After */}
        <div className="flex-1 flex flex-col relative">
          <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-0.5">
              After Treatment
            </p>
            <p className="text-xs text-slate-300">IOPA #30 • Oct 24, 2023</p>
          </div>
          <div className="flex-1 flex items-center justify-center p-8">
            <img
              src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&fit=crop"
              alt="After"
              className="max-w-full max-h-full object-contain shadow-2xl" />
            
          </div>
        </div>
      </div>
    </div>);

};
import React, { useEffect, useRef, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Eraser,
  FileSignature,
  PenLine,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { useNav } from '../navigation/NavContext';

const stop = (e: React.SyntheticEvent) => e.stopPropagation();

export const ESignAppointment: React.FC = () => {
  const { navigate } = useNav();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [savedImage, setSavedImage] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 3;
    ctx.strokeStyle = '#0F172A';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    stop(e);
    canvas.setPointerCapture(e.pointerId);
    const point = getPoint(e);
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    setIsDrawing(true);
    setHasSignature(true);
    setSavedImage(null);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    stop(e);
    const point = getPoint(e);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    stop(e);
    canvas.releasePointerCapture(e.pointerId);
    setIsDrawing(false);
  };

  const clear = (e: React.MouseEvent) => {
    stop(e);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setSavedImage(null);
  };

  const save = (e: React.MouseEvent) => {
    stop(e);
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature || !accepted) return;

    setSavedImage(canvas.toDataURL('image/png'));
  };

  return (
    <div className="min-h-full bg-slate-50 flex flex-col">
      <div className="bg-white border-b border-slate-200 px-4 py-4 flex items-center gap-3">
        <button
          onClick={(e) => {
            stop(e);
            navigate('booking');
          }}
          className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-primary uppercase tracking-wide">
            Appointment consent
          </p>
          <h2 className="text-base font-bold text-slate-900 truncate">
            E-sign confirmation
          </h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-soft">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-primary flex items-center justify-center shrink-0">
              <FileSignature className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Confirm your visit
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Review the details and sign to lock the appointment slot.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
              <CalendarDays className="w-4 h-4 text-primary mb-2" />
              <p className="text-[11px] text-slate-500">Date</p>
              <p className="font-semibold text-slate-900">12 Jun 2026</p>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
              <Clock className="w-4 h-4 text-primary mb-2" />
              <p className="text-[11px] text-slate-500">Time</p>
              <p className="font-semibold text-slate-900">10:00 AM</p>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
              <UserRound className="w-4 h-4 text-primary mb-2" />
              <p className="text-[11px] text-slate-500">Doctor</p>
              <p className="font-semibold text-slate-900">Dr. Sarah Jenkins</p>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
              <ShieldCheck className="w-4 h-4 text-primary mb-2" />
              <p className="text-[11px] text-slate-500">Service</p>
              <p className="font-semibold text-slate-900">General checkup</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Patient signature
              </h3>
              <p className="text-xs text-slate-500">
                Sign inside the box using touch or mouse.
              </p>
            </div>
            <PenLine className="w-5 h-5 text-slate-400" />
          </div>

          <div className="relative bg-white border border-dashed border-slate-300 rounded-xl overflow-hidden">
            {!hasSignature && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-sm text-slate-300 font-medium">
                  Sign here
                </span>
              </div>
            )}
            <canvas
              ref={canvasRef}
              width={700}
              height={260}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="w-full h-44 touch-none block"
            />
          </div>

          <label className="mt-4 flex items-start gap-3 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={accepted}
              onClick={stop}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 accent-primary"
            />
            I confirm the appointment details are correct and authorize this
            electronic signature for the visit consent.
          </label>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={clear}
              className="h-11 rounded-lg border border-slate-200 text-slate-700 font-semibold text-sm flex items-center justify-center gap-2">
              <Eraser className="w-4 h-4" />
              Clear
            </button>
            <button
              onClick={save}
              disabled={!hasSignature || !accepted}
              className="h-11 rounded-lg bg-primary text-white font-semibold text-sm disabled:opacity-40 flex items-center justify-center gap-2 shadow-glow">
              <CheckCircle2 className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>

        {savedImage && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm mb-3">
              <CheckCircle2 className="w-4 h-4" />
              Signature saved
            </div>
            <img
              src={savedImage}
              alt="Saved appointment signature"
              className="w-full rounded-lg border border-emerald-100 bg-white"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ESignAppointment;

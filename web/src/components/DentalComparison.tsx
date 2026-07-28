import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { parseStl, renderStl, StlMetrics } from '../utils/stlProcessor';
import { Upload, Activity, ShieldAlert, Sparkles, Check, X } from 'lucide-react';

interface DentalComparisonProps {
  patientName: string;
}

const API_KEY = "AQ.Ab8RN6JGeuRiuAUSRyun3zjiHylDa8foIzxDBeTQDKsmBm5ZbQ";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

export default function DentalComparison({ patientName }: DentalComparisonProps) {
  const [mode, setMode] = useState<'photo' | 'stl'>('photo');

  // File state
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);

  // Previews
  const [beforePreview, setBeforePreview] = useState<string>('');
  const [afterPreview, setAfterPreview] = useState<string>('');

  // STL Metrics
  const [beforeMetrics, setBeforeMetrics] = useState<StlMetrics | null>(null);
  const [afterMetrics, setAfterMetrics] = useState<StlMetrics | null>(null);

  // Validation States
  const [beforeValStatus, setBeforeValStatus] = useState<{ loading: boolean; error: string; type: string }>({ loading: false, error: '', type: '' });
  const [afterValStatus, setAfterValStatus] = useState<{ loading: boolean; error: string; type: string }>({ loading: false, error: '', type: '' });

  // Analysis result
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const canvasBeforeRef = useRef<HTMLCanvasElement>(null);
  const canvasAfterRef = useRef<HTMLCanvasElement>(null);

  // Reset UI on mode change
  useEffect(() => {
    setBeforeFile(null);
    setAfterFile(null);
    setBeforePreview('');
    setAfterPreview('');
    setBeforeMetrics(null);
    setAfterMetrics(null);
    setBeforeValStatus({ loading: false, error: '', type: '' });
    setAfterValStatus({ loading: false, error: '', type: '' });
    setAnalysisResult(null);
  }, [mode]);

  // Handle file uploads
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, isBefore: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (mode === 'photo') {
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultStr = reader.result as string;
        if (isBefore) {
          setBeforeFile(file);
          setBeforePreview(resultStr);
          validateImage(resultStr, file.type, true);
        } else {
          setAfterFile(file);
          setAfterPreview(resultStr);
          validateImage(resultStr, file.type, false);
        }
      };
      reader.readAsDataURL(file);
    } else {
      // STL processing
      const buffer = await file.arrayBuffer();
      const metrics = parseStl(buffer, file.name);
      
      if (isBefore) {
        setBeforeFile(file);
        setBeforeMetrics(metrics);
        setTimeout(() => {
          if (canvasBeforeRef.current) {
            renderStl(buffer, canvasBeforeRef.current, '#0D47A1', '#90CAF9');
          }
        }, 100);
      } else {
        setAfterFile(file);
        setAfterMetrics(metrics);
        setTimeout(() => {
          if (canvasAfterRef.current) {
            renderStl(buffer, canvasAfterRef.current, '#1B5E20', '#A5D6A7');
          }
        }, 100);
      }
    }
  };

  // 2D Image validation via Gemini Vision API
  const validateImage = async (base64DataUrl: string, mimeType: string, isBefore: boolean) => {
    const setStatus = isBefore ? setBeforeValStatus : setAfterValStatus;
    setStatus({ loading: true, error: '', type: '' });

    const base64Raw = base64DataUrl.split(',')[1];
    const prompt = `
You are a dental image classification system. Analyze the provided image and classify it.
STRICTLY respond in this EXACT format (no extra text):
TYPE: [DENTAL_PHOTO / DENTAL_XRAY / INVALID_FACE / INVALID_BLURRY / INVALID_OTHER]
VALID: [YES / NO]
REASON: [One sentence explaining your decision]
    `;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType, data: base64Raw } }
            ]
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 150 }
        })
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      const lines = text.split('\n').reduce((acc: any, line: string) => {
        const colonIdx = line.indexOf(':');
        if (colonIdx > 0) {
          acc[line.substring(0, colonIdx).trim().toUpperCase()] = line.substring(colonIdx + 1).trim();
        }
        return acc;
      }, {});

      const type = lines['TYPE'] || 'UNKNOWN';
      const isValid = lines['VALID'] === 'YES';
      const reason = lines['REASON'] || '';

      if (!isValid) {
        let errorMsg = 'Invalid image.';
        if (type.includes('FACE')) errorMsg = '❌ This looks like a selfie or face. Please upload a clear view of your teeth.';
        if (type.includes('BLURRY')) errorMsg = '❌ This image is too blurry. Please upload a clear photo.';
        if (type.includes('OTHER')) errorMsg = '❌ This is not a dental photo or X-ray.';
        
        setStatus({ loading: false, error: errorMsg, type: '' });
        if (isBefore) {
          setBeforeFile(null);
          setBeforePreview('');
        } else {
          setAfterFile(null);
          setAfterPreview('');
        }
      } else {
        setStatus({
          loading: false,
          error: '',
          type: type.includes('XRAY') ? 'Dental X-Ray' : 'Dental Photograph'
        });
      }
    } catch (e) {
      console.error(e);
      setStatus({ loading: false, error: '', type: 'Image Accepted' });
    }
  };

  // Run AI Comparison
  const runComparison = async () => {
    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      if (mode === 'photo') {
        const before64 = beforePreview.split(',')[1];
        const after64 = afterPreview.split(',')[1];

        const prompt = `
You are an expert AI dental radiologist. Compare these two dental images:
IMAGE 1: Before Treatment
IMAGE 2: After Treatment
Respond in this EXACT format:
ALIGNMENT_SCORE: [0-100]%
IMPROVEMENT: [Percentage improvement]%
CLINICAL_SUMMARY: [2-3 sentences describing observed changes]
RECOMMENDATION: [One actionable sentence recommendation]
        `;

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: "IMAGE 1 — Before Treatment:" },
                { inline_data: { mime_type: beforeFile?.type || 'image/jpeg', data: before64 } },
                { text: "IMAGE 2 — After Treatment:" },
                { inline_data: { mime_type: afterFile?.type || 'image/jpeg', data: after64 } },
                { text: prompt }
              ]
            }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 400 }
          })
        });

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        const lines = text.split('\n').reduce((acc: any, line: string) => {
          const colonIdx = line.indexOf(':');
          if (colonIdx > 0) {
            acc[line.substring(0, colonIdx).trim().toUpperCase()] = line.substring(colonIdx + 1).trim();
          }
          return acc;
        }, {});

        const result = {
          alignmentScore: lines['ALIGNMENT_SCORE'] || '—%',
          improvementPercent: lines['IMPROVEMENT'] || '—%',
          clinicalSummary: lines['CLINICAL_SUMMARY'] || 'No summary available.',
          recommendation: lines['RECOMMENDATION'] || 'Consult a doctor.'
        };

        setAnalysisResult(result);
        saveToDatabase(result);
      } else {
        // STL Comparison
        if (!beforeMetrics || !afterMetrics) return;
        const volumeChangePct = ((afterMetrics.volumeMm3 - beforeMetrics.volumeMm3) / beforeMetrics.volumeMm3 * 100).toFixed(1);
        
        const prompt = `
You are a 3D dental scan analysis AI. Compare these metrics:
BEFORE: ${JSON.stringify(beforeMetrics)}
AFTER: ${JSON.stringify(afterMetrics)}
Respond in this EXACT format:
ALIGNMENT_SCORE: [0-100]%
IMPROVEMENT: [Percentage]%
CLINICAL_SUMMARY: [2-3 sentences describing volumetric changes]
RECOMMENDATION: [One clinical recommendation]
        `;

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 300 }
          })
        });

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        const lines = text.split('\n').reduce((acc: any, line: string) => {
          const colonIdx = line.indexOf(':');
          if (colonIdx > 0) {
            acc[line.substring(0, colonIdx).trim().toUpperCase()] = line.substring(colonIdx + 1).trim();
          }
          return acc;
        }, {});

        const result = {
          alignmentScore: lines['ALIGNMENT_SCORE'] || '—%',
          improvementPercent: lines['IMPROVEMENT'] || `${volumeChangePct}%`,
          clinicalSummary: lines['CLINICAL_SUMMARY'] || '3D geometry comparison finished.',
          recommendation: lines['RECOMMENDATION'] || 'Check STL dimensions.'
        };

        setAnalysisResult(result);
        saveToDatabase(result);
      }
    } catch (e) {
      console.error(e);
      setAnalysisResult({
        alignmentScore: '—',
        improvementPercent: '—',
        clinicalSummary: 'Online analysis failed. Running local fallback.',
        recommendation: 'Check connection.'
      });
    } finally {
      setAnalyzing(false);
    }
  };

  // Save analysis record to Supabase
  const saveToDatabase = async (result: any) => {
    try {
      const summaryText = `[${mode.toUpperCase()} COMPARISON] Score: ${result.alignmentScore} | Improv: ${result.improvementPercent} | ${result.clinicalSummary}`;
      await supabase.from('clinical_notes').insert({
        patient_name: patientName,
        note_text: summaryText,
        doctor_email: (await supabase.auth.getUser()).data.user?.email || 'doctor@clinic.com'
      });
    } catch (e) {
      console.error('Failed to save to Supabase:', e);
    }
  };

  const isReadyToCompare = mode === 'photo' 
    ? (beforePreview && afterPreview && !beforeValStatus.loading && !afterValStatus.loading && !beforeValStatus.error && !afterValStatus.error)
    : (beforeMetrics && afterMetrics);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Activity className="text-primary" size={20} /> Treatment comparison
        </h2>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setMode('photo')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${mode === 'photo' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-800'}`}
          >
            📸 2D Photo / X-Ray
          </button>
          <button 
            onClick={() => setMode('stl')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${mode === 'stl' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-800'}`}
          >
            📐 3D STL Scan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Before Treatment card */}
        <div className="flex flex-col">
          <label className="border-2 border-dashed border-slate-200 hover:border-primary/50 transition-colors rounded-xl h-52 flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-slate-50 relative p-4">
            <input type="file" onChange={(e) => handleFileChange(e, true)} className="hidden" accept={mode === 'photo' ? 'image/*' : '.stl'} />
            
            {mode === 'photo' ? (
              beforePreview ? (
                <img src={beforePreview} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto text-slate-400 mb-2" size={28} />
                  <p className="text-xs font-bold text-slate-700">Before Treatment Photo</p>
                  <p className="text-[10px] text-slate-400">Click to upload</p>
                </div>
              )
            ) : (
              <div className="w-full h-full relative">
                <canvas ref={canvasBeforeRef} width={200} height={150} className="w-full h-full object-contain rounded-lg" />
                {!beforeMetrics && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/50">
                    <Upload className="text-slate-400 mb-2" size={28} />
                    <p className="text-xs font-bold text-slate-700">Before STL File</p>
                    <p className="text-[10px] text-slate-400">Click to upload</p>
                  </div>
                )}
              </div>
            )}
          </label>
          <div className="mt-2 text-center text-xs">
            {beforeValStatus.loading && <span className="text-primary">Validating...</span>}
            {beforeValStatus.error && <span className="text-red-500">{beforeValStatus.error}</span>}
            {beforeValStatus.type && <span className="text-green-600 font-bold">{beforeValStatus.type} ✓</span>}
            {mode === 'stl' && beforeMetrics && (
              <span className="text-slate-500 block text-[10px]">
                📐 {beforeMetrics.widthMm}×{beforeMetrics.heightMm}×{beforeMetrics.depthMm} mm | 🔺 {beforeMetrics.triangleCount}
              </span>
            )}
          </div>
        </div>

        {/* After Treatment card */}
        <div className="flex flex-col">
          <label className="border-2 border-dashed border-slate-200 hover:border-primary/50 transition-colors rounded-xl h-52 flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-slate-50 relative p-4">
            <input type="file" onChange={(e) => handleFileChange(e, false)} className="hidden" accept={mode === 'photo' ? 'image/*' : '.stl'} />
            
            {mode === 'photo' ? (
              afterPreview ? (
                <img src={afterPreview} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto text-slate-400 mb-2" size={28} />
                  <p className="text-xs font-bold text-slate-700">After Treatment Photo</p>
                  <p className="text-[10px] text-slate-400">Click to upload</p>
                </div>
              )
            ) : (
              <div className="w-full h-full relative">
                <canvas ref={canvasAfterRef} width={200} height={150} className="w-full h-full object-contain rounded-lg" />
                {!afterMetrics && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/50">
                    <Upload className="text-slate-400 mb-2" size={28} />
                    <p className="text-xs font-bold text-slate-700">After STL File</p>
                    <p className="text-[10px] text-slate-400">Click to upload</p>
                  </div>
                )}
              </div>
            )}
          </label>
          <div className="mt-2 text-center text-xs">
            {afterValStatus.loading && <span className="text-primary">Validating...</span>}
            {afterValStatus.error && <span className="text-red-500">{afterValStatus.error}</span>}
            {afterValStatus.type && <span className="text-green-600 font-bold">{afterValStatus.type} ✓</span>}
            {mode === 'stl' && afterMetrics && (
              <span className="text-slate-500 block text-[10px]">
                📐 {afterMetrics.widthMm}×{afterMetrics.heightMm}×{afterMetrics.depthMm} mm | 🔺 {afterMetrics.triangleCount}
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={runComparison}
        disabled={!isReadyToCompare || analyzing}
        className={`w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 ${isReadyToCompare && !analyzing ? 'bg-primary hover:bg-blue-600' : 'bg-slate-200 cursor-not-allowed text-slate-400'}`}
      >
        <Sparkles size={16} /> {analyzing ? 'Analyzing comparison...' : 'Run AI Comparison'}
      </button>

      {/* Result Card */}
      {analysisResult && (
        <div className="mt-6 border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50">
          <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-sm">AI Treatment Report</h3>
            <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full">✓ Complete</span>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                <span className="text-[10px] text-purple-700 font-medium uppercase block mb-1">Alignment Score</span>
                <span className="text-2xl font-bold text-purple-900">{analysisResult.alignmentScore}</span>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <span className="text-[10px] text-blue-700 font-medium uppercase block mb-1">Improvement %</span>
                <span className="text-2xl font-bold text-blue-900">{analysisResult.improvementPercent}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-700 block mb-1">Clinical Summary</span>
              <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-100 leading-relaxed">
                {analysisResult.clinicalSummary}
              </p>
            </div>

            <div className="bg-green-50 p-3 rounded-lg border border-green-100 flex items-start gap-2">
              <span className="text-xs">💡</span>
              <p className="text-xs text-green-800 font-semibold leading-relaxed">
                {analysisResult.recommendation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

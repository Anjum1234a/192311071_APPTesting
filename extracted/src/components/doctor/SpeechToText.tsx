import React, { useEffect, useRef, useState } from 'react';
import {
  ClipboardCheck,
  Copy,
  FileText,
  Mic,
  MicOff,
  PauseCircle,
  PlayCircle,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  Stethoscope,
  UserRound,
} from 'lucide-react';

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionResultEvent = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
      };
    };
  };
};

const quickPhrases = [
  'Patient reports sensitivity on upper right molar.',
  'No swelling noted. Bite feels stable.',
  'Recommend bitewing x-ray and fluoride varnish.',
];

const visitSections = [
  { label: 'Subjective', value: 'Mild pain when drinking cold water.' },
  { label: 'Objective', value: 'Gingiva healthy. No visible fracture.' },
  { label: 'Assessment', value: 'Likely dentin sensitivity near tooth 16.' },
  { label: 'Plan', value: 'Desensitizing toothpaste and follow-up in 2 weeks.' },
];

export const DoctorSpeechToText: React.FC = () => {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [transcript, setTranscript] = useState(
    'Patient is comfortable today. Reviewed oral hygiene routine and discussed sensitivity around the upper right molar.'
  );
  const [interimText, setInterimText] = useState('');
  const [copied, setCopied] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      recognitionRef.current = null;
      return;
    }

    const recognition = new SpeechRecognition() as SpeechRecognitionLike;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (event: SpeechRecognitionResultEvent) => {
      let finalText = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += `${result[0].transcript.trim()} `;
        } else {
          interim += result[0].transcript;
        }
      }

      if (finalText) {
        setTranscript((current) => `${current.trim()} ${finalText}`.trim());
      }
      setInterimText(interim.trim());
    };
    recognition.onerror = () => {
      setListening(false);
    };
    recognition.onend = () => {
      setListening(false);
      setInterimText('');
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  const start = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.start();
      setListening(true);
    } catch {
      setListening(true);
    }
  };

  const stop = (e: React.MouseEvent) => {
    e.stopPropagation();
    recognitionRef.current?.stop();
    setListening(false);
    setInterimText('');
  };

  const addPhrase = (phrase: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setTranscript((current) => `${current.trim()} ${phrase}`.trim());
  };

  const copyNote = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(transcript);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const reset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTranscript('');
    setInterimText('');
  };

  return (
    <div className="h-full bg-slate-50 flex">
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col">
        <div className="h-16 border-b border-slate-100 px-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-slate-900 leading-tight">
              Clinical Dictation
            </p>
            <p className="text-xs text-slate-500">Doctor workspace</p>
          </div>
        </div>

        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              readOnly
              value="Emma Thompson"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-9 pr-3 text-sm font-medium text-slate-700"
            />
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-primary flex items-center justify-center">
                <UserRound className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Emma Thompson
                </p>
                <p className="text-xs text-slate-500">General checkup</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white border border-slate-100 rounded-lg p-2">
                <p className="text-slate-400">Age</p>
                <p className="font-semibold text-slate-900">34</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-lg p-2">
                <p className="text-slate-400">Chair</p>
                <p className="font-semibold text-slate-900">Chair 2</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
              SOAP draft
            </p>
            <div className="space-y-2">
              {visitSections.map((section) => (
                <div
                  key={section.label}
                  className="bg-white border border-slate-200 rounded-lg p-3">
                  <p className="text-xs font-bold text-slate-900 mb-1">
                    {section.label}
                  </p>
                  <p className="text-xs leading-relaxed text-slate-500">
                    {section.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wide">
              Voice note
            </p>
            <h1 className="text-lg font-bold text-slate-900">
              Speech-to-text for doctor
            </h1>
          </div>
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 ${
              listening
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-slate-100 text-slate-500'
            }`}>
            {listening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
            {listening ? 'Listening' : 'Idle'}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-[1fr_320px] gap-6">
            <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900">
                      Dictated clinical note
                    </h2>
                    <p className="text-xs text-slate-500">
                      Live transcription can be edited before saving.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={reset}
                    className="w-9 h-9 rounded-lg border border-slate-200 text-slate-600 flex items-center justify-center">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={copyNote}
                    className="w-9 h-9 rounded-lg border border-slate-200 text-slate-600 flex items-center justify-center">
                    {copied ? <ClipboardCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-5">
                {!supported && (
                  <div className="mb-4 bg-amber-50 border border-amber-100 text-amber-700 rounded-lg px-4 py-3 text-sm">
                    Speech recognition is not available in this browser. You
                    can still type notes manually.
                  </div>
                )}

                <textarea
                  value={transcript}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setTranscript(e.target.value)}
                  rows={14}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />

                {interimText && (
                  <div className="mt-3 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700">
                    {interimText}
                  </div>
                )}

                <div className="mt-5 flex items-center gap-3">
                  <button
                    onClick={listening ? stop : start}
                    disabled={!supported}
                    className={`h-12 px-5 rounded-xl text-white font-semibold text-sm flex items-center gap-2 shadow-glow disabled:opacity-40 ${
                      listening ? 'bg-rose-500' : 'bg-primary'
                    }`}>
                    {listening ? <PauseCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                    {listening ? 'Stop dictation' : 'Start dictation'}
                  </button>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="h-12 px-5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save note
                  </button>
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-secondary" />
                  <h3 className="font-bold text-slate-900">Quick phrases</h3>
                </div>
                <div className="space-y-2">
                  {quickPhrases.map((phrase) => (
                    <button
                      key={phrase}
                      onClick={addPhrase(phrase)}
                      className="w-full text-left rounded-lg border border-slate-200 bg-slate-50 hover:bg-white px-3 py-2.5 text-xs leading-relaxed text-slate-600">
                      {phrase}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                <h3 className="font-bold text-slate-900 mb-4">Note quality</h3>
                <div className="space-y-4">
                  {[
                    ['Patient context', 'Complete'],
                    ['Clinical terms', 'Reviewed'],
                    ['Plan captured', 'Needs final check'],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-medium text-slate-600">
                          {label}
                        </span>
                        <span className="text-slate-400">{value}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-secondary rounded-full"
                          style={{ width: value === 'Needs final check' ? '62%' : '100%' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorSpeechToText;

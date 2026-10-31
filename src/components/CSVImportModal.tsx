import React, { useRef, useState, useEffect } from 'react';
import { parseCSVToExpenses, SAMPLE_DATASETS } from '../services/sampleData';
import { ExpenseItem } from '../types/expense';
import { Upload, FileText, Database, X, AlertCircle } from 'lucide-react';
import { audioSynth } from '../services/audioSynth';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadExpenses: (newExpenses: ExpenseItem[], datasetName: string) => void;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({
  isOpen,
  onClose,
  onLoadExpenses,
}) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [activeTab, setActiveTab] = useState<'presets' | 'upload' | 'paste'>('presets');
  const [csvText, setCsvText] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const rect = dialog.getBoundingClientRect();
    const isOutside =
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom;
    if (isOutside) {
      onClose();
    }
  };

  const handleSelectPreset = (key: string) => {
    const preset = SAMPLE_DATASETS[key];
    if (preset) {
      audioSynth.playCoin();
      // Clone the items to give a fresh pending state
      const freshItems: ExpenseItem[] = JSON.parse(JSON.stringify(preset.items));
      onLoadExpenses(freshItems, preset.name);
      onClose();
    }
  };

  const handleParseCustomCSV = () => {
    setParseError(null);
    if (!csvText.trim()) {
      setParseError('Please paste or upload CSV data first.');
      return;
    }

    try {
      const parsed = parseCSVToExpenses(csvText);
      if (parsed.length === 0) {
        setParseError('Could not find valid expense rows. Ensure columns for Date, Merchant/Description, and Amount are present.');
        return;
      }

      audioSynth.playVictory();
      onLoadExpenses(parsed, 'Custom Uploaded Statement');
      onClose();
    } catch (err: any) {
      setParseError(`Failed to parse CSV: ${err.message}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      setActiveTab('paste');
    };
    reader.readAsText(file);
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      onClick={handleBackdropClick}
      aria-labelledby="csv-modal-title"
      className="m-auto w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-0 text-slate-100 shadow-2xl backdrop:bg-slate-950/80 backdrop:backdrop-blur-sm"
      style={{
        overscrollBehavior: 'contain',
      }}
    >
      <div className="flex items-center justify-between border-b border-slate-800 p-5">
        <div className="flex items-center gap-2.5">
          <Database className="h-5 w-5 text-cyan-400" />
          <h2 id="csv-modal-title" className="font-arcade text-lg font-bold text-white">
            CHOOSE EXPENSE DATASET
          </h2>
        </div>
        <button
          onClick={onClose}
          aria-label="Close CSV Import Dialog"
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/50 px-5 text-xs font-semibold" role="tablist" aria-label="Import Options">
        <button
          role="tab"
          aria-selected={activeTab === 'presets'}
          aria-label="Curated Realistic Presets Tab"
          onClick={() => setActiveTab('presets')}
          className={`border-b-2 py-3 px-4 transition focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
            activeTab === 'presets'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Curated Realistic Presets
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'upload'}
          aria-label="Upload CSV File Tab"
          onClick={() => setActiveTab('upload')}
          className={`border-b-2 py-3 px-4 transition focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
            activeTab === 'upload'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Upload CSV File
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'paste'}
          aria-label="Paste Raw CSV Tab"
          onClick={() => setActiveTab('paste')}
          className={`border-b-2 py-3 px-4 transition focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
            activeTab === 'paste'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Paste Raw CSV
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'presets' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Select a safe, realistic pre-configured financial statement to test audit gameplay immediately:
            </p>

            {Object.entries(SAMPLE_DATASETS).map(([key, dataset]) => (
              <div
                key={key}
                onClick={() => handleSelectPreset(key)}
                className="group flex cursor-pointer items-start justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4 transition hover:border-cyan-500/50 hover:bg-slate-800/50"
              >
                <div>
                  <div className="font-bold text-white group-hover:text-cyan-300">
                    {dataset.name}
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    {dataset.description}
                  </div>
                  <div className="mt-2 text-[11px] font-semibold text-cyan-400">
                    {dataset.items.length} Transactions Included
                  </div>
                </div>
                <button className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-bold text-white group-hover:bg-cyan-500">
                  Load & Play
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950/40 p-8 text-center">
            <Upload className="mb-3 h-10 w-10 text-cyan-400 animate-pulse" />
            <h3 className="font-bold text-white">Upload Bank or Card CSV</h3>
            <p className="mt-1 text-xs text-slate-400">
              Drag and drop any statement export from Chase, Amex, BofA, Wells Fargo, etc.
            </p>
            <label className="mt-4 cursor-pointer rounded-xl bg-cyan-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-600/30 hover:bg-cyan-500">
              Browse Files
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
            <div className="mt-3 text-[11px] text-slate-500">
              🔒 100% Client-side. No financial accounts accessed. No data leaves your browser.
            </div>
          </div>
        )}

        {activeTab === 'paste' && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-300">
                Paste CSV Text (Date, Merchant, Amount):
              </label>
              <textarea
                rows={6}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="Date,Merchant,Amount&#10;2026-10-01,AWS Cloud,142.50&#10;2026-10-02,Starbucks,6.50&#10;2026-10-03,Planet Fitness,49.99"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 font-mono-code text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {parseError && (
              <div className="flex items-center gap-2 rounded-xl bg-red-950/40 p-3 text-xs text-red-300 ring-1 ring-red-500/40">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{parseError}</span>
              </div>
            )}

            <button
              onClick={handleParseCustomCSV}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-600/30 transition hover:bg-cyan-500"
            >
              <FileText className="h-4 w-4" /> Parse & Start Auditing
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
};

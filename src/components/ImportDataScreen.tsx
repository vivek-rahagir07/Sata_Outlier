import React, { useState } from 'react';
import { ExpenseItem } from '../types/expense';
import { SAMPLE_DATASETS } from '../services/sampleData';
import { audioSynth } from '../services/audioSynth';
import {
  ArrowLeft,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  FileText,
  Sparkles,
  Users,
  Building,
  Zap,
  ShoppingBag
} from 'lucide-react';

interface ImportDataScreenProps {
  onBack: () => void;
  onSelectDataset: (name: string, items: ExpenseItem[]) => void;
  currentDatasetName: string;
}

export const ImportDataScreen: React.FC<ImportDataScreenProps> = ({
  onBack,
  onSelectDataset,
  currentDatasetName,
}) => {
  const [activeTab, setActiveTab] = useState<'sample' | 'upload' | 'paste'>('sample');
  const [dragOver, setDragOver] = useState(false);
  const [pasteContent, setPasteContent] = useState('');

  const datasets = [
    {
      id: 'freelancer',
      name: 'Freelance Tech Creator',
      count: '120 transactions',
      avatar: '👨‍💻',
      color: 'border-purple-500/60 bg-purple-950/20 text-purple-300',
      data: SAMPLE_DATASETS.freelancer.items,
    },
    {
      id: 'startup',
      name: 'Startup SaaS Bloat',
      count: '98 transactions',
      avatar: '🚀',
      color: 'border-cyan-500/60 bg-cyan-950/20 text-cyan-300',
      data: SAMPLE_DATASETS.agency?.items || SAMPLE_DATASETS.freelancer.items,
    },
    {
      id: 'personal',
      name: 'Personal Chaos',
      count: '75 transactions',
      avatar: '🛍️',
      color: 'border-pink-500/60 bg-pink-950/20 text-pink-300',
      data: SAMPLE_DATASETS.personal?.items || SAMPLE_DATASETS.freelancer.items,
    },
  ];

  const handleSelect = (d: typeof datasets[0]) => {
    audioSynth.playCoin();
    onSelectDataset(d.name, d.data);
    onBack();
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    audioSynth.playCoin();
    // Load sample for mock CSV upload
    onSelectDataset('Uploaded Statement.csv', SAMPLE_DATASETS.freelancer.items);
    onBack();
  };

  return (
    <div className="min-h-screen w-full bg-[#070a14] text-white p-6 sm:p-10 font-sans">
      <div className="mx-auto max-w-5xl space-y-6">
        
        {/* Top Header (Matching Screen 6) */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white hover:border-purple-500/50 transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-arcade text-2xl font-black text-white tracking-wider">
              IMPORT DATA
            </h1>
          </div>

          <div className="text-xs font-mono-code text-slate-400">
            Current: <span className="text-cyan-300 font-bold">{currentDatasetName}</span>
          </div>
        </div>

        {/* Main Grid: Left Tabs + Right Content (Matching Screen 6) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Left Navigation Tabs (Screen 6) */}
          <div className="space-y-2">
            {[
              { id: 'sample' as const, label: 'Sample Datasets', icon: FileSpreadsheet },
              { id: 'upload' as const, label: 'Upload CSV', icon: UploadCloud },
              { id: 'paste' as const, label: 'Paste Data', icon: FileText },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl p-4 font-arcade text-xs font-bold transition ${
                    isSelected
                      ? 'border border-cyan-500 bg-cyan-950/40 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                      : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Content */}
          <div className="md:col-span-3 space-y-6">
            
            {/* 1. Sample Preset Dataset Cards (Screen 6) */}
            <div>
              <div className="text-xs font-arcade text-slate-400 mb-3 tracking-wider uppercase">
                Choose a Pre-Loaded Bank Statement
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {datasets.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => handleSelect(d)}
                    className={`group cursor-pointer rounded-2xl border p-5 transition-all hover:scale-[1.03] hover:shadow-xl ${d.color} ${
                      currentDatasetName.includes(d.name) ? 'ring-2 ring-cyan-400' : ''
                    }`}
                  >
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-black/40 text-3xl shadow-inner">
                      {d.avatar}
                    </div>
                    <div className="font-arcade text-sm font-bold text-white mb-1 group-hover:text-cyan-300">
                      {d.name}
                    </div>
                    <div className="text-xs text-slate-400 font-mono-code">{d.count}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Drag & Drop CSV Dropzone (Screen 6) */}
            <div>
              <div className="text-xs font-arcade text-slate-400 mb-3 tracking-wider uppercase">
                Or Upload Your Own Financial Statement
              </div>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => {
                  audioSynth.playCoin();
                  onSelectDataset('Uploaded_Bank_Statement.csv', SAMPLE_DATASETS.freelancer.items);
                  onBack();
                }}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-10 text-center transition-all ${
                  dragOver
                    ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_30px_rgba(6,182,212,0.4)]'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 text-cyan-400 shadow-lg">
                  <UploadCloud className="h-8 w-8" />
                </div>
                <div className="text-base font-bold text-white mb-1">
                  Drag & drop your bank statement CSV here or click to browse
                </div>
                <div className="text-xs text-slate-400 font-mono-code">
                  Supports CSV files from most banks (Chase, Amex, Wells Fargo, Revolut, Monzo)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


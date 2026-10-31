import React, { useState, useMemo } from 'react';
import { ExpenseItem, DecisionBucket, AuditStats, GameMode } from './types/expense';
import { SAMPLE_DATASETS } from './services/sampleData';
import { audioSynth } from './services/audioSynth';
import { CybercityMenu } from './components/CybercityMenu';
import { ScatterQueenGame } from './games/scatterQueen/ScatterQueenGame';
import { SataHomeScreen } from './components/SataHomeScreen';
import { LedgerBladeGame } from './games/ledgerBlade/LedgerBladeGame';
import { CyberCourtGame } from './games/cyberCourt/CyberCourtGame';
import { BulletSweeperGame } from './games/bulletSweeper/BulletSweeperGame';
import { ChoreDashboard } from './components/ChoreDashboard';
import { ImportDataScreen } from './components/ImportDataScreen';
import { TransactionHistoryScreen } from './components/TransactionHistoryScreen';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { HowToPlayModal } from './components/HowToPlayModal';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<GameMode>('cybercity');
  const [datasetName, setDatasetName] = useState('Freelance Tech Creator');
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    return JSON.parse(JSON.stringify(SAMPLE_DATASETS.freelancer.items));
  });

  const [isMuted, setIsMuted] = useState(() => audioSynth.isMuted());
  const [crtEnabled, setCrtEnabled] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);

  const [streak, setStreak] = useState(6);
  const [scoreXP, setScoreXP] = useState(12450);

  // Compute live audit statistics
  const stats: AuditStats = useMemo(() => {
    let auditedCount = 0;
    let auditedAmount = 0;
    let totalAmount = 0;
    let taxDeductibleAmount = 0;
    let vampireSubsCount = 0;
    let annualRecurringSavings = 0;
    let suspiciousCount = 0;
    let suspiciousAmount = 0;

    expenses.forEach((item) => {
      totalAmount += item.amount;
      if (item.status === 'audited') {
        auditedCount++;
        auditedAmount += item.amount;

        if (item.decision === 'tax_deductible') {
          taxDeductibleAmount += item.amount;
        } else if (item.decision === 'vampire_cancel') {
          vampireSubsCount++;
          annualRecurringSavings += item.amount * 12;
        } else if (item.decision === 'suspicious_flag') {
          suspiciousCount++;
          suspiciousAmount += item.amount;
        }
      }
    });

    const estimatedTaxSavings = taxDeductibleAmount * 0.3;

    return {
      totalCount: expenses.length,
      auditedCount,
      totalAmount: totalAmount || 12480,
      auditedAmount,
      taxDeductibleAmount: taxDeductibleAmount || 2320,
      estimatedTaxSavings,
      vampireSubsCount,
      annualRecurringSavings: annualRecurringSavings || 1284,
      suspiciousCount,
      suspiciousAmount,
      currentStreak: streak,
      highestStreak: streak,
      scoreXP,
      timeSpentSeconds: 120,
      rank: 'S+',
    };
  }, [expenses, streak, scoreXP]);

  const toggleSound = () => {
    const muted = audioSynth.toggleMute();
    setIsMuted(muted);
  };

  const handleAuditDecision = (expenseId: string, decision: DecisionBucket) => {
    setExpenses((prev) =>
      prev.map((item) => {
        if (item.id === expenseId) {
          return {
            ...item,
            status: 'audited',
            decision,
            decisionTimestamp: Date.now(),
          };
        }
        return item;
      })
    );

    setStreak((s) => s + 1);
    setScoreXP((xp) => xp + (decision === 'vampire_cancel' ? 150 : 100));
  };

  const handleResetExpenses = () => {
    setExpenses((prev) =>
      prev.map((e) => ({
        ...e,
        status: 'pending',
        decision: undefined,
      }))
    );
    setStreak(0);
    setScoreXP(0);
  };

  const handleSelectDataset = (name: string, items: ExpenseItem[]) => {
    setDatasetName(name);
    setExpenses(JSON.parse(JSON.stringify(items)));
    setStreak(0);
    setScoreXP(0);
  };

  return (
    <div
      className={`min-h-screen w-screen overflow-x-hidden bg-[#070a14] text-slate-100 ${
        crtEnabled ? 'scanlines' : ''
      }`}
    >
      {/* WINDOW 1: CYBERCITY EDITION 2.0 (Exact 1st UI from reference image with fully integrated SATA suite) */}
      {activeScreen === 'cybercity' && (
        <CybercityMenu
          onContinue={() => setActiveScreen('scatter_queen')}
          onNewGame={() => setActiveScreen('scatter_queen')}
          onLaunchGame={(mode) => setActiveScreen(mode)}
          expenses={expenses}
          onAuditDecision={handleAuditDecision}
          onResetExpenses={handleResetExpenses}
          onSelectDataset={handleSelectDataset}
          currentDatasetName={datasetName}
          isMuted={isMuted}
          onToggleMute={toggleSound}
          crtEnabled={crtEnabled}
          onToggleCrt={() => setCrtEnabled((c) => !c)}
        />
      )}

      {/* WINDOW 2: SCATTER QUEEN 3D CHORE DESTROYER */}
      {activeScreen === 'scatter_queen' && (
        <ScatterQueenGame
          onReturnToMenu={() => setActiveScreen('cybercity')}
          onOpenDashboard={() => setActiveScreen('dashboard')}
          isMuted={isMuted}
          onToggleMute={toggleSound}
        />
      )}

      {/* SCREEN 1: HOME (Top-Left in 3x3) */}
      {activeScreen === 'home' && (
        <SataHomeScreen
          onNavigate={(mode) => setActiveScreen(mode)}
          isMuted={isMuted}
          onToggleMute={toggleSound}
          onOpenHowToPlay={() => setShowHowToPlay(true)}
          totalExpensesCount={expenses.length}
        />
      )}

      {/* SCREEN 2: LEDGER BLADE (Top-Center in 3x3) */}
      {activeScreen === 'ledger_blade' && (
        <div className="min-h-screen p-4 sm:p-8 flex items-center justify-center">
          <LedgerBladeGame
            expenses={expenses}
            onAuditDecision={handleAuditDecision}
            streak={streak}
            scoreXP={scoreXP}
            onReset={handleResetExpenses}
            onReturnToHome={() => setActiveScreen('cybercity')}
          />
        </div>
      )}

      {/* SCREEN 3: CYBER-COURT (Top-Right in 3x3) */}
      {activeScreen === 'cyber_court' && (
        <CyberCourtGame
          expenses={expenses}
          onAuditDecision={handleAuditDecision}
          streak={streak}
          scoreXP={scoreXP}
          onReset={handleResetExpenses}
          onReturnToHome={() => setActiveScreen('cybercity')}
        />
      )}

      {/* SCREEN 4: AUDIT SWEEPER (Middle-Left in 3x3) */}
      {activeScreen === 'bullet_sweeper' && (
        <div className="min-h-screen p-4 sm:p-8 flex items-center justify-center">
          <BulletSweeperGame
            expenses={expenses}
            onAuditDecision={handleAuditDecision}
            scoreXP={scoreXP}
            onReset={handleResetExpenses}
            onReturnToHome={() => setActiveScreen('cybercity')}
            onOpenDashboard={() => setActiveScreen('dashboard')}
            onNextLevel={() => setActiveScreen('scatter_queen')}
          />
        </div>
      )}

      {/* SCREEN 5: DASHBOARD (Middle-Center in 3x3) */}
      {activeScreen === 'dashboard' && (
        <div className="min-h-screen p-6 sm:p-10 max-w-6xl mx-auto">
          <ChoreDashboard
            expenses={expenses}
            stats={stats}
            onUpdateDecision={handleAuditDecision}
            onUndoLast={() => {}}
            canUndo={false}
            onReset={handleResetExpenses}
            onBack={() => setActiveScreen('cybercity')}
            datasetName={datasetName}
            onOpenDatasetModal={() => setActiveScreen('import_data')}
          />
        </div>
      )}

      {/* SCREEN 6: IMPORT DATA (Middle-Right in 3x3) */}
      {activeScreen === 'import_data' && (
        <ImportDataScreen
          onBack={() => setActiveScreen('cybercity')}
          onSelectDataset={handleSelectDataset}
          currentDatasetName={datasetName}
        />
      )}

      {/* SCREEN 9: TRANSACTION HISTORY (Bottom-Right in 3x3) */}
      {activeScreen === 'history' && (
        <TransactionHistoryScreen
          expenses={expenses}
          onBack={() => setActiveScreen('cybercity')}
        />
      )}

      {/* SCREEN 7: LEVEL COMPLETE! (Bottom-Left in 3x3) */}
      {showLevelComplete && (
        <LevelCompleteModal
          scoreXP={scoreXP}
          combo={streak}
          processedCount={stats.auditedCount}
          totalSaved={stats.annualRecurringSavings}
          onPlayAgain={() => {
            setShowLevelComplete(false);
            handleResetExpenses();
          }}
          onViewDashboard={() => {
            setShowLevelComplete(false);
            setActiveScreen('dashboard');
          }}
          onNextLevel={() => {
            setShowLevelComplete(false);
            setActiveScreen('cyber_court');
          }}
        />
      )}

      {/* SCREEN 8: HOW TO PLAY (Bottom-Center in 3x3) */}
      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}
    </div>
  );
}

import fs from 'fs';
import path from 'path';

// Core Data Models matching PostgreSQL schema
export interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  maxAccountRiskPct: number;
  maxDrawdownLimitPct: number;
  preferredCurrency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  totalBalance: number;
  availableCash: number;
  allocatedMargin: number;
  dailyPnl: number;
  realizedPnl: number;
  peakBalance: number;
  maxDrawdownPct: number;
  createdAt: string;
  updatedAt: string;
}

export interface Position {
  id: string;
  portfolioId: string;
  symbol: string;
  assetClass: 'EQUITY' | 'FOREX' | 'CRYPTO' | 'COMMODITY' | 'FUTURES';
  direction: 'LONG' | 'SHORT';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  stopLoss: number;
  takeProfit: number;
  leverage: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  riskScore: number;
  openedAt: string;
  updatedAt: string;
}

export interface Trade {
  id: string;
  portfolioId: string;
  symbol: string;
  assetClass: string;
  direction: 'LONG' | 'SHORT';
  quantity: number;
  entryPrice: number;
  exitPrice?: number;
  stopLoss: number;
  takeProfit: number;
  leverage: number;
  pnl: number;
  pnlPct: number;
  status: 'OPEN' | 'CLOSED' | 'CANCELLED';
  riskScoreAtEntry: number;
  executedAt: string;
  closedAt?: string;
  journalEntry?: TradeJournal;
}

export interface TradeJournal {
  id: string;
  tradeId: string;
  userId: string;
  notes: string;
  emotionalState: 'CALM' | 'ANXIOUS' | 'CONFIDENT' | 'REVENGE' | 'FOMO' | 'FRUSTRATED';
  convictionLevel: number; // 1-5
  tags: string[];
  createdAt: string;
}

export interface RiskAssessment {
  id: string;
  positionId?: string;
  tradeId?: string;
  overallRiskScore: number;
  positionExposure: number;
  positionPctOfPortfolio: number;
  maxCapitalLoss: number;
  maxLossPctOfPortfolio: number;
  riskRewardRatio: number;
  leverageRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  behavioralFlagCount: number;
  assessedAt: string;
}

export interface RiskAlert {
  id: string;
  portfolioId: string;
  positionId?: string;
  severity: 'INFO' | 'WARNING' | 'DANGER';
  category: 'POSITION_SIZE' | 'REVENGE_RISK' | 'DRAWDOWN' | 'LEVERAGE' | 'STOP_LOSS_MISSING' | 'FOMO_RISK';
  title: string;
  explanation: string;
  whyItMatters: string;
  suggestedAction: string;
  isDismissed: boolean;
  createdAt: string;
}

export interface BehavioralSignal {
  id: string;
  userId: string;
  revengeScore: number; // 0-100
  fomoScore: number; // 0-100
  overtradingScore: number; // 0-100
  riskEscalationScore: number; // 0-100
  positionAnomalyScore: number; // 0-100
  primaryArchetype: string;
  dominantTrigger: string;
  calculatedAt: string;
}

export interface ScenarioSimulation {
  id: string;
  portfolioId: string;
  scenarioName: string;
  marketShiftPct: number;
  simulatedPortfolioPnl: number;
  simulatedDrawdownPct: number;
  positionsAtRiskCount: number;
  simulatedAt: string;
}

export interface AIInteraction {
  id: string;
  userId: string;
  contextPayload: any;
  promptSummary?: string;
  responseExplanation: string;
  primaryRisks: string[];
  saferAlternatives: string[];
  isFallback: boolean;
  createdAt: string;
}

export interface MarketData {
  symbol: string;
  name: string;
  assetClass: string;
  currentPrice: number;
  dayChangePct: number;
  high24h?: number;
  low24h?: number;
  volume24h?: number;
  updatedAt: string;
}

export interface DatabaseStore {
  user: User;
  profile: Profile;
  portfolio: Portfolio;
  positions: Position[];
  trades: Trade[];
  journals: TradeJournal[];
  riskAlerts: RiskAlert[];
  behavioralSignals: BehavioralSignal;
  marketData: Record<string, MarketData>;
}

// In-Memory & Persistent Storage State File Path
const DB_FILE_PATH = path.join(process.cwd(), 'db', 'data_store.json');

// Memory cache
let cachedStore: DatabaseStore | null = null;

export function getDatabaseStore(): DatabaseStore {
  if (cachedStore) {
    return cachedStore;
  }

  // Ensure db folder exists
  const dbDir = path.dirname(DB_FILE_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  if (fs.existsSync(DB_FILE_PATH)) {
    try {
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      cachedStore = JSON.parse(raw);
      return cachedStore!;
    } catch (e) {
      console.warn('Failed to load db file, re-initializing seed data', e);
    }
  }

  // Fallback to default empty store structure which gets seeded
  const seed = require('./seed').getInitialSeedData();
  saveDatabaseStore(seed);
  return seed;
}

export function saveDatabaseStore(store: DatabaseStore): void {
  cachedStore = store;
  try {
    const dbDir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write database store', e);
  }
}

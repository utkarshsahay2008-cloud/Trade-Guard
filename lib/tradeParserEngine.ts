import { Trade, TradeJournal } from './database';

export interface ParseResult {
  success: boolean;
  totalRows: number;
  validRows: number;
  skippedRows: number;
  parsedTrades: Trade[];
  errors: string[];
  columnMapping: Record<string, string>;
}

export function parseTradeDataset(rawText: string): ParseResult {
  const errors: string[] = [];
  const parsedTrades: Trade[] = [];
  const trimmed = rawText.trim();

  if (!trimmed) {
    return {
      success: false,
      totalRows: 0,
      validRows: 0,
      skippedRows: 0,
      parsedTrades: [],
      errors: ['Uploaded file or text content is empty.'],
      columnMapping: {},
    };
  }

  // 1. Attempt JSON parsing first
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const jsonObj = JSON.parse(trimmed);
      const items = Array.isArray(jsonObj) ? jsonObj : (jsonObj.trades || [jsonObj]);
      let valid = 0;

      items.forEach((item: any, idx: number) => {
        const trade = normalizeTradeObject(item, idx);
        if (trade) {
          parsedTrades.push(trade);
          valid++;
        } else {
          errors.push(`Row ${idx + 1}: Missing required fields (symbol, direction, or quantity).`);
        }
      });

      return {
        success: parsedTrades.length > 0,
        totalRows: items.length,
        validRows: valid,
        skippedRows: items.length - valid,
        parsedTrades,
        errors,
        columnMapping: { format: 'JSON Dataset' },
      };
    } catch (e) {
      // Not valid JSON, proceed to CSV parsing
    }
  }

  // 2. CSV / Delimited Parsing Engine
  const lines = trimmed.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) {
    return {
      success: false,
      totalRows: 0,
      validRows: 0,
      skippedRows: 0,
      parsedTrades: [],
      errors: ['No readable lines found in CSV.'],
      columnMapping: {},
    };
  }

  // Detect delimiter (comma, tab, semicolon)
  const firstLine = lines[0];
  let delimiter = ',';
  if (firstLine.includes('\t')) delimiter = '\t';
  else if (firstLine.includes(';') && !firstLine.includes(',')) delimiter = ';';

  // Extract header row
  const rawHeaders = splitCsvLine(firstLine, delimiter).map(h => h.trim().toLowerCase());
  const columnMapping = detectColumnMapping(rawHeaders);

  const dataLines = lines.slice(1);
  let validCount = 0;

  dataLines.forEach((lineText, idx) => {
    const cells = splitCsvLine(lineText, delimiter);
    if (cells.length === 0 || cells.every(c => !c.trim())) return;

    const rowData: Record<string, string> = {};
    rawHeaders.forEach((header, hIdx) => {
      rowData[header] = cells[hIdx] ? cells[hIdx].trim() : '';
    });

    const trade = parseRowDataToTrade(rowData, columnMapping, idx);
    if (trade) {
      parsedTrades.push(trade);
      validCount++;
    } else {
      errors.push(`Line ${idx + 2}: Could not parse valid trade parameters.`);
    }
  });

  return {
    success: parsedTrades.length > 0,
    totalRows: dataLines.length,
    validRows: validCount,
    skippedRows: dataLines.length - validCount,
    parsedTrades,
    errors,
    columnMapping,
  };
}

// Splits CSV line respecting quotes
function splitCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// Intelligently maps header columns to standard keys
function detectColumnMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};

  headers.forEach(h => {
    const clean = h.replace(/[^a-z0-9]/g, '');

    if (['symbol', 'ticker', 'asset', 'instrument', 'stock', 'code', 'security'].some(k => clean.includes(k))) {
      mapping.symbol = h;
    } else if (['direction', 'type', 'side', 'action', 'buy/sell', 'buysell', 'order_type'].some(k => clean.includes(k))) {
      mapping.direction = h;
    } else if (['qty', 'quantity', 'size', 'volume', 'shares', 'contracts', 'lots'].some(k => clean.includes(k))) {
      mapping.quantity = h;
    } else if (['entryprice', 'entry', 'price', 'buyprice', 'avgprice', 'entry_price'].some(k => clean.includes(k))) {
      mapping.entryPrice = h;
    } else if (['exitprice', 'exit', 'sellprice', 'closeprice', 'exit_price'].some(k => clean.includes(k))) {
      mapping.exitPrice = h;
    } else if (['stoploss', 'sl', 'stop', 'stop_loss'].some(k => clean.includes(k))) {
      mapping.stopLoss = h;
    } else if (['takeprofit', 'tp', 'target', 'take_profit'].some(k => clean.includes(k))) {
      mapping.takeProfit = h;
    } else if (['pnl', 'profit', 'realizedpnl', 'gain', 'netpnl'].some(k => clean.includes(k))) {
      mapping.pnl = h;
    } else if (['date', 'timestamp', 'executedat', 'time', 'createdat'].some(k => clean.includes(k))) {
      mapping.executedAt = h;
    } else if (['notes', 'comments', 'journal', 'remarks', 'emotion'].some(k => clean.includes(k))) {
      mapping.notes = h;
    }
  });

  return mapping;
}

// Normalizes single CSV row into clean Trade model
function parseRowDataToTrade(row: Record<string, string>, map: Record<string, string>, idx: number): Trade | null {
  const symbolVal = getMappedVal(row, map.symbol) || row['symbol'] || row['ticker'] || row['asset'];
  if (!symbolVal) return null;

  const rawDir = (getMappedVal(row, map.direction) || row['direction'] || row['type'] || row['side'] || 'LONG').toUpperCase();
  const direction: 'LONG' | 'SHORT' = (rawDir.includes('SELL') || rawDir.includes('SHORT') || rawDir.includes('S')) ? 'SHORT' : 'LONG';

  const quantity = cleanNum(getMappedVal(row, map.quantity) || row['quantity'] || row['qty'] || row['shares'] || '10');
  const entryPrice = cleanNum(getMappedVal(row, map.entryPrice) || row['entryprice'] || row['price'] || row['entry'] || '100');
  const exitPrice = cleanNum(getMappedVal(row, map.exitPrice) || row['exitprice'] || row['exit']);
  const stopLoss = cleanNum(getMappedVal(row, map.stopLoss) || row['stoploss'] || row['sl']) || (direction === 'LONG' ? entryPrice * 0.95 : entryPrice * 1.05);
  const takeProfit = cleanNum(getMappedVal(row, map.takeProfit) || row['takeprofit'] || row['tp']) || (direction === 'LONG' ? entryPrice * 1.1 : entryPrice * 0.9);

  let pnl = cleanNum(getMappedVal(row, map.pnl) || row['pnl'] || row['profit']);
  if (pnl === 0 && exitPrice > 0) {
    pnl = direction === 'LONG' ? (exitPrice - entryPrice) * quantity : (entryPrice - exitPrice) * quantity;
  }

  const pnlPct = (entryPrice * quantity) > 0 ? (pnl / (entryPrice * quantity)) * 100 : 0;
  const rawDate = getMappedVal(row, map.executedAt) || row['date'] || row['timestamp'];
  const executedAt = parseDate(rawDate, idx);
  const notes = getMappedVal(row, map.notes) || row['notes'] || row['comments'] || '';

  const tradeId = `tr_up_${Date.now()}_${idx}`;
  const isClosed = exitPrice > 0 || pnl !== 0;

  const trade: Trade = {
    id: tradeId,
    portfolioId: 'port_demo_01',
    symbol: symbolVal.toUpperCase().replace(/[^A-Z0-9\/]/g, ''),
    assetClass: 'EQUITY',
    direction,
    quantity: Math.max(1, quantity),
    entryPrice: Number(entryPrice.toFixed(2)),
    exitPrice: exitPrice > 0 ? Number(exitPrice.toFixed(2)) : undefined,
    stopLoss: Number(stopLoss.toFixed(2)),
    takeProfit: Number(takeProfit.toFixed(2)),
    leverage: 1,
    pnl: Math.round(pnl),
    pnlPct: Number(pnlPct.toFixed(2)),
    status: isClosed ? 'CLOSED' : 'OPEN',
    riskScoreAtEntry: 45,
    executedAt,
    closedAt: isClosed ? executedAt : undefined,
  };

  if (notes) {
    trade.journalEntry = {
      id: `j_${tradeId}`,
      tradeId,
      userId: 'user_demo_01',
      notes,
      emotionalState: pnl < 0 ? 'ANXIOUS' : 'CALM',
      convictionLevel: 3,
      tags: ['IMPORTED_CSV'],
      createdAt: executedAt,
    };
  }

  return trade;
}

function normalizeTradeObject(obj: any, idx: number): Trade | null {
  if (!obj || typeof obj !== 'object') return null;
  const symbol = obj.symbol || obj.ticker || obj.asset;
  if (!symbol) return null;

  const direction: 'LONG' | 'SHORT' = (String(obj.direction || obj.side || obj.type || 'LONG')).toUpperCase().includes('SHORT') ? 'SHORT' : 'LONG';
  const quantity = Number(obj.quantity || obj.qty || 10);
  const entryPrice = Number(obj.entryPrice || obj.price || 100);
  const exitPrice = obj.exitPrice ? Number(obj.exitPrice) : undefined;
  const stopLoss = Number(obj.stopLoss || obj.sl || (direction === 'LONG' ? entryPrice * 0.95 : entryPrice * 1.05));
  const takeProfit = Number(obj.takeProfit || obj.tp || (direction === 'LONG' ? entryPrice * 1.1 : entryPrice * 0.9));
  
  let pnl = Number(obj.pnl || 0);
  if (!pnl && exitPrice) {
    pnl = direction === 'LONG' ? (exitPrice - entryPrice) * quantity : (entryPrice - exitPrice) * quantity;
  }
  const pnlPct = (entryPrice * quantity) > 0 ? (pnl / (entryPrice * quantity)) * 100 : 0;

  return {
    id: obj.id || `tr_json_${Date.now()}_${idx}`,
    portfolioId: 'port_demo_01',
    symbol: String(symbol).toUpperCase(),
    assetClass: obj.assetClass || 'EQUITY',
    direction,
    quantity,
    entryPrice,
    exitPrice,
    stopLoss,
    takeProfit,
    leverage: Number(obj.leverage || 1),
    pnl: Math.round(pnl),
    pnlPct: Number(pnlPct.toFixed(2)),
    status: exitPrice ? 'CLOSED' : (obj.status || 'OPEN'),
    riskScoreAtEntry: Number(obj.riskScoreAtEntry || 45),
    executedAt: obj.executedAt || new Date().toISOString(),
  };
}

function getMappedVal(row: Record<string, string>, key?: string): string {
  if (!key) return '';
  return row[key] || '';
}

function cleanNum(val: any): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const str = String(val).replace(/[^0-9.-]/g, '');
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

function parseDate(raw?: string, offsetDays: number = 0): string {
  if (!raw) {
    return new Date(Date.now() - offsetDays * 86400 * 1000).toISOString();
  }
  const d = new Date(raw);
  if (!isNaN(d.getTime())) {
    return d.toISOString();
  }
  return new Date(Date.now() - offsetDays * 86400 * 1000).toISOString();
}

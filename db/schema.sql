-- Trade-Guard PostgreSQL Schema Definition
-- Includes tables for users, profiles, portfolios, positions, trades, trade_journal,
-- risk_assessments, risk_alerts, behavioral_signals, scenario_simulations, ai_interactions, market_data

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    risk_tolerance VARCHAR(32) DEFAULT 'moderate', -- conservative, moderate, aggressive
    max_account_risk_pct NUMERIC(5,2) DEFAULT 2.00, -- e.g. 2% max risk per trade
    max_drawdown_limit_pct NUMERIC(5,2) DEFAULT 10.00,
    preferred_currency VARCHAR(8) DEFAULT 'INR', -- INR, USD, EUR
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Portfolios Table
CREATE TABLE IF NOT EXISTS portfolios (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    total_balance NUMERIC(15,2) NOT NULL DEFAULT 100000.00,
    available_cash NUMERIC(15,2) NOT NULL DEFAULT 100000.00,
    allocated_margin NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    daily_pnl NUMERIC(15,2) DEFAULT 0.00,
    realized_pnl NUMERIC(15,2) DEFAULT 0.00,
    peak_balance NUMERIC(15,2) DEFAULT 100000.00,
    max_drawdown_pct NUMERIC(5,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Positions Table (Active Open Positions)
CREATE TABLE IF NOT EXISTS positions (
    id VARCHAR(64) PRIMARY KEY,
    portfolio_id VARCHAR(64) REFERENCES portfolios(id) ON DELETE CASCADE,
    symbol VARCHAR(32) NOT NULL,
    asset_class VARCHAR(32) DEFAULT 'EQUITY', -- EQUITY, FOREX, CRYPTO, COMMODITY, FUTURES
    direction VARCHAR(8) NOT NULL CHECK (direction IN ('LONG', 'SHORT')),
    quantity NUMERIC(15,4) NOT NULL,
    entry_price NUMERIC(15,2) NOT NULL,
    current_price NUMERIC(15,2) NOT NULL,
    stop_loss NUMERIC(15,2) NOT NULL,
    take_profit NUMERIC(15,2) NOT NULL,
    leverage INT DEFAULT 1,
    unrealized_pnl NUMERIC(15,2) DEFAULT 0.00,
    unrealized_pnl_pct NUMERIC(7,2) DEFAULT 0.00,
    risk_score INT DEFAULT 50, -- 0-100 score
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Trades Table (Historical Closed & Open Executed Trades)
CREATE TABLE IF NOT EXISTS trades (
    id VARCHAR(64) PRIMARY KEY,
    portfolio_id VARCHAR(64) REFERENCES portfolios(id) ON DELETE CASCADE,
    symbol VARCHAR(32) NOT NULL,
    asset_class VARCHAR(32) DEFAULT 'EQUITY',
    direction VARCHAR(8) NOT NULL CHECK (direction IN ('LONG', 'SHORT')),
    quantity NUMERIC(15,4) NOT NULL,
    entry_price NUMERIC(15,2) NOT NULL,
    exit_price NUMERIC(15,2),
    stop_loss NUMERIC(15,2) NOT NULL,
    take_profit NUMERIC(15,2) NOT NULL,
    leverage INT DEFAULT 1,
    pnl NUMERIC(15,2) DEFAULT 0.00,
    pnl_pct NUMERIC(7,2) DEFAULT 0.00,
    status VARCHAR(16) NOT NULL DEFAULT 'CLOSED' CHECK (status IN ('OPEN', 'CLOSED', 'CANCELLED')),
    risk_score_at_entry INT DEFAULT 50,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP WITH TIME ZONE
);

-- 6. Trade Journal Table (Trader Notes & Emotional State Records)
CREATE TABLE IF NOT EXISTS trade_journal (
    id VARCHAR(64) PRIMARY KEY,
    trade_id VARCHAR(64) REFERENCES trades(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    notes TEXT,
    emotional_state VARCHAR(32), -- CALM, ANXIOUS, CONFIDENT, REVENGE, FOMO, FRUSTRATED
    conviction_level INT CHECK (conviction_level BETWEEN 1 AND 5),
    tags TEXT[], -- e.g. ['BREAKOUT', 'POST_LOSS', 'SCALP']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Risk Assessments Table
CREATE TABLE IF NOT EXISTS risk_assessments (
    id VARCHAR(64) PRIMARY KEY,
    position_id VARCHAR(64) REFERENCES positions(id) ON DELETE SET NULL,
    trade_id VARCHAR(64) REFERENCES trades(id) ON DELETE SET NULL,
    overall_risk_score INT NOT NULL, -- 0-100
    position_exposure NUMERIC(15,2) NOT NULL,
    position_pct_of_portfolio NUMERIC(5,2) NOT NULL,
    max_capital_loss NUMERIC(15,2) NOT NULL,
    max_loss_pct_of_portfolio NUMERIC(5,2) NOT NULL,
    risk_reward_ratio NUMERIC(5,2) NOT NULL,
    leverage_risk_level VARCHAR(16) NOT NULL, -- LOW, MODERATE, HIGH, CRITICAL
    behavioral_flag_count INT DEFAULT 0,
    assessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Risk Alerts Table
CREATE TABLE IF NOT EXISTS risk_alerts (
    id VARCHAR(64) PRIMARY KEY,
    portfolio_id VARCHAR(64) REFERENCES portfolios(id) ON DELETE CASCADE,
    position_id VARCHAR(64) REFERENCES positions(id) ON DELETE CASCADE,
    severity VARCHAR(16) NOT NULL CHECK (severity IN ('INFO', 'WARNING', 'DANGER')),
    category VARCHAR(32) NOT NULL, -- POSITION_SIZE, REVENGE_RISK, DRAWDOWN, LEVERAGE, STOP_LOSS_MISSING
    title VARCHAR(255) NOT NULL,
    explanation TEXT NOT NULL,
    why_it_matters TEXT NOT NULL,
    suggested_action TEXT NOT NULL,
    is_dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Behavioral Signals Table
CREATE TABLE IF NOT EXISTS behavioral_signals (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    revenge_score INT NOT NULL DEFAULT 0, -- 0-100
    fomo_score INT NOT NULL DEFAULT 0, -- 0-100
    overtrading_score INT NOT NULL DEFAULT 0, -- 0-100
    risk_escalation_score INT NOT NULL DEFAULT 0, -- 0-100
    position_anomaly_score INT NOT NULL DEFAULT 0, -- 0-100
    primary_archetype VARCHAR(64) NOT NULL DEFAULT 'Balanced Trader',
    dominant_trigger VARCHAR(128),
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Scenario Simulations Table
CREATE TABLE IF NOT EXISTS scenario_simulations (
    id VARCHAR(64) PRIMARY KEY,
    portfolio_id VARCHAR(64) REFERENCES portfolios(id) ON DELETE CASCADE,
    scenario_name VARCHAR(128) NOT NULL,
    market_shift_pct NUMERIC(5,2) NOT NULL,
    simulated_portfolio_pnl NUMERIC(15,2) NOT NULL,
    simulated_drawdown_pct NUMERIC(5,2) NOT NULL,
    positions_at_risk_count INT DEFAULT 0,
    simulated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. AI Interactions Table
CREATE TABLE IF NOT EXISTS ai_interactions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    context_payload JSONB NOT NULL,
    prompt_summary TEXT,
    response_explanation TEXT NOT NULL,
    primary_risks JSONB,
    safer_alternatives JSONB,
    is_fallback BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Market Data Table
CREATE TABLE IF NOT EXISTS market_data (
    symbol VARCHAR(32) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    asset_class VARCHAR(32) NOT NULL,
    current_price NUMERIC(15,2) NOT NULL,
    day_change_pct NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    high_24h NUMERIC(15,2),
    low_24h NUMERIC(15,2),
    volume_24h NUMERIC(20,2),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimal querying
CREATE INDEX IF NOT EXISTS idx_trades_portfolio ON trades(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_trades_executed_at ON trades(executed_at);
CREATE INDEX IF NOT EXISTS idx_positions_portfolio ON positions(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_portfolio ON risk_alerts(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_trade_journal_user ON trade_journal(user_id);

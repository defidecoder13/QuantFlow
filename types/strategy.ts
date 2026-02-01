export type Strategy = {
    id: string;
    name: string;
    description?: string;

    // What indicators/patterns does this strategy need?
    indicators: IndicatorConfig[];

    // Logic
    entryRules: ConditionGroup;
    exitRules: ConditionGroup;

    // Management
    risk: RiskSettings;
};

// --- Logic Structure ---

export type ConditionGroup = {
    id: string;
    type: 'group';
    operator: 'AND' | 'OR';
    conditions: (Condition | ConditionGroup)[];
};

export type Condition = {
    id: string;
    type: 'condition';
    left: Operand;
    operator: ComparisonOperator;
    right: Operand;
};

export type ComparisonOperator =
    | '>'
    | '<'
    | '>='
    | '<='
    | '=='
    | '!='
    | 'CROSSES_ABOVE'
    | 'CROSSES_BELOW';

export type Operand =
    | { type: 'indicator'; indicatorId: string; sourceVal: 'value' | 'signal' }
    | { type: 'constant'; value: number }
    | { type: 'pattern'; patternName: string };

// --- Configuration ---

export type IndicatorType = 'RSI' | 'EMA' | 'SMA' | 'MACD' | 'BOLLINGER' | 'ATR';

export type IndicatorConfig = {
    id: string; // Unique ID referenced by Operands
    type: IndicatorType;
    params: Record<string, number>; // e.g. { period: 100 }
};

export type RiskSettings = {
    stopLossPercent?: number;
    takeProfitPercent?: number;
    trailingStopPercent?: number;
    positionSizePercent: number; // % of equity per trade
    maxOpenPositions?: number;
};

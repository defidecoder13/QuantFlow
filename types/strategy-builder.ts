export type OperatorType = 'AND' | 'OR';

export interface StrategyFilter {
    id: string;
    categoryId: string;
    signal: string;
}

export interface FilterGroup {
    id: string;
    operator: OperatorType;
    filters: StrategyFilter[];
}

export interface RiskSettings {
    stopLoss: number;
    takeProfit: number;
    positionSize: number;
}

export interface StrategyBuilderState {
    name: string;
    description?: string;
    groupOperator: OperatorType;
    groups: FilterGroup[];
    risk: RiskSettings;
}

export interface SignalCategory {
    id: string;
    label: string;
    signals: string[];
}

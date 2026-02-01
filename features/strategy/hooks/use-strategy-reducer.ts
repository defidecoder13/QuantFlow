import { useReducer, useCallback } from 'react';
import { Strategy, ConditionGroup, Condition, IndicatorConfig, Operand, ComparisonOperator } from '@/types/strategy';
import { v4 as uuidv4 } from 'uuid';

// Initial Empty Strategy
export const initialStrategy: Strategy = {
    id: 'new-strategy',
    name: 'New Strategy',
    indicators: [],
    entryRules: {
        id: 'root-entry',
        type: 'group',
        operator: 'AND',
        conditions: []
    },
    exitRules: {
        id: 'root-exit',
        type: 'group',
        operator: 'OR',
        conditions: []
    },
    risk: {
        stopLossPercent: 2,
        takeProfitPercent: 5,
        positionSizePercent: 10
    }
};

// --- Actions ---

type Action =
    | { type: 'SET_NAME'; name: string }
    | { type: 'ADD_INDICATOR'; indicator: IndicatorConfig }
    | { type: 'REMOVE_INDICATOR'; id: string }
    | { type: 'UPDATE_RISK'; field: string; value: number }
    | { type: 'ADD_CONDITION'; parentId: string; rulesType: 'entry' | 'exit' }
    | { type: 'ADD_GROUP'; parentId: string; rulesType: 'entry' | 'exit' }
    | { type: 'UPDATE_INDICATOR'; id: string; params: any }
    | { type: 'DELETE_NODE'; id: string; rulesType: 'entry' | 'exit' }
    | { type: 'UPDATE_CONDITION'; id: string; rulesType: 'entry' | 'exit'; updates: Partial<Condition> }
    | { type: 'UPDATE_GROUP_OPERATOR'; id: string; rulesType: 'entry' | 'exit'; operator: 'AND' | 'OR' };


// --- Helper: Tree Traversal ---

const updateNodeInTree = (
    root: ConditionGroup,
    targetId: string,
    updater: (node: ConditionGroup | Condition) => ConditionGroup | Condition | null
): ConditionGroup => {
    if (root.id === targetId) {
        return updater(root) as ConditionGroup;
    }

    const newConditions = root.conditions
        .map(child => {
            if (child.id === targetId) {
                return updater(child);
            }
            if (child.type === 'group') {
                return updateNodeInTree(child, targetId, updater);
            }
            return child;
        })
        .filter((n): n is Condition | ConditionGroup => n !== null);

    return { ...root, conditions: newConditions };
};

const findAndAddToGroup = (
    root: ConditionGroup,
    targetId: string,
    itemToAdd: Condition | ConditionGroup
): ConditionGroup => {
    if (root.id === targetId) {
        return { ...root, conditions: [...root.conditions, itemToAdd] };
    }

    return {
        ...root,
        conditions: root.conditions.map(child =>
            child.type === 'group' ? findAndAddToGroup(child, targetId, itemToAdd) : child
        )
    };
};

// --- Reducer ---

function strategyReducer(state: Strategy, action: Action): Strategy {
    switch (action.type) {
        case 'SET_NAME':
            return { ...state, name: action.name };

        case 'ADD_INDICATOR':
            return { ...state, indicators: [...state.indicators, action.indicator] };

        case 'REMOVE_INDICATOR':
            return { ...state, indicators: state.indicators.filter(i => i.id !== action.id) };

        case 'UPDATE_RISK':
            return { ...state, risk: { ...state.risk, [action.field]: action.value } };

        case 'UPDATE_INDICATOR':
            return {
                ...state,
                indicators: state.indicators.map(ind =>
                    ind.id === action.id ? { ...ind, params: { ...ind.params, ...action.params } } : ind
                )
            };

        case 'ADD_CONDITION': {
            const newCondition: Condition = {
                id: uuidv4(),
                type: 'condition',
                left: { type: 'constant', value: 0 },
                operator: '>',
                right: { type: 'constant', value: 0 }
            };

            const targetRoot = action.rulesType === 'entry' ? state.entryRules : state.exitRules;
            const newRoot = findAndAddToGroup(targetRoot, action.parentId, newCondition);

            return action.rulesType === 'entry'
                ? { ...state, entryRules: newRoot }
                : { ...state, exitRules: newRoot };
        }

        case 'ADD_GROUP': {
            const newGroup: ConditionGroup = {
                id: uuidv4(),
                type: 'group',
                operator: 'AND',
                conditions: []
            };

            const targetRoot = action.rulesType === 'entry' ? state.entryRules : state.exitRules;
            const newRoot = findAndAddToGroup(targetRoot, action.parentId, newGroup);

            return action.rulesType === 'entry'
                ? { ...state, entryRules: newRoot }
                : { ...state, exitRules: newRoot };
        }

        case 'DELETE_NODE': {
            // Logic: traverse and filter out the node with id
            const updater = (node: any) => null; // Signal to remove

            if (action.rulesType === 'entry') {
                const root = state.entryRules;
                if (root.id === action.id) return state; // Cannot delete root
                return { ...state, entryRules: updateNodeInTree(root, action.id, updater) };
            } else {
                const root = state.exitRules;
                if (root.id === action.id) return state;
                return { ...state, exitRules: updateNodeInTree(root, action.id, updater) };
            }
        }

        case 'UPDATE_CONDITION': {
            const updater = (node: any) => ({ ...node, ...action.updates });
            const targetRoot = action.rulesType === 'entry' ? state.entryRules : state.exitRules;
            const newRoot = updateNodeInTree(targetRoot, action.id, updater);

            return action.rulesType === 'entry'
                ? { ...state, entryRules: newRoot }
                : { ...state, exitRules: newRoot };
        }

        case 'UPDATE_GROUP_OPERATOR': {
            const updater = (node: any) => ({ ...node, operator: action.operator });
            const targetRoot = action.rulesType === 'entry' ? state.entryRules : state.exitRules;
            const newRoot = updateNodeInTree(targetRoot, action.id, updater);

            return action.rulesType === 'entry'
                ? { ...state, entryRules: newRoot }
                : { ...state, exitRules: newRoot };
        }

        default:
            return state;
    }
}

export function useStrategyReducer() {
    const [strategy, dispatch] = useReducer(strategyReducer, initialStrategy);
    return { strategy, dispatch };
}

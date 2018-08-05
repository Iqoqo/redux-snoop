import { Action, AnyAction } from 'redux';
import { ReduxSnoop } from './ReduxSnoop';

export interface Store<S = any, A extends Action = AnyAction> {
    snoop?: ReduxSnoop;
}
import { Store } from "redux";
export interface IStep {
    action: any;
    state: any;
}
/**
 * Creates a reducer that logs actions and the state after each dispatch
 * and expose a method to wait for an action
 */
export declare class ReduxSnoop {
    private store;
    private dispatch;
    private subscribers;
    private steps;
    constructor(store?: Store);
    getStore: () => any;
    getSteps: () => IStep[];
    reset: () => void;
    dispose: () => void;
    /**
     * Returns a promise that resolves when an action is dispatched.
     * If the action already dispatched it will resolve immediately.
     */
    waitForAction: (actionName: string | string[], skip?: number) => Promise<IStep>;
    addStep: (action: any, state: any) => void;
    private setupStore;
    private update;
    private subscribe;
}

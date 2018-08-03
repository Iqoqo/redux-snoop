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
    dispose: () => void;
    getSteps: () => IStep[];
    /**
     * Returns a promise that resolves when an action is dispatched.
     * If the action already dispatched it will resolve immediately.
     */
    waitForAction: (actionName: string | string[], skip?: number) => Promise<IStep>;
    reset(): void;
    addStep(action: any, state: any): void;
    getStore(): any;
    private setupStore;
    private update;
    private subscribe;
}

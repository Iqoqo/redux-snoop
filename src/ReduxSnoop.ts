import copy from "fast-copy";
import { last } from "lodash";
import { Store } from "redux";
import * as Redux from 'redux';

export interface IStep {
  action: any;
  state: any;
}
/**
 * Creates a reducer that logs actions and the state after each dispatch
 * and expose a method to wait for an action
 */
export class ReduxSnoop {

  private store;
  private dispatch;
  private subscribers: any[] = [];
  private steps: IStep[] = [];

  constructor(store?: Store) {
     store && this.setupStore(store);
  }

  getStore() {
    return this.store;
  }

  getSteps = () => {
    return this.steps;
  };

  reset() {
    this.steps = [];
  }

  dispose = () => {
    this.store.dispatch = this.dispatch;
    // Delete the store so this object is not reus
    this.store = undefined;
    this.dispatch = undefined;
  };

  /**
   * Returns a promise that resolves when an action is dispatched.
   * If the action already dispatched it will resolve immediately.
   */
  waitForAction = (
    actionName: string | string[],
    skip: number = 0
  ): Promise<IStep> => {
    let actions: string[] = [];

    if (typeof actionName === "string") {
      actions = [actionName];
    } else {
      actions = actionName;
    }

    const self = this;
    return new Promise((resolve, _reject) => {
      // First check if action already exists
      checkSteps(self.steps, actions, skip, resolve);

      // If not, subscribe to updates
      self.subscribe(() =>
        checkSteps(self.steps, actions, skip, resolve)
      );
    });
  };

  addStep(action, state) {
    if(!validateAction(action)){
      return;
    }
    const persistState = copy(state);

    this.steps.push({ action, state:persistState });
    this.update();
  }

  private setupStore(store: Store) {
    const self = this;
    self.store = store;
    self.dispatch = store.dispatch;

    function interceptedDispatch(action) {
      
      self.dispatch.apply(this, arguments);
      self.addStep(action, store.getState())
    }

    store.dispatch = interceptedDispatch as any;
  }

  private update = () => {
    this.subscribers.forEach(subscriber => {
      subscriber();
    });
  };

  private subscribe(callback) {
    this.subscribers.push(callback);
  }
}

function validateAction(action) {
  // Filter out redux related actions
  return action.type.indexOf('@@redux')<0;
}

function checkSteps(steps, actionName: string[], skipExistingCount, callback) {
  const step = findAction(steps, actionName, skipExistingCount);
  if (step) {
    callback(step);
  }
}

function findAction(steps, actionName: string[], skipExistingCount = 0) {
  const existing = steps.filter(step => checkStep(step, actionName));
  if (existing.length > skipExistingCount) {
    return existing[skipExistingCount];
  }
  return undefined;
}

function checkStep(step, actionName: string[]) {
  if (step && actionName.indexOf(step.action.type) >= 0) {
    return step;
  }
}

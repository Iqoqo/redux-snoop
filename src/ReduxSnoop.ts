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

  dispose = () => {
    this.store.dispatch = this.dispatch;
    // Delete the store so this object is not reus
    this.store = undefined;
    this.dispatch = undefined;
  };

  getSteps = () => {
    return this.steps;
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

  reset() {
    this.steps = [];
  }

  addStep(action, state) {
    if(action.type.indexOf('@@redux/REPLACE')>=0) {
      return;
    }

    this.steps.push({ action, state });
    this.update();
  }
  
  getStore() {
     return this.store;
  }

  private setupStore(store: Store) {
    const self = this;
    self.store = store;
    self.dispatch = store.dispatch;

    function interceptedDispatch(action) {
      self.dispatch.apply(this, arguments);
      const persistState = copy(store.getState());
      self.steps.push({ action, state: persistState });
      self.update();
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

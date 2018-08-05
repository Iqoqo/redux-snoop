(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('fast-copy')) :
  typeof define === 'function' && define.amd ? define(['exports', 'fast-copy'], factory) :
  (factory((global.index = {}),global.copy));
}(this, (function (exports,copy) { 'use strict';

  copy = copy && copy.hasOwnProperty('default') ? copy['default'] : copy;

  /**
   * Creates a reducer that logs actions and the state after each dispatch
   * and expose a method to wait for an action
   */
  var ReduxSnoop = /** @class */ (function () {
      function ReduxSnoop(store) {
          var _this = this;
          this.subscribers = [];
          this.steps = [];
          this.getStore = function () {
              return _this.store;
          };
          this.getSteps = function () {
              return _this.steps;
          };
          this.reset = function () {
              _this.steps = [];
          };
          this.dispose = function () {
              _this.store.dispatch = _this.dispatch;
              // Delete the store so this object is not reus
              _this.store = undefined;
              _this.dispatch = undefined;
          };
          /**
           * Returns a promise that resolves when an action is dispatched.
           * If the action already dispatched it will resolve immediately.
           */
          this.waitForAction = function (actionName, skip) {
              if (skip === void 0) { skip = 0; }
              var actions = [];
              if (typeof actionName === "string") {
                  actions = [actionName];
              }
              else {
                  actions = actionName;
              }
              var self = _this;
              return new Promise(function (resolve, _reject) {
                  // First check if action already exists
                  checkSteps(self.steps, actions, skip, resolve);
                  // If not, subscribe to updates
                  self.subscribe(function () {
                      return checkSteps(self.steps, actions, skip, resolve);
                  });
              });
          };
          this.addStep = function (action, state) {
              if (!validateAction(action)) {
                  return;
              }
              var persistState = copy(state);
              _this.steps.push({ action: action, state: persistState });
              _this.update();
          };
          this.update = function () {
              _this.subscribers.forEach(function (subscriber) {
                  subscriber();
              });
          };
          store && this.setupStore(store);
      }
      ReduxSnoop.prototype.setupStore = function (store) {
          var self = this;
          self.store = store;
          self.dispatch = store.dispatch;
          function interceptedDispatch(action) {
              self.dispatch.apply(this, arguments);
              self.addStep(action, store.getState());
          }
          store.dispatch = interceptedDispatch;
      };
      ReduxSnoop.prototype.subscribe = function (callback) {
          this.subscribers.push(callback);
      };
      return ReduxSnoop;
  }());
  function validateAction(action) {
      // Filter out redux related actions
      return action.type.indexOf('@@redux') < 0;
  }
  function checkSteps(steps, actionName, skipExistingCount, callback) {
      var step = findAction(steps, actionName, skipExistingCount);
      if (step) {
          callback(step);
      }
  }
  function findAction(steps, actionName, skipExistingCount) {
      if (skipExistingCount === void 0) { skipExistingCount = 0; }
      var existing = steps.filter(function (step) { return checkStep(step, actionName); });
      if (existing.length > skipExistingCount) {
          return existing[skipExistingCount];
      }
      return undefined;
  }
  function checkStep(step, actionName) {
      if (step && actionName.indexOf(step.action.type) >= 0) {
          return step;
      }
  }

  var injectReduxSnoop = function () {
      var redux = require.requireActual("redux");
      var createStore = redux.createStore;
      function interceptCreateStore() {
          var store = createStore.apply(this, arguments);
          var reducer = arguments[0];
          store.snoop = new ReduxSnoop();
          function updatedReducer(state, action) {
              var updatedState = reducer.apply(this, arguments);
              store.snoop.addStep(action, updatedState);
              return updatedState;
          }
          store.replaceReducer(updatedReducer);
          return store;
      }
      redux.createStore = interceptCreateStore;
      return redux;
  };

  exports.ReduxSnoop = ReduxSnoop;
  exports.injectReduxSnoop = injectReduxSnoop;

  Object.defineProperty(exports, '__esModule', { value: true });

})));

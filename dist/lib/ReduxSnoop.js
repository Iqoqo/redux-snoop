"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var fast_copy_1 = tslib_1.__importDefault(require("fast-copy"));
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
            var persistState = fast_copy_1.default(state);
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
exports.ReduxSnoop = ReduxSnoop;
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
//# sourceMappingURL=ReduxSnoop.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ReduxSnoop_1 = require("./ReduxSnoop");
exports.injectReduxSnoop = function () {
    var redux = require.requireActual("redux");
    var createStore = redux.createStore;
    function interceptCreateStore() {
        var store = createStore.apply(this, arguments);
        var reducer = arguments[0];
        store.snoop = new ReduxSnoop_1.ReduxSnoop();
        function updatedReducer(state, action) {
            var updatedState = reducer.apply(this, arguments);
            store.snoop.addStep(action, updatedState);
            return updatedState;
        }
        ;
        store.replaceReducer(updatedReducer);
        return store;
    }
    redux.createStore = interceptCreateStore;
    return redux;
};
//# sourceMappingURL=injectReduxSnoop.js.map
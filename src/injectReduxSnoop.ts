import { ReduxSnoop } from "./ReduxSnoop";

export const injectReduxSnoop =  () => {
  const redux = require.requireActual("redux");
  const createStore = redux.createStore;
  function interceptCreateStore() {
    const store = createStore.apply(this, arguments);
    const reducer = arguments[0];

    store.snoop = new ReduxSnoop();
    const updatedReducer = (state, action) => {
      const updatedState = reducer(state, action);
      store.snoop.addStep(action, updatedState);
      return updatedState;
    };
    store.replaceReducer(updatedReducer);
    return store;
  }

  redux.createStore = interceptCreateStore;

  return redux;
};

export default injectReduxSnoop;
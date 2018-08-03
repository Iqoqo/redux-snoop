# redux-snoop 🕵️

_Grey-box testing for redux workflow_ 

# Introduction

Testing redux flow (beyond unit tests) is hard and requires the test code to have knowledge of internal implementation of the store creation and to alter it. This library introduces more of a grey-box approach and let you write tests when you don't have or want access to the actual store creation logic. 

## Why redux-snoop?

1. **Doesn't alter your code** - snoop will attach itself to any *existing* redux store, meaning your test code and production code will behave the same.
2. Clean promise based syntax when dealing with complex async flow. 

## Why not redux-snoop?
This library intercepts or overrides redux library's code. It doesn't do anything that you don't already do with `jest-mock` but it might not be suitable to everyone. 

## Install
```bash
yarn install redux-snoop
```

## Usage

You can use redux-snoop in 2 ways, first method is for simple stores and the second is for stores with middleware such as `redux-saga`

> A deeper comparison will follow in the coming section. 



### 1. For testing stores without middleware
```js
import { ReduxSnoop } from 'redux-snoop';

const store = creatStore(...)

const snoop = new ReduxSnoop(store)

store.dispatch({type: "some-action", payload: "foo"})

const result = await snoop.waitForAction(anotherAction)

// result === { action: {type: "some-action", payload: "foo", state: {...} }

store.dispatch({type: "another-action", payload: "bar"})

const steps = snoop.getSteps();

// steps === [
// { action: { type: "some-action", payload: "foo" }, state: { ... } },
// { action: { type: "another-action", payload: "bar" }, state: { ... } }
// ];

snoop.reset();

// snoop.getSteps() === []

```

### 2. For stores with middleware that dispatch actions (ie `redux-saga`)

```js

// Important! This must come at the top of your test suite!

jest.mock('redux', () => {
  const inject = require('redux-snoop').injectReduxSnoop;
  return inject();
})

describe('Test with inject', () => {

  it('Should add snoop to any store', async () => {

    const store = createStore(...);

    // Snoop is already attached to the store
    expect(store.snoop).toBeInstanceOf(ReduxSnoop);

    setTimeout(() => store.dispatch({ type: 'SOME_ACTION' }), 10);

    // Wait for the action
    const step = await store.snoop.waitForAction('SOME_ACTION');

    expect(store.snoop.getSteps()).toHaveLength(1)
    expect(step.action.type).tpEqual('SOME_ACTION');

    // Reset the store between tests
    store.snoop.reset();

    expect(store.snoop.getSteps()).toHaveLength(0)
  })
})
```

# Description

## Problems with Redux tests
There are many ways to test redux with unit tests, but when it comes to component testing, that is, testing a flow that includes reducers, actions and middleware, is more challenging. This is because Redux doesn't provide an outside interface that logs both actions and state. This limit is by design and prevents anti-pattern and abuse of the library. 

This limitation forces us to be creative when writing our tests, common patterns are: 

1. Add reducer that acts as logger.
2. Use a mock store library (as in redux-mock-store).

Both of the solutions are considered `white-box` tests and are problematic since they force us to change the mechanics of our just for tests, and so the tests don't reflect our production code. 

### Enter redux-snoop
This library uses `grey-box` testing approach and patches redux with minimalistic interceptors or wrappers during tests. This allows us to snoop on stores that were created by other parts in our code, without us needing to have access to them or manually change them. 

`redux-snoop` introduces the concept of `Step` which is a step in the life-cycle of a store, consisting of an action and the state tree as it recorded after dispatch is done. 

It will also allow you wait for a future or async actions using promises. This is extremely helpful when testing redux flow that involves multiple actions and async activity, like the one involved with redux-saga or thunk, making your tests more readable and clean. 

>Though it shouldn't affect the mechanics of the store, it does consider to be a `hack` and so it shouldn't be used outside of a test environment.

## How does it work?

There are two ways to use snoop, depends on your needs: 

1. Intercept `dispatch` method - **for common use**.
2. Patch `createStore` using jest-mocks - **for use with middlewares** that dispatch actions (`redux-saga`).
   
> You may find an example for aach of the methods in the previous section
> 
### First Method: Intercepting `dispatch()`
`redux-snoop` intercepts `dispatch` by taking the original store's dispatch method and wraps it with it's own logic. Setup is simple as it only accepts an existing store object and its affects are limited to that object alone. 

### Second Method: Patch `createStore()` (only for Jest tests)
This method is more intrusive since it involves mocking `redux` library, but it is inevitable if your store is using middlewares. In that case, intercepting `dispatch` on the created store will not work since `createStore` will pass a different method reference to the middleware. 

In that case we will use `jest-mock` to provide a wrapper around `createStore` that, upon creation of a new store, wraps the root reducer and logs its activity. It will add a property `snoop` to the store, which is a `ReduxSnoop` object that follows that store. 

> Note: in the first method you will manually create ReduxSnoop using its constructor, while with the second one you will already have an instances created and passes to you as part of the stores object. 

# `ReduxSnoop` Methods

### `constructor(store?: Store) `

Creates a new instance of Snoop for the given `store`. 
> Please note that `Store` is any vanilla `redux` store as it returned by `createStore`. If you use any modification for redux or redux store creation, this library may not work correctly.

### `waitForAction(actionName: string | string[], skip: number = 0) : Promise<IStep>`

Waits for an one or more actions and return a promise that resolves into a `Step` which is a tuple of the dispatched action object and the state as it appears after the dispatch.

#### `actionName: string | string[]`

One or more action types to wait for. If more than one actions are stated, then the "Or" Operator is applied and the promise is resolved when the either action is dispatched. 

#### `skip? : number`
Skip the n number of occurrences of the action before resolving. Defaults for 0, meaning no skip. 

> Note: method will work the same even if waitFor is called *after* the action was dispatched. In that case it will return a promise that is immediately resolved. 

### `getSteps():IStep[]`

A `Step` is a tuple of action and state describing a dispatched action and the state of the store after dispatch is done. This method will return the sequence of steps as they were logged by snoop up to the time of the call. 

### `reset()`

Resets the steps log. 

### `dispose()`

Un-attach snoop from the store, restoring all interceptors to original values. 

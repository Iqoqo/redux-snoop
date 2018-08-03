import { ReduxSnoop } from '../src/ReduxSnoop';
import {  createStore } from "redux";

describe('SpyReducer', () => {

    let snoop;
    let store;
    const action = { type: 'test-action'}
    const reducer = (state = {}, action) => {
        return {...state, foo: 'bar'}
    }
    
    beforeEach(() => {
        store = createStore(reducer, {});
         snoop = new ReduxSnoop(store);
    })


    it('Should log actions',() => {
        
       store.dispatch(action)

       const steps = snoop.getSteps();
       expect(steps[0].action).toEqual(action);
    })

    it('Should log state after each action',() => {
        store.dispatch(action)
 
        const steps = snoop.getSteps();
        expect(steps[0].action).toEqual(action);
        expect(steps[0].state).toEqual({foo: 'bar'});
    })

    it('Should wait for action',async () => {

        setTimeout(() => store.dispatch(action), 1);

        const result = await snoop.waitForAction(action.type);
        expect(result.action).toEqual(action);
       
    })

    it('Should wait for multiple actions, returning the first one',async () => {

        const anotherAction = { type: 'another-action'}
        setTimeout(() => store.dispatch(anotherAction), 1);
        setTimeout(() => store.dispatch(action), 1);

        const result = await snoop.waitForAction([action.type, anotherAction.type]);
        expect(result.action).toEqual(anotherAction);
       
    })

    it('Should notify action if subscribed after dispatch',async () => {
        store.dispatch(action);

        const result = await snoop.waitForAction(action.type);
        expect(result.action).toEqual(action);
    })

    it('Should skip action steps before notification on async',async () => {
        const secondAction = {...action, check: 'out'}
        setTimeout(() => store.dispatch(action), 4);
        setTimeout(() => store.dispatch(secondAction), 5);

        const result = await snoop.waitForAction(action.type, 1);
        expect(result.action).toEqual(secondAction);
    })

    it('Should skip action steps before notification on sync',async () => {
        const secondAction = {...action, number: 'second'}
        const thirdAction = {...action, number: 'third'}
        store.dispatch(action);
        store.dispatch(secondAction);
        store.dispatch(thirdAction);

        const result = await snoop.waitForAction(action.type, 1);
        expect(result.action).toEqual(secondAction);
    })

    it('dispose() should clear spy', () => {
        store.dispatch(action);
        store.dispatch(action);
        snoop.dispose();
        store.dispatch(action);

        const steps = snoop.getSteps();
        expect(steps).toHaveLength(2);
    })

    it('reset() should clear log', () => {
        store.dispatch(action);
        store.dispatch(action);
        snoop.reset();
        store.dispatch(action);

        const steps = snoop.getSteps();
        expect(steps).toHaveLength(1);
    })

    it('getStore() should return the store', () => {
        const snoopStore = snoop.getStore();
        expect(snoopStore).toEqual(store);
    })

   
})


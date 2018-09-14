
import { ReduxSnoop } from '..';
import {  createStore, applyMiddleware} from "redux";
import { put, take} from 'redux-saga/effects';
import createSagaMiddleware from 'redux-saga'

/**
 * This tests injection using register.js in jest.config.js or package.json using setupFiles: ["redux-snoop/register"]
 */
describe('ReduxSnoop Injected with register.js', () => {

    let store;
    const action = { type: 'test-action'}
    const reducer = (state = {}, action) => {
        return {...state, foo: 'bar'}
    }

    it('Should inject snoop and override createStore', () => {
        store = createStore(reducer, {});
        expect(store.snoop).toBeInstanceOf(ReduxSnoop);
    })
    
})
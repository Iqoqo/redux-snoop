
import { ReduxSnoop } from '../src/ReduxSnoop';
import {  createStore, applyMiddleware} from "redux";
import { put, take} from 'redux-saga/effects';
import createSagaMiddleware from 'redux-saga'

jest.mock('redux', () => {
    const inject = require('../src/injectReduxSnoop').injectReduxSnoop;
    return inject();
})

describe('ReduxSnoop Injected', () => {

    let store;
    const action = { type: 'test-action'}
    const reducer = (state = {}, action) => {
        return {...state, foo: 'bar'}
    }

    it('Should inject snoop and override createStore', () => {
        store = createStore(reducer, {});
        expect(store.snoop).toBeInstanceOf(ReduxSnoop);
    })

    it('Should track action on injected redux', () => {
        store = createStore(reducer, {});
        store.dispatch(action);
        expect(store.snoop.getSteps()).toHaveLength(1);
    })

    it('Should work with actions dispatched from redux-saga middleware', async () => {

        function* someSaga() {
            yield take('TEST_ACTION')
            yield put({type: 'SAGA_ACTION'})
        }

        const sagaMiddleware = createSagaMiddleware()
        const store = createStore(
            reducer,
            applyMiddleware(sagaMiddleware)
          )
        sagaMiddleware.run(someSaga)
        store.dispatch({type: 'TEST_ACTION'})
        const result = await store.snoop.waitForAction('SAGA_ACTION');
        expect(result.action.type).toEqual('SAGA_ACTION');
        expect(store.snoop.getSteps()).toHaveLength(2)
    })
})

    jest.mock('redux', () => {
    const inject = require('redux-snoop').injectReduxSnoop;
    return inject();
  })
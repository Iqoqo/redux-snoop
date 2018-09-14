"use strict";
jest.mock('redux', function () {
    var inject = require('redux-snoop').injectReduxSnoop;
    return inject();
});
//# sourceMappingURL=register.js.map
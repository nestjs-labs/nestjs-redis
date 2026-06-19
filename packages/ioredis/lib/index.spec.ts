import * as allExports from './index.js';

test('each of exports should be defined', () => {
  Object.values(allExports).forEach(value => expect(value).not.toBeNil());
});

import * as allExports from './index.js';

test('there should be 4 exports', () => {
  expect(Object.keys(allExports)).toHaveLength(4);
});

test('each of exports should be defined', () => {
  Object.values(allExports).forEach(value => expect(value).not.toBeNil());
});

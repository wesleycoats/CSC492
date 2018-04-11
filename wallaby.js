module.exports = function (wallaby) {
  return {
    "files": [
      "index_v2.js",
{pattern: 'node_modules/chai/chai.js', instrument: false},
{pattern: 'node_modules/chai-as-promised/lib/chai-as-promised.js', instrument: false},
{pattern: 'node_modules/phantomjs-polyfill/bind-polyfill.js', instrument: false},
{pattern: 'node_modules/es6-promise/dist/es6-promise.js', instrument: false}
    ],
    "tests": [
      "test/*.js"
    ],
    "testFramework": "mocha",
    "env": {
      "kind": "chrome",
type: 'node',
runner: 'node'
    }
  };
};

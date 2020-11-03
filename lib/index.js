const session = require('./session');
const credentials = require('./credentials');

module.exports = {
  ...session,
  ...credentials,
};

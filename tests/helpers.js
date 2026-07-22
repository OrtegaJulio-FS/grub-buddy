const request = require('supertest');
const { signToken } = require('../src/utils/jwt');
const { COOKIE_NAME } = require('../src/utils/cookies');

// A supertest agent pre-authenticated as the given user, bypassing the real
// login flow (no bcrypt cost, no dependency on a real password) - useful
// since most tests only care about who req.user is once auth has already
// happened, not about exercising login itself (see auth.test.js for that).
function agentAs(app, user) {
  const agent = request.agent(app);
  const token = signToken({ sub: user.id, email: user.email });
  agent.jar.setCookie(`${COOKIE_NAME}=${token}; Path=/`);
  return agent;
}

module.exports = { agentAs };

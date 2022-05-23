const userController = require('../controllers/users');

const routes = [
  {
    method: 'GET',
    url: '/users',
    handler: userController.getAllUsers,
  },
  // Task 1: ~/users/1/rewards?at=2020-03-19T12:00:00Z
  {
    method: 'GET',
    url: '/users/:id/rewards',
    schema: {
      querystring: {
        at: { type: 'string' },
      },
    },
    handler: userController.getUserRewards,
  },
  // Task 2: ~/users/1/rewards/2020-03-18T00:00:00Z/redeem
  {
    method: 'PATCH',
    url: '/users/:id/rewards/:reward_id/redeem',
    handler: userController.redeemRewards,
  },
];
module.exports = routes;

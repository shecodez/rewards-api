// Demo data
let users = [
  {
    id: 1337,
    rewards: [
      { availableAt: '2020-03-15T00:00:00Z', redeemedAt: null, expiresAt: '2020-03-16T00:00:00Z' },
      { availableAt: '2020-03-16T00:00:00Z', redeemedAt: null, expiresAt: '2020-03-17T00:00:00Z' },
      { availableAt: '2020-03-17T00:00:00Z', redeemedAt: null, expiresAt: '2020-03-18T00:00:00Z' },
      { availableAt: '2020-03-18T00:00:00Z', redeemedAt: null, expiresAt: '2020-03-19T00:00:00Z' },
      { availableAt: '2020-03-19T00:00:00Z', redeemedAt: null, expiresAt: '2020-03-20T00:00:00Z' },
      { availableAt: '2020-03-20T00:00:00Z', redeemedAt: null, expiresAt: '2020-03-21T00:00:00Z' },
      { availableAt: '2020-03-21T00:00:00Z', redeemedAt: null, expiresAt: '2020-03-22T00:00:00Z' },
    ],
  },
];

function getWeeklyRewards(fromDate) {
  console.log('fromDate', fromDate);
  // Starting Sunday src: https://stackoverflow.com/a/12884521
  let d = new Date(fromDate.setDate(fromDate.getDate() - fromDate.getDay()));
  d.setHours(0, 0, 0, 0);
  let week = [{ availableAt: new Date(d), redeemedAt: null, expiresAt: new Date(d.setDate(d.getDate() + 1)) }]; // idx 0
  let idx = week.length;
  while (d.setDate(d.getDate() + 1) && idx < 7) {
    week.push({
      availableAt: new Date(d.setDate(d.getDate() - 1)),
      redeemedAt: null,
      expiresAt: new Date(d.setDate(d.getDate() + 1)),
    });
    idx++; // 7 days in a week
  }

  return week;
}

function generateUserAndRewards(id, atDate) {
  const newUser = {
    id,
    rewards: getWeeklyRewards(atDate),
  };
  users.push(newUser);

  return newUser;
}

// Note: I would not use this functions in prod because of the complexities surrounding date manipulation,
// instead I would use a robust and well-tested library like Moment.js to do things like date comparisons.

function isSameDate(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

function isValidDate(date) {
  return new Date(date) instanceof Date;
}

// Handlers
const getAllUsers = async (req, reply) => {
  return users;
};

// Rewards and users should be generated on the fly
const getUserRewards = async (req, reply) => {
  const id = Number(req.params.id); // User ID
  let user = users.find((u) => u.id === id);

  //console.log('req.query', req.query.at);
  if (!user) {
    const today = new Date();
    user = generateUserAndRewards(id, new Date(req.query.at || today));
  }

  return { data: user.rewards };
};

// added invalid date, already redeemed, and missing user / reward error handling
const redeemRewards = async (req, reply) => {
  // if reward_id date is not a valid date, no need to hit the users(db)
  if (!isValidDate(req.params.reward_id)) {
    reply.code(400);
    return { error: { message: `Reward Id: ${req.params.reward_id} is invalid date.` } };
  }

  const id = Number(req.params.id); // User ID
  let user = users.find((u) => u.id === id);
  if (user) {
    const today = new Date();
    let reward = user.rewards.find((r) => isSameDate(r.availableAt, req.params.reward_id));
    if (reward) {
      if (reward.redeemedAt) {
        //console.log(`Error: User(${id}) reward is already redeemed (${reward.redeemedAt}).`);
        return { error: { message: `This reward is already redeemed.` } };
      }
      // TODO: Q: should the redeemedAt date (today) be between the returned reward's availableAt date and expiresAt date?
      if (today < new Date(reward.expiresAt) /* && today > new Date(reward.availableAt) */) {
        reward.redeemedAt = new Date();
        return { data: reward };
      } else {
        reply.code(404);
        //console.log(`Error: User(${id}) reward is already expired (${reward.expiresAt}).`);
        return { error: { message: `This reward is already expired.` } };
      }
    } else {
      // TODO: In Prod I would log this, but not send it as a response to the user for security purposes.
      return { error: { message: `Reward Id: ${req.params.reward_id} does not exist on User Id: ${id}.` } };
    }
  } else {
    // TODO: In prod I would log this, but not send it as a response to the user for security purposes.
    return { error: { message: `User Id: ${id} does not exist.` } };
  }
};

module.exports = {
  getAllUsers,
  getUserRewards,
  redeemRewards,
};

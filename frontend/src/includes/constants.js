import utilities from "./utilities";

const { getEnvironmentVariables } = utilities;

export default {
  ...getEnvironmentVariables([
    "SERVER_URL",
  ]),
  POSSIBLE_ESTIMATES: [0.5, 1, 2, 3, 5, 8, 13],
  AUTO_REVEAL_GRACE_PERIOD: 2, // in seconds
};

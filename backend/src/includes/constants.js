const getEnvironmentVariables = (variableNames) => {
  const variables = {};
  variableNames.forEach((variableName) => {
    variables[variableName] = process.env[variableName];
  });
  return variables;
};

module.exports = {
  ...getEnvironmentVariables([
    "NETWORK_PORT",
  ]),
  MEETING_CODE_DIGITS: 4,
  POSSIBLE_ESTIMATES: [0.5, 1, 2, 3, 5, 8, 13],
};

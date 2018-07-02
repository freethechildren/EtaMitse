const { MEETING_CODE_DIGITS } = require("./constants");

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
const getRandomIntInclusive = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const MEETING_CODE_MIN = 10 ** (MEETING_CODE_DIGITS - 1);
const MEETING_CODE_MAX = (10 ** MEETING_CODE_DIGITS) - 1;

module.exports = {
  getEnvironmentVariables: (variableNames) => {
    const variables = {};
    variableNames.forEach((variableName) => {
      variables[variableName] = process.env[variableName];
    });
    return variables;
  },

  generateMeetingCode: () => getRandomIntInclusive(MEETING_CODE_MIN, MEETING_CODE_MAX),
};

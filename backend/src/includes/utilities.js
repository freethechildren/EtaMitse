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
  generateMeetingCode: () => getRandomIntInclusive(10 ** (MEETING_CODE_DIGITS - 1), (10 ** MEETING_CODE_DIGITS) - 1),
};

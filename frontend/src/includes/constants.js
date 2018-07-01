const DEV = false;

export default {
  SERVER_URL: DEV ? "ws://127.0.0.1:8080" : "wss://etamitse.herokuapp.com",
  POSSIBLE_ESTIMATES: [0.5, 1, 2, 3, 5, 8, 13],
};

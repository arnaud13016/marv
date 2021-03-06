const { PubSubClient } = require("twitch-pubsub-client");
const onRedemption = require("./onRedemption");
const onBits = require("./onBits");
const twitch = require("../index");

const pubSubClient = new PubSubClient();

module.exports = async function init() {
  const userId = await pubSubClient.registerUserListener(twitch.api);

  await pubSubClient.onRedemption(userId, onRedemption);
  await pubSubClient.onBits(userId, onBits);
};

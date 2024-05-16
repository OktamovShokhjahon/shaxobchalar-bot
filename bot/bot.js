const TELEGRAM = require("node-telegram-bot-api");

const bot = new TELEGRAM(process.env.TOKEN, { polling: true });

module.exports = { bot };

require("./message");
require("./query")

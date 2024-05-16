const { bot } = require("../bot");
const User = require("../../models/user");
const Station = require("../../models/station");

const send_ad = async (msg) => {
  const chatId = msg.from.id;
  const user = await User.findOne({ chatId }).lean();

  const users = await User.find();
  users.forEach(async (user) => {
    await bot
      .forwardMessage(user.chatId, chatId, msg.message_id)
      .then((data) => {})
      .catch((err) => console.log("user blocked bot"));
  });

  await User.findByIdAndUpdate(
    user._id,
    { ...user, action: "menu" },
    { new: true }
  );
  bot.sendMessage(chatId, "Menu:");
};

const recieve_ad = async (msg) => {
  const chatId = msg.from.id;
  const user = await User.findOne({ chatId }).lean();

  if (user.admin) {
    await User.findByIdAndUpdate(
      user._id,
      {
        ...user,
        action: "send_ads",
      },
      { new: true }
    );

    bot.sendMessage(chatId, "Reklamani kiriting.");
  } else {
    bot.sendMessage(chatId, "Sizda bunday qilishga ruxsat yo'q !!!");
  }
};

module.exports = { send_ad, recieve_ad };

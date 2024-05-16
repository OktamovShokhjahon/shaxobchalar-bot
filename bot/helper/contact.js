const { bot } = require("../bot");
const User = require("../../models/user");

const contact = async (msg) => {
  const chatId = msg.from.id;
  const user = await User.findOne({ chatId }).lean();

  await User.findByIdAndUpdate(
    user._id,
    {
      ...user,
      action: "send_message_to_admin",
    },
    { new: true }
  );

  bot.sendMessage(chatId, `Adminga yubormoqchi o'lgan xabaringizni yuboring.`);
};

const send_message_to_admin = async (msg, text, user) => {
  try {
    await bot.sendMessage(
      1218689073,
      `Adminga xabar yuborildi:\nIsmi: ${user.name}\nXabar: ${text}`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Javob qaytarish",
                callback_data: `reply_to_${user.chatId}`,
              },
            ],
          ],
        },
      }
    );
  } catch (err) {
  }

  try {
    await bot.sendMessage(
      2095960669,
      `Adminga xabar yuborildi:\nIsmi: ${user.name}\nXabar: ${text}`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Javob qaytarish",
                callback_data: `reply_to_${user.chatId}`,
              },
            ],
          ],
        },
      }
    );
  } catch (err) {
  }

  bot.sendMessage(msg.from.id, "Menu: ")
  await User.findByIdAndUpdate(user._id, {...user, action: "menu"}, {new: true})
};

const recieve_from_admin = async (msg, id) => {
  const chatId = msg.from.id;
  const userToSendMessage = await User.findOne({ chatId: id }).lean();
  const user = await User.findOne({ chatId }).lean();

  if (userToSendMessage) {
    await User.findByIdAndUpdate(
      user._id,
      {
        ...user,
        action: "reply_to_user_recieve_message",
        reply_to: id,
      },
      { new: true }
    );

    bot.sendMessage(
      chatId,
      `${userToSendMessage.name} ga yubormoqchi bo'lgan xabaringizni kiriting.`
    );
  } else {
    bot.sendMessage(chatId, "Bunday foydalanuvchi topilmadi.");
  }
};

const reply_to_user = async (msg, id) => {
  const text = msg.text;
  const chatId = msg.from.id;
  const user = await User.findOne({ chatId }).lean();

  try {
    await User.findByIdAndUpdate(
      user._id,
      {
        ...user,
        action: "menu",
      },
      { new: true }
    );

    bot.sendMessage(id, `Admin sizga xabar yubordi:\nXabar: ${text}`);
  } catch (err) {
  }
};

module.exports = {
  contact,
  send_message_to_admin,
  reply_to_user,
  recieve_from_admin,
};

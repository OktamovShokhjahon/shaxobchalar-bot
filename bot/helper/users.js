const { bot } = require("../bot");
const User = require("../../models/user");

const show_users = async (msg) => {
  let chatId = msg.from.id;
  let user = await User.findOne({ chatId }).lean();
  let users = await User.find().lean();

  if (user.admin) {
    let c = "";
    let k = 1;

    users.forEach((user) => {
      c += `${k} - foydalanuvchi.\nIsmi: ${user.name}\nHududi: ${
        user.region
      }\nTelefon raqami: ${user.phone}\nProfil yaratilgan sanasi: ${
        user.createdAt
      }\nid: ${user.chatId}\nadminmi: ${user.admin ? "Ha" : "Yo'q"}\n\n`;
      k+=1
    });

    bot.sendMessage(chatId, c);
  } else {
    bot.sendMessage("Kechirasiz, sizda bunday qilishga ruhsat yo'q.");
  }
};

module.exports = { show_users };

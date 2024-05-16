const { bot } = require("../bot");

const User = require("../../models/user");

const choose_region = async (msg) => {
  const chatId = msg.from.id;
  const user = await User.findOne({ chatId }).lean();

  const regions = [
    [
      {
        text: "Andijon viloyati",
        callback_data: "choose-region_andijon",
      },
      {
        text: "Buxoro viloyati",
        callback_data: "choose-region_buxoro",
      },
    ],
    [
      {
        text: "Farg'ona viloyati",
        callback_data: "choose-region_fargona",
      },
      {
        text: "Jizzax viloyati",
        callback_data: "choose-region_jizzax",
      },
    ],
    [
      {
        text: "Xorazm viloyati",
        callback_data: "choose-region_xorazm",
      },
      {
        text: "Namangan viloyati",
        callback_data: "choose-region_namangan",
      },
    ],
    [
      {
        text: "Navoiy viloyati",
        callback_data: "choose-region_navoiy",
      },
      {
        text: "Qashqadaryo viloyati",
        callback_data: "choose-region_qashqadaryo",
      },
    ],
    [
      {
        text: "Samarqand viloyati",
        callback_data: "choose-region_samarqand",
      },
      {
        text: "Sirdaryo viloyati",
        callback_data: "choose-region_sirdaryo",
      },
    ],
    [
      {
        text: "Surxondaryo viloyati",
        callback_data: "choose-region_surxondaryo",
      },
      {
        text: "Toshkent viloyati",
        callback_data: "choose-region_toshkent",
      },
    ],
  ];

  bot.sendMessage(
    chatId,
    `Siz hozirda ${user.region} viloyatini tanlagansiz. Uni o'zgartirishingiz mumkin:`,
    {
      reply_markup: {
        inline_keyboard: regions,
      },
    }
  );
};

module.exports = { choose_region };

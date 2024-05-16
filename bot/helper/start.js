const { bot } = require("../bot");
const { adminKeyboard, userKeyboard } = require("../keyboards/main.js");
const User = require("../../models/user");

const start = async (msg) => {
  const chatId = msg.from.id;

  const checkUser = await User.findOne({ chatId }).lean();

  if (!checkUser) {
    const newUser = new User({
      name: msg.from.first_name,
      chatId,
      action: "request_contact",
      createdAt: new Date(),
    });
    await newUser.save();
    bot.sendMessage(
      chatId,
      "Assalomu aleykum. Kuningiz xayrli o'tsin ! Botdan foydalanish uchun telefon raqamingizni pastdagi tugmani bosish orqali bizga jo'nating 👇",
      {
        reply_markup: {
          keyboard: [
            [
              {
                text: "📞 Telefon raqamini yuborish.",
                request_contact: true,
              },
            ],
          ],
          resize_keyboard: true,
        },
      }
    );
  } else {
    bot.sendMessage(
      chatId,
      `Assalomu alaykum hurmatli ${msg.from.first_name}. Shaxobchalar haqida ma'lumot beruvchi online platformaga xush kelibsiz!`,
      {
        reply_markup: {
          keyboard: checkUser
            ? checkUser.admin
              ? adminKeyboard
              : userKeyboard
            : userKeyboard,
          resize_keyboard: true,
        },
      }
    );
  }
};

const choose_region = async (msg) => {
  const chatId = msg.from.id;

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
    "Qoyil, endi qaysi viloyatdan ekanligingizni tanlang:",
    {
      reply_markup: {
        inline_keyboard: regions,
      },
    }
  );
};

const request_contact = async (msg) => {
  const chatId = msg.from.id;

  if (msg.contact.phone_number) {
    let user = await User.findOne({ chatId }).lean();
    user.phone = msg.contact.phone_number;
    user.admin =
      msg.contact.phone_number.includes("994215522") ||
      msg.contact.phone_number.includes("972330011");
    user.action = "choose_region";

    await User.findByIdAndUpdate(user._id, user, { new: true });
    choose_region(msg);
  }
};

module.exports = { start, request_contact, choose_region };

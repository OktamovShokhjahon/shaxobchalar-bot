const { bot } = require("../bot");
const User = require("../../models/user");
const Station = require("../../models/station");

const show_stations = async (
  chatId,
  page = 1,
  message_id = null,
  isMyStations = false,
  isAdmin = false,
  number = "999999999999",
) => {
  let user = await User.findOne({ chatId }).lean();

  let limit = 5;
  let skip = (page - 1) * limit;

  if (page == 1) {
    await User.findByIdAndUpdate(
      user._id,
      { ...user, action: `station-1` },
      { new: true },
    );
  }

  let stations = await Station.find().skip(skip).limit(limit).lean();

  let newStations = [];
  stations.forEach((station) => {
    if (
      station.isOpen &&
      station.status &&
      station.location.toLowerCase().includes(user.region.toLowerCase())
    ) {
      newStations.push(station);
    }
  });

  let list = newStations.map((station) => {
    return [
      {
        text: station.name,
        callback_data: `show_station_${station._id}`,
      },
    ];
  });

  const inline_keyboard = [
    ...list,
    [
      {
        text: "Ortga",
        callback_data: "back_station",
      },
      {
        text: page,
        callback_data: page,
      },
      {
        text: "Keyingi",
        callback_data: "next_station",
      },
    ],
  ];

  if (message_id) {
    bot.editMessageReplyMarkup(
      { inline_keyboard },
      { chat_id: chatId, message_id },
    );
  } else {
    bot.sendMessage(chatId, `Shaxobchalardan birini tanlang:`, {
      reply_markup: {
        inline_keyboard,
      },
    });
  }
};

const pagination_station = async (chatId, action, message_id = null) => {
  let user = await User.findOne({ chatId }).lean();
  let page = 1;

  if (user.action.includes("station-")) {
    page = +user.action.split("-")[1];
    if (action == "back_station" && page > 1) {
      page--;
    }
  }

  if (action == "next_station") {
    page++;
  }

  await User.findByIdAndUpdate(
    user._id,
    { ...user, action: `station-${page}` },
    {
      new: true,
    },
  );

  show_stations(chatId, page, message_id);
};

const show_station = async (chatId, id) => {
  const station = await Station.findById(id).lean();
  const user = await User.findOne({ chatId }).lean();

  if (station) {
    let oilTypes = "";
    station.oilTypes.forEach((type) => {
      oilTypes += "⛽️ " + type + "\n\n";
    });
    const { name, phone, image, workTime, location } = station;
    const { startHour, startMinute, endHour, endMinute } = workTime;

    let show =
      user.phone.includes(station.adminNumber) || user.admin ? true : false;

    bot.sendPhoto(chatId, image, {
      caption: `<b>${name}</b>\n\n${oilTypes}Boshlash vaqti ${startHour}:${startMinute}\n Tugash vaqti ${endHour}:${endMinute}\n\nTelefon raqami: ${phone}\n\nManzili: ${location}`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: show
          ? [
              [
                {
                  text: "O'chirish 🗑",
                  callback_data: `del_station_${station._id}`,
                },
                {
                  text: "Tahrirlash ✏️",
                  callback_data: `edit_station_${station._id}`,
                },
              ],
            ]
          : [],
      },
    });
  } else {
    bot.sendMessage(
      chatId,
      "Uzur, shaxobcha topilmadi, keyinroq urinib ko'ring",
    );
  }
};

const del_station = async (chatId, id, messageId) => {
  await Station.findByIdAndDelete(id)
    .then(() => {
      bot.sendMessage(chatId, `Muvaffaqiyatli o'chirildi.`);
      bot.deleteMessage(chatId, messageId);
    })
    .catch(() => {
      bot.sendMessage(chatId, "Nimadir xato ketdi.");
    });
};

const edit_station = async (chatId, id) => {
  const edit_keyboard = [
    [
      {
        text: "Nomini o'zgartirish",
        callback_data: `edit_station_name_${id}`,
      },
    ],
    [
      {
        text: "Benzin turlarini o'zgartirish",
        callback_data: `edit_station_oilTypes_${id}`,
      },
    ],
    [
      {
        text: "Ish vaqtini o'zgartirish",
        callback_data: `edit_station_workTime_${id}`,
      },
    ],
    [
      {
        text: "Telefon raqamini o'zgartirish",
        callback_data: `edit_station_phone_${id}`,
      },
    ],
    [
      {
        text: "Manzilni o'zgartirish",
        callback_data: `edit_station_location_${id}`,
      },
    ],
    [
      {
        text: "Rasmini o'zgartirish",
        callback_data: `edit_station_image_${id}`,
      },
    ],
    [
      {
        text: "Yopiq yoki Ochiq ekanligini belgilash",
        callback_data: `edit_station_isOpen_${id}`,
      },
    ],
  ];

  bot.sendMessage(
    chatId,
    "Quyidagi ma'lumotlardan qaysi birini o'zgartirmoqchisiz:",
    {
      reply_markup: {
        inline_keyboard: edit_keyboard,
      },
    },
  );
};

const edit_station_name = async (chatId, id, text) => {
  const user = await User.findOne({ chatId }).lean();
  const station = await Station.findById(id).lean();

  await Station.findByIdAndUpdate(
    station._id,
    {
      ...station,
      name: text,
    },
    { new: true },
  );
  await User.findByIdAndUpdate(
    user._id,
    {
      ...user,
      action: "menu",
    },
    { new: true },
  );
  bot.sendMessage(
    chatId,
    `${station.name} nomi ${text} ga muvaffaqiyatli o'zgartirildi.`,
  );
};

const edit_station_workTime = async (chatId, text, id) => {
  const user = await User.findOne({ chatId }).lean();
  const station = await Station.findById(id).lean();

  if (text.length == 11 || text.length == 10 || text.length == 9) {
    const times = text.split(" ");
    const start = times[0];
    const end = times[1];

    let startHour = start ? start.split(":")[0] : null;
    let startMinute = start ? start.split(":")[1] : null;
    let endHour = end ? end.split(":")[0] : null;
    let endMinute = end ? end.split(":")[1] : null;

    if (
      startHour > 24 ||
      startMinute > 60 ||
      endHour > 24 ||
      (endMinute > 60 && startHour && startMinute && endHour && endMinute)
    ) {
      bot.sendMessage(chatId, "Ma'lumotlarni noto'g'ri kiritdingiz.");
    } else {
      const workTime = {
        startHour,
        startMinute,
        endHour,
        endMinute,
      };

      await Station.findByIdAndUpdate(station._id, { ...station, workTime });

      await User.findByIdAndUpdate(user._id, {
        ...user,
        action: "menu",
      });

      bot.sendMessage(chatId, "Menu:");
    }
  } else {
    bot.sendMessage(chatId, "Ma'lumotlarni noto'g'ri kiritdingiz.");
  }
};

const edit_station_phone = async (chatId, text, id) => {
  const station = await Station.findById(id).lean();
  const user = await User.findOne({ chatId }).lean();

  await Station.findByIdAndUpdate(
    id,
    {
      ...station,
      phone: text,
    },
    { new: true },
  );
  await User.findByIdAndUpdate(
    user._id,
    {
      ...user,
      action: "menu",
    },
    { new: true },
  );

  bot.sendMessage(chatId, "Menu: ");
};

const edit_station_location = async (chatId, text, id) => {
  const station = await Station.findById(id).lean();
  const user = await User.findOne({ chatId }).lean();

  await Station.findByIdAndUpdate(
    id,
    {
      ...station,
      location: text,
    },
    { new: true },
  );
  await User.findByIdAndUpdate(
    user._id,
    {
      ...user,
      action: "menu",
    },
    { new: true },
  );

  bot.sendMessage(chatId, "Menu: ");
};

const edit_station_image = async (chatId, image, id) => {
  const station = await Station.findById(id).lean();
  const user = await User.findOne({ chatId }).lean();

  await Station.findByIdAndUpdate(
    id,
    {
      ...station,
      image,
    },
    { new: true },
  );
  await User.findByIdAndUpdate(
    user._id,
    {
      ...user,
      action: "menu",
    },
    { new: true },
  );

  bot.sendMessage(chatId, "Menu: ");
};

module.exports = {
  show_stations,
  pagination_station,
  show_station,
  del_station,
  edit_station,
  edit_station_name,
  edit_station_workTime,
  edit_station_phone,
  edit_station_location,
  edit_station_image,
};

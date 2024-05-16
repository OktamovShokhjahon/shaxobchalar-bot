const { bot } = require("../bot");
const User = require("../../models/user");
const Station = require("../../models/station");

const clear_station_draft = async () => {
  const stations = await Station.find({ status: false })
  if (stations) {
    if (stations.length > 0) {
        stations.forEach(async (station) => {
          await Station.deleteOne({_id: station._id})
        })
    }
  }
};

const add_station = async (msg) => {
  clear_station_draft();

  let chatId = msg.from.id;
  let user = await User.findOne({ chatId }).lean();

  if (user.admin) {
    bot.sendMessage(chatId, "Ajoyib, yangi shaxobchaning nomini kiriting");
    await User.findByIdAndUpdate(user._id, {
      ...user,
      action: "add_station_title",
    });
  } else {
    bot.sendMessage(chatId, "Kechirasiz, sizda bunday qilishga ruhsat yo'q.");
  }
};

const add_station_title = async (msg) => {
  let chatId = msg.from.id;
  let user = await User.findOne({ chatId }).lean();
  const text = msg.text;

  if (user.admin) {
    bot.sendMessage(
      chatId,
      "Ajoyib, endi yangi shaxobchaning telefon raqamini kiriting."
    );
    const newStation = new Station({
      name: text,
      createdAdmin: chatId,
    });
    await newStation.save();
    await User.findByIdAndUpdate(user._id, {
      ...user,
      action: "add_station_number",
    });
  } else {
    bot.sendMessage(chatId, "Kechirasiz, sizda bunday qilishga ruhsat yo'q.");
  }
};

const add_station_number = async (msg) => {
  let chatId = msg.from.id;
  let user = await User.findOne({ chatId }).lean();
  let station = await Station.findOne({ status: false }).lean();
  const text = msg.text;

  if (user.admin) {
    bot.sendMessage(
      chatId,
      "Ajoyib, endi yangi shaxobchaning rasmini kiriting."
    );
    await Station.findByIdAndUpdate(
      station._id,
      {
        ...station,
        phone: text,
      },
      { new: true }
    );
    await User.findByIdAndUpdate(
      user._id,
      {
        ...user,
        action: "add_station_image",
      },
      { new: true }
    );
  } else {
    bot.sendMessage(chatId, "Kechirasiz, sizda bunday qilishga ruhsat yo'q.");
  }
};

const add_station_image = async (msg) => {
  let chatId = msg.from.id;
  let user = await User.findOne({ chatId }).lean();
  let station = await Station.findOne({ status: false }).lean();

  const image = msg;
  const imageId = image.photo ? image.photo[0].file_id : "";

  if (user.admin) {
    if (image.document || !image.photo) {
      bot.sendMessage(
        chatId,
        `Iltimos, rasmni oddiy rasm ko'rinishida yuklang`
      );
    } else {
      bot.sendMessage(
        chatId,
        "Endi shu shaxobchaga admin qilib tayinlamoqchi bo'lgan foydalanuvchining telefon raqamini kiriting"
      );
      await Station.findByIdAndUpdate(
        station._id,
        {
          ...station,
          image: imageId,
        },
        { new: true }
      );
      await User.findByIdAndUpdate(
        user._id,
        {
          ...user,
          action: "add_station_admin",
        },
        { new: true }
      );
    }
  } else {
    bot.sendMessage(chatId, "Kechirasiz, sizda bunday qilishga ruhsat yo'q.");
  }
};

const add_station_oil_types = async (msg) => {
  const chatId = msg.from.id;
  const station = await Station.findOne({ status: false });
  const user = await User.findOne({ chatId });

  const oilTypesKeyboard = [
    [
      {
        text: "100 - ✅",
        callback_data: `add_oil_type-100-${station._id}`,
      },
      {
        text: "100 - ❌",
        callback_data: `remove_oil_type-100-${station._id}`,
      },
    ],
    [
      {
        text: "90 - ✅",
        callback_data: `add_oil_type-90-${station._id}`,
      },
      {
        text: "90 - ❌",
        callback_data: `remove_oil_type-90-${station._id}`,
      },
    ],
    [
      {
        text: "92 - ✅",
        callback_data: `add_oil_type-92-${station._id}`,
      },
      {
        text: "92 - ❌",
        callback_data: `remove_oil_type-92-${station._id}`,
      },
    ],
    [
      {
        text: "91 - ✅",
        callback_data: `add_oil_type-91-${station._id}`,
      },
      {
        text: "91 - ❌",
        callback_data: `remove_oil_type-91-${station._id}`,
      },
    ],
    [
      {
        text: "80 - ✅",
        callback_data: `add_oil_type-80-${station._id}`,
      },
      {
        text: "80 - ❌",
        callback_data: `remove_oil_type-80-${station._id}`,
      },
    ],
    [
      {
        text: "DT - ✅",
        callback_data: `add_oil_type-DT-${station._id}`,
      },
      {
        text: "DT - ❌",
        callback_data: `remove_oil_type-DT-${station._id}`,
      },
    ],
    [
      {
        text: "Tugatildi 👍",
        callback_data: `edit_oil_type-done-${station._id}`,
      },
    ],
  ];

  bot.sendMessage(
    chatId,
    `Shaxobchada qay turdagi benzin turlari bor ekanini tanlang (keyinchalik o'zgartirishingiz mumkin)`,
    {
      reply_markup: {
        inline_keyboard: oilTypesKeyboard,
      },
    }
  );
};

const add_station_admin = async (msg) => {
  const chatId = msg.from.id;
  const user = await User.findOne({ chatId }).lean();
  const station = await Station.findOne({ status: false }).lean();

  const text = msg.text;

  if (user.admin) {
    await Station.findByIdAndUpdate(
      station._id,
      { ...station, adminNumber: text },
      { new: true }
    );
    await User.findByIdAndUpdate(user._id, {
      ...user,
      action: "add_station_oil_types",
    });
    add_station_oil_types(msg);
  } else {
    bot.sendMessage(chatId, "Kechirasiz, sizda bunday qilishga ruhsat yo'q.");
  }
};

const add_station_work_time = async (msg) => {
  const chatId = msg.from.id;
  const user = await User.findOne({ chatId }).lean();
  const station = await Station.findOne({ status: false }).lean();
  const text = msg.text;

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

      await Station.findByIdAndUpdate(
        station._id,
        { ...station, workTime },
        { new: true }
      );

      await User.findByIdAndUpdate(user._id, {
        ...user,
        action: "add_station_location",
      });

      bot.sendMessage(
        chatId,
        "Endi bo'lsa ohirgi qadam, shaxobchaning manzilini kiriting"
      );
    }
  } else {
    bot.sendMessage(chatId, "Ma'lumotlarni noto'g'ri kiritdingiz.");
  }
};

const add_station_location = async (msg) => {
  const chatId = msg.from.id;
  const user = await User.findOne({ chatId }).lean();
  const station = await Station.findOne({ status: false }).lean();

  const text = msg.text;

  await Station.findByIdAndUpdate(
    station._id,
    {
      ...station,
      location: text,
    },
    { new: true }
  );

  bot.sendMessage(
    chatId,
    "Ajoyib, endi bo'lsa hosil bo'lgan natijani ko'rish uchun bosing 👇",
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Ko'rib chiqish ✅",
              callback_data: `review_station_${station._id}`,
            },
          ],
        ],
      },
    }
  );
};

const review_station = async (msg, id) => {
  const chatId = msg.from.id;
  const station = await Station.findOne({ status: false }).lean();
  const user = await User.findOne({ chatId }).lean();

  let c = "";
  station.oilTypes.forEach((type) => {
    c += "⛽️ " + type + "\n\n";
  });
  await bot.sendPhoto(chatId, station.image, {
    caption: `<b>${station.name}</b>\n\n${c}Boshlash vaqti ${station.workTime.startHour}:${station.workTime.startMinute}\n Tugash vaqti ${station.workTime.endHour}:${station.workTime.endMinute}\n\nTelefon raqami: ${station.phone}\n\nManzili: ${station.location}`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "✅",
            callback_data: `last-status-station-accept-${station._id}`,
          },
          {
            text: "❌",
            callback_data: `last-status-station-decline-${station._id}`,
          },
        ],
      ],
    },
  });
};

module.exports = {
  add_station,
  add_station_title,
  add_station_number,
  add_station_image,
  add_station_admin,
  add_station_work_time,
  add_station_location,
  review_station,
};

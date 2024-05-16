const { bot } = require("./bot");
const User = require("../models/user");
const Station = require("../models/station");
const { userKeyboard, adminKeyboard } = require("./keyboards/main");
const { review_station } = require("./helper/station");
const { recieve_from_admin } = require("./helper/contact");
const {
  pagination_station,
  show_station,
  del_station,
  edit_station,
} = require("./helper/stations");

bot.on("callback_query", async (query) => {
  const chatId = query.from.id;
  const { data } = query;

  if (data.includes("edit-type-")) {
    const res = data.split("-");

    if (res.length == 5) {
      const id = res[4];
      const method = res[2];
      const type = res[3];

      const station = await Station.findById(id);

      if (method == "add") {
        if (station.oilTypes.includes(type)) {
          bot.answerCallbackQuery(query.id, {
            text: "Bunday turdagi benzin allaqachon qo'shilgan",
            showAlert: true,
          });
        } else {
          await Station.findByIdAndUpdate(
            station._id,
            { ...station, oilTypes: station.oilTypes.push(type) },
            { new: true }
          );

          bot.answerCallbackQuery(query.id, {
            text: "Benzin turi muvaffaqiyatli qo'shildi",
            showAlert: true,
          });
        }
      }

      if (method == "remove") {
        if (station.oilTypes.includes(type)) {
          let newOilTypes = [];

          station.oilTypes.filter((c) => {
            if (c != type) newOilTypes.push(c);
          });

          await Station.findByIdAndUpdate(
            station._id,
            {
              // ...station,
              oilTypes: newOilTypes,
            },
            { new: true }
          )
            .then((data) => {})
            .catch((err) => {});

          bot.answerCallbackQuery(query.id, {
            text: "Benzin turi muvaffaqiyatli olib tashlandi.",
            showAlert: true,
          });
        } else {
          bot.answerCallbackQuery(query.id, {
            text: "Bunday turdagi benzin mavjud emas.",
            showAlert: true,
          });
        }
      }
    }

    if (res.length == 4) {
      const method = res[2];
      const id = res[3];

      const station = await Station.findById(id);
      const user = await User.findOne({ chatId: query.from.id }).lean();

      if (method == "done") {
        await Station.findByIdAndUpdate(
          station._id,
          { ...station, status: true },
          { new: true }
        );
        await User.findByIdAndUpdate(user._id, {
          ...user,
          action: "menu",
        });
        bot.sendMessage(chatId, "Menu:");
      }
    }
  }

  if (data.includes("edit_station_")) {
    const res = data.split("_");

    if (res.length == 3) {
      const id = res[2];
      edit_station(chatId, id);
    }

    if (res.length == 4) {
      const user = await User.findOne({ chatId }).lean();

      const id = res[3];
      const name = res[2];

      if (name == "name") {
        await User.findByIdAndUpdate(
          user._id,
          {
            ...user,
            action: `edit_station_name_${id}`,
          },
          { new: true }
        );

        bot.sendMessage(chatId, "Yangi nomin kiriting.");
      }

      if (name == "oilTypes") {
        await User.findByIdAndUpdate(
          user._id,
          {
            ...user,
            action: `edit_station_oilTypes_${id}`,
          },
          { new: true }
        );

        const oilTypesKeyboard = [
          [
            {
              text: "100 - ✅",
              callback_data: `edit-type-add-100-${id}`,
            },
            {
              text: "100 - ❌",
              callback_data: `edit-type-remove-100-${id}`,
            },
          ],
          [
            {
              text: "90 - ✅",
              callback_data: `edit-type-add-90-${id}`,
            },
            {
              text: "90 - ❌",
              callback_data: `edit-type-remove-90-${id}`,
            },
          ],
          [
            {
              text: "92 - ✅",
              callback_data: `edit-type-add-92-${id}`,
            },
            {
              text: "92 - ❌",
              callback_data: `edit-type-remove-92-${id}`,
            },
          ],
          [
            {
              text: "91 - ✅",
              callback_data: `edit-type-add-91-${id}`,
            },
            {
              text: "91 - ❌",
              callback_data: `edit-type-remove-91-${id}`,
            },
          ],
          [
            {
              text: "80 - ✅",
              callback_data: `edit-type-add-80-${id}`,
            },
            {
              text: "80 - ❌",
              callback_data: `edit-type-remove-80-${id}`,
            },
          ],
          [
            {
              text: "DT - ✅",
              callback_data: `edit-type-add-DT-${id}`,
            },
            {
              text: "DT - ❌",
              callback_data: `edit-type-remove-DT-${id}`,
            },
          ],
          [
            {
              text: "Tugatildi 👍",
              callback_data: `edit-type-done-${id}`,
            },
          ],
        ];

        bot.sendMessage(
          chatId,
          `Qaysi turdagi benzinlarni olib tashlamoqchi bo'lsangiz yoki qo'shmoqchi bo'lsangiz tanlang.`,
          {
            reply_markup: {
              inline_keyboard: oilTypesKeyboard,
            },
          }
        );
      }

      if (name == "workTime") {
        await User.findByIdAndUpdate(
          user._id,
          {
            ...user,
            action: `edit_station_workTime_${id}`,
          },
          { new: true }
        );

        bot.sendMessage(chatId, "Shaxobchaning yangi ish vaqtini kiriting:");
      }

      if (name == "phone") {
        await User.findByIdAndUpdate(
          user._id,
          {
            ...user,
            action: `edit_station_phone_${id}`,
          },
          { new: true }
        );

        bot.sendMessage(
          chatId,
          "Shaxobchaning yangi telefon raqamini kiriting."
        );
      }

      if (name == "location") {
        await User.findByIdAndUpdate(
          user._id,
          {
            ...user,
            action: `edit_station_location_${id}`,
          },
          { new: true }
        );

        bot.sendMessage(chatId, "Shaxobchaning yangi manzilini kiriting.");
      }

      if (name == "image") {
        await User.findByIdAndUpdate(
          user._id,
          {
            ...user,
            action: `edit_station_image_${id}`,
          },
          { new: true }
        );

        bot.sendMessage(chatId, "Shaxobchaning yangi rasmini kiriting.");
      }

      if (name == "isOpen") {
        const station = await Station.findById(id).lean()

        const inline_keyboard = [
          [
            {
              text: "Shaxobchani ochish 😊",
              callback_data: `edit_station_open_${id}`
            },
            
          ],
          [
            {
              text: "Shaxobchani yopish 😕",
              callback_data: `edit_station_close_${id}`
            }
          ]
        ]

        await User.findByIdAndUpdate(user._id, {...user, action: "change_station_isOpen"}, {new: true})

        bot.sendMessage(chatId, `Hozirda: ${station.isOpen ? "ochiq" : "yopiq"}\nShaxobchaning qaysi holatda ekanligini tanlang:`, {reply_markup: {
          inline_keyboard
        }})
      }

      if (name == "open") {
        const station = await Station.findByIdAndUpdate(id).lean()

        await Station.findByIdAndUpdate(station._id, {...station, isOpen: true}, {new: true}).then(() => {
          bot.sendMessage(chatId, "Muvaffaqiyatli tarzda ochiq deya e'lon qilindi")
        }).catch((err) => bot.sendMessage(chatId, "Kechirasiz, nimadir xato ketdi, keyinroq urinib ko'ring."))
        await User.findByIdAndUpdate(user._id, {...user, action: "menu"}, {new: true})
      
      }

      if (name == "close") {
        const station = await Station.findByIdAndUpdate(id).lean()

        await Station.findByIdAndUpdate(station._id, {...station, isOpen: false}, {new: true}).then((data) => bot.sendMessage(chatId, "Muvaffaqiyatli tarzda yopiq deya e'lon qilindi")).catch((err) => bot.sendMessage(chatId, "Muvaffaqiyatli tarzda yopiq deya e'lon qilindi."))
        await User.findByIdAndUpdate(user._id, {...user, action: "menu"}, {new: true})
      }
    }
  }

  if (data.includes("del_station_")) {
    const id = data.split("_")[2];

    del_station(chatId, id, query.message.message_id);
  }

  if (data.includes("show_station_")) {
    const id = data.split("_")[2];

    show_station(chatId, id);
  }

  if (["next_station", "back_station"].includes(data)) {
    pagination_station(chatId, data, query.message.message_id);
  }

  if (data.includes("choose-region_")) {
    await bot
      .answerCallbackQuery(query.id)
      .then(() => {})
      .catch(() => {});

    const region = data.split("_")[1];
    const user = await User.findOne({ chatId }).lean();
    await User.findByIdAndUpdate(
      user._id,
      { ...user, region, action: "choose_menu" },
      { new: true }
    );

    bot.sendMessage(
      chatId,
      `Siz ${region} viloyatini tanlash orqali muvaffaqiyatli ro'yhatdan o'tdingiz! endi menyulardan tanlang:`,
      {
        reply_markup: {
          keyboard: user
            ? user.admin
              ? adminKeyboard
              : userKeyboard
            : userKeyboard,
          resize_keyboard: true,
        },
      }
    );
  }

  if (data.includes("_oil_type")) {
    const res = data.split("-");
    const id = res[2];
    const val = res[1];
    const method = res[0].split("_")[0];

    const station = await Station.findOne({ status: false }).lean();
    const user = await User.findOne({ chatId }).lean();
    let oilTypes = station.oilTypes;

    if (method == "add") {
      if (oilTypes.includes(val)) {
        bot.answerCallbackQuery(query.id, {
          text: "Bunday turdagi benzin allaqachon mavjud",
          showAlert: true,
        });
      } else {
        oilTypes.push(val);
        await Station.findByIdAndUpdate(
          station._id,
          {
            ...station,
            oilTypes,
          },
          { new: true }
        );
        bot.answerCallbackQuery(query.id, {
          text: `${val} turdagi benzin muvaffaqiyatli qo'shildi`,
          showAlert: true,
        });
      }
    } else if (method == "remove") {
      if (station.oilTypes.includes(val)) {
        const newOilTypes = [];

        for (let i = 0; i < oilTypes.length; i++) {
          if (station.oilTypes[i] !== val) {
            newOilTypes.push(oilTypes[i]);
          }
        }

        await Station.findByIdAndUpdate(
          station._id,
          { ...station, oilTypes: newOilTypes },
          { new: true }
        );

        bot.answerCallbackQuery(query.id, {
          text: "Bunday turdagi benzin muvaffaqiyatli tarzda olib tashlandi.",
          showAlert: true,
        });
      } else {
        bot.answerCallbackQuery(query.id, {
          text: `${val} turdagi benzin mavjud emas.`,
          showAlert: true,
        });
      }
    } else if (val == "done") {
      await User.findByIdAndUpdate(
        user._id,
        {
          ...user,
          action: "add_station_work_time",
        },
        { new: true }
      );
      let c = "";
      station.oilTypes.forEach((type) => {
        c += "⛽️ " + type + "\n";
      });
      await bot.sendMessage(
        chatId,
        `Siz manashu turdagi benzin turlarini ${station.name} shaxobchasiga qo'shdingiz:\n\n${c}`
      );
      await bot.sendMessage(
        chatId,
        `Endi bo'lsa ish vaqtining boshlanish va tugash vaqtini manabunday kiriting: 7:00 23:00`
      );
    }
  }

  if (data.includes("review_station_")) {
    const res = data.split("_");
    const id = res[2];

    review_station(query, id);
  }

  if (data.includes("last-status-station-")) {
    const res = data.split("-");
    const id = res[4];
    const method = res[3];

    const station = await Station.findById(id).lean();
    const user = await User.findOne({ chatId }).lean();

    if (method == "accept") {
      await Station.findByIdAndUpdate(
        id,
        {
          ...station,
          status: 1,
        },
        {
          new: true,
        }
      );

      await User.findByIdAndUpdate(
        user._id,
        {
          ...user,
          action: "menu",
        },
        { new: true }
      );

      bot.sendMessage(chatId, "Siz muvaffaqiyatli shaxocha qo'shdingiz.");
      bot.answerCallbackQuery(query.id);
    } else if (method == "decline") {
      await Station.findByIdAndUpdate(
        id,
        {
          ...station,
          status: 0,
        },
        {
          new: true,
        }
      );

      await User.findByIdAndUpdate(
        user._id,
        {
          ...user,
          action: "menu",
        },
        { new: true }
      );

      bot.sendMessage(chatId, "Shaxobcha rad etildi.");
      bot.answerCallbackQuery(query.id);
    }
  }

  if (data.includes("reply_to_")) {
    const res = data.split("_");
    const id = res[2];

    recieve_from_admin(query, id);
  }
});

const { bot } = require("./bot");
const { start, request_contact } = require("./helper/start");
const { show_users } = require("./helper/users");
const {
  add_station,
  add_station_title,
  add_station_number,
  add_station_image,
  add_station_admin,
  add_station_work_time,
  add_station_location,
} = require("./helper/station");
const {
  contact,
  send_message_to_admin,
  reply_to_user,
} = require("./helper/contact");
const { choose_region } = require("./helper/region");
const {
  show_stations,
  edit_station_name,
  edit_station_workTime,
  edit_station_phone,
  edit_station_location,
  edit_station_image,
} = require("./helper/stations");
const {requestType, searchWithTypes} = require("./helper/searchWithTypes")
const {userStations} = require("./helper/userStations")
const { send_ad, recieve_ad } = require("./helper/ads");
const User = require("../models/user");

bot.on("message", async (msg) => {
  let chatId = msg.from.id;
  let text = msg.text;
  let user = await User.findOne({ chatId }).lean();

  if (text == "/start") {
    start(msg);
    return;
  }

  if(text == "Benzin turi bilan qidirish") {
    requestType(msg)
    return
  }

  if (text == "Shaxobchalarim") {
    userStations(msg)
    return
  }

  if (text == "Shaxobchalar") {
    show_stations(chatId);
    return;
  }

  if (text == "Admin bilan bog'lanish") {
    contact(msg);
    return;
  }

  if (text == "Foydalanuvchilar") {
    show_users(msg);
    return;
  }

  if (text == "Shaxobcha qo'shish") {
    add_station(msg);
    return;
  }

  if (text == "Viloyatni o'zgartirish") {
    choose_region(msg);
    return;
  }

  if (text == "Foydalanuvchilarga reklama jo'natish") {
    recieve_ad(msg)
    return
  }

  if (user) {
    if (user.action == "request_type_to_search") {
      searchWithTypes(msg)
    }

    if (user.action == "request_contact" && !user.phone) {
      request_contact(msg);
    }

    if (user.action == "add_station_title") {
      add_station_title(msg);
    }

    if (user.action == "add_station_number") {
      add_station_number(msg);
    }

    if (user.action == "add_station_image") {
      add_station_image(msg);
    }

    if (user.action == "add_station_admin") {
      add_station_admin(msg);
    }

    if (user.action == "add_station_work_time") {
      add_station_work_time(msg);
    }

    if (user.action == "add_station_location") {
      add_station_location(msg);
    }

    if (user.action == "send_message_to_admin") {
      send_message_to_admin(msg, text, user);
    }

    if (user.action == "reply_to_user_recieve_message") {
      const chatId = msg.from.id;
      const user = await User.findOne({ chatId }).lean();

      reply_to_user(msg, user.reply_to);
    }

    if (user.action.includes("edit_station_name_")) {
      edit_station_name(chatId, user.action.split("_")[3], text);
    }

    if (user.action.includes("edit_station_workTime")) {
      edit_station_workTime(chatId, text, user.action.split("_")[3]);
    }

    if (user.action.includes("edit_station_phone_")) {
      edit_station_phone(chatId, text, user.action.split("_")[3]);
    }

    if (user.action.includes("edit_station_location_")) {
      edit_station_location(chatId, text, user.action.split("_")[3]);
    }

    if (user.action.includes("edit_station_image_")) {
      const image = msg;
      const imageId = image.photo ? image.photo[0].file_id : "";

      if (image.document || !image.photo) {
        bot.sendMessage(
          chatId,
          `Iltimos, rasmni oddiy rasm ko'rinishida yuklang`
        );
      } else {
        edit_station_image(chatId, imageId, user.action.split("_")[3]);
      }
    }

    if (user.action == "send_ads") {
      send_ad(msg)
    }
  }
});

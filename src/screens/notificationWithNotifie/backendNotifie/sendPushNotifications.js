
const { Expo } = require("expo-server-sdk");
let expo = new Expo();
const axios = require("axios").default;
const firebase = require("../config/firebase");

module.exports = async function sendPushNotifications(
  tokens,
  title,
  body,
  data = {},
  moreOptions = {},
//   isRider = false
) {
  try {
    const notifee = data.notifee || {};
    const android = notifee.android || {};
    // const instance = isRider ? "maCite" : "wasiliDriver";
    const instance = "maCite";
    const notification = await firebase[instance]
      .messaging()
      .sendEachForMulticast({
        tokens,
        data: {
          data: JSON.stringify({
            ...data,
            notifee: {
              title,
              body,
              data,
              android: {
                channelId: "default",
                // smallIcon: "notification_icon",
                pressAction: {
                  id: "default",
                },
                ...android,
              },
              ...notifee,
            },
          }),
        },
        ...moreOptions,
      });
      console.log(notification.responses[0])
  } catch (error) {
    console.log(error)
    // throw error
  }
};

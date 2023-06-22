import moment from "moment"
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';

/**
 * fetch data from api wiht default options
 * @param {string} url - the url to fetch to
 * @param {object} options - additional options
 * @returns {Promise}
 */
export const fetchApi = async (url, options = {}) => {
          // const user = JSON.parse(localStorage.getItem('user'))
          const user = null
          const isProduction = false
          const domain = isProduction ? 'https://dev.mediabox.bi:5012' : 'http://192.168.6.187:8080'
          if (user) options = { ...options, headers: { ...options.headers, authorization: `bearer ${user.token}` } }
          const response = await fetch(domain+url, {
                    ...options
          })
          if (response.ok) {
                const data = await response.json()
                console.log(data)
                return data
          } else {
                    throw await response.json()
          }
}

export const randomInt = (min, max, exclude) => {
          let number = Math.round(Math.random() * (max - min) + min)
          while(number == exclude) {
                    number = Math.round(Math.random() * (max - min) + min)
          }
          return number
}

export const MyFromNow = (fromDate) => {
          const date = new Date(fromDate)
/*           console.log(date.getDate(), (new Date()).getDate())
          if(date.getDate()+1 < (new Date()).getDate()) {
                    // return moment(date).format("MMM Do YY");
          } */
          return moment(date).format("Do MMM YY");
}

export async function registerForPushNotificationsAsync() {
          let token;
          if (Constants.isDevice) {
                    const { status: existingStatus } = await Notifications.getPermissionsAsync();
                    let finalStatus = existingStatus;
                    if (existingStatus !== 'granted') {
                              const { status } = await Notifications.requestPermissionsAsync();
                              finalStatus = status;
                    }
                    if (finalStatus !== 'granted') {
                              alert('Failed to get push token for push notification!');
                              return;
                    }
                    token = (await Notifications.getExpoPushTokenAsync()).data;
          } else {
                    alert('Must use physical device for Push Notifications');
          }

          if (Platform.OS === 'android') {
                    Notifications.setNotificationChannelAsync('default', {
                              name: 'default',
                              importance: Notifications.AndroidImportance.MAX,
                              vibrationPattern: [0, 250, 250, 250],
                              lightColor: '#FF231F7C',
                    });
          }

          return token;
}

export function calcCrow(lat1, lon1, lat2, lon2) {
          var R = 6371; // km
          var dLat = toRad(lat2 - lat1);
          var dLon = toRad(lon2 - lon1);
          var lat1 = toRad(lat1);
          var lat2 = toRad(lat2);

          var a =
                    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.sin(dLon / 2) *
                              Math.sin(dLon / 2) *
                              Math.cos(lat1) *
                              Math.cos(lat2);
          var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          var d = R * c;
          return d;
}
function toRad(Value) {
          return (Value * Math.PI) / 180;
}
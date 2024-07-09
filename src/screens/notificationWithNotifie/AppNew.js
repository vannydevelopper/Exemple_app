import 'react-native-reanimated'
import 'react-native-gesture-handler'
import 'intl';
import 'intl/locale-data/jsonp/en';
import 'intl/locale-data/jsonp/fr';

import React, { useEffect, useState } from 'react';
import { StatusBar, Text, View, LogBox, Linking } from 'react-native'
import { Provider } from 'react-redux';
import AppContainer from './src/AppContainer';
import { store } from './src/store'
import { IntlProvider } from "react-intl";
import { useSelector } from 'react-redux'
import { localeSelector } from './src/store/selectors/appSelectors'
import KIRUNDI from './src/lang/bi.json'
import FRANCAIS from './src/lang/fr.json'
import ENGLISH from './src/lang/en.json'
import KISWAHILI from './src/lang/sw.json'
// import NoInternet from './src/components/app/NoInternet';
import codePush from "react-native-code-push";
import notifee, { AndroidCategory, AndroidImportance, AndroidStyle, AndroidVisibility, EventType } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';

LogBox.ignoreLogs(["EventEmitter.removeListener"]);
let App = () => {
        useEffect(() => {
                (async () => {
                        // await notifee.deleteChannel("default")
                        const channelId = await notifee.createChannel({
                                id: 'default',
                                name: 'Default',
                                importance: AndroidImportance.HIGH,
                                visibility: AndroidVisibility.PUBLIC,
                                vibration: true,
                                sound: "notification"
                        })
                        // notifee.displayNotification({title:"test", body:"test", android:{channelId}})
                })()
        }, [])
        useEffect(() => {
                notifee.onForegroundEvent(async ({ type, detail }) => {
                        console.log("hello notifications")
                        if (type == EventType.PRESS) {
                                const { url } = detail.notification?.data
                                if (url) {
                                        Linking.openURL(url)
                                }
                        }
                })
                notifee.onBackgroundEvent(async ({ type, detail }) => {
                        if (type == EventType.PRESS) {
                                const { url } = detail.notification?.data
                                if (url) {
                                        Linking.openURL(url)
                                }
                        }
                })
                messaging().onMessage(async message => {
                        const body = message.data
                        var data = {}
                        if (body.data) {
                                data = JSON.parse(body.data)
                        }
                        // console.log({data})
                        if (data.notifee) {
                                notifee.displayNotification(data.notifee);
                        }
                });
                messaging().setBackgroundMessageHandler(async remoteMessage => {
                        const body = remoteMessage.data
                        var data = {}
                        if (body.data) {
                                data = JSON.parse(body.data)
                        }
                        if (data.notifee) {
                                notifee.displayNotification(data.notifee);
                        }
                })
        }, [])
        const IntApp = () => {
                const locale = useSelector(localeSelector)
                var messages
                switch (locale) {
                        case 'bi':
                                messages = KIRUNDI
                                break
                        case 'en':
                                messages = ENGLISH
                                break
                        case 'sw':
                                messages = KISWAHILI
                                break
                        default:
                                messages = FRANCAIS

                }
                return (
                        <IntlProvider messages={messages} locale={locale} defaultLocale="fr">
                                {/* <NativeBaseProvider> */}
                                <AppContainer />
                                {/* </NativeBaseProvider> */}
                        </IntlProvider>
                )
        }
        return (
                <>
                        <StatusBar backgroundColor='#fff' barStyle='dark-content' />
                        <Provider store={store}>
                                <IntApp />
                        </Provider>
                </>
        );
}

App = codePush({
        updateDialog: false,
        installMode: codePush.InstallMode.ON_NEXT_RESTART,
})(App)

export default App
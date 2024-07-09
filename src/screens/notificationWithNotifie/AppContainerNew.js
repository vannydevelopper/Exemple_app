import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, View, Linking } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { setUserAction } from "./store/actions/userActions";
import { userSelector } from "./store/selectors/userSelector";
import { Host } from "react-native-portalize";
import { setFCMTokenAction, setLocaleAction, setNotificationTokenAction } from "./store/actions/appActions";
import * as Notifications from 'expo-notifications';
import * as ExpoLinking from 'expo-linking';
import registerPushNotification from "./helpers/registerPushNotification";
import { useNetInfo } from "@react-native-community/netinfo";
import { useIntl } from "react-intl";
import fetchApi from "./helpers/fetchApi";
import WelcomeNavigator from "./routes/WelcomeNavigator";
import RootNavigator from "./routes/RootNavigator";
import NoInternet from "./components/app/NoInternet";
import Toast from "./components/app/Toast";
import messaging from '@react-native-firebase/messaging';

export default function AppContainer() {
        const [userLoading, setUserLoading] = useState(true)
        const dispatch = useDispatch()
        const user = useSelector(userSelector);

        const checkActive = async (newUser) => {
                try {
                        const fetchData = await fetchApi("/users/institutions/confirm")
                        await AsyncStorage.setItem("user", JSON.stringify({ ...newUser, ...fetchData.checkConfirmation }));
                        dispatch(setUserAction({ ...newUser, ...fetchData.checkConfirmation }))

                }
                catch (error) {
                        console.log(error)
                }
        }

        const setFCMToken = useCallback(async () => {
                // Register the device with FCM
                await messaging().registerDeviceForRemoteMessages();

                // Get the token
                const token = await messaging().getToken();
                dispatch(setFCMTokenAction(token))
        }, [])

        // const setToken = useCallback( async () => {
        //         const token = await registerPushNotification()
        //         dispatch(setNotificationTokenAction(token?.data))
        // },[])
        useEffect(() => {
                Notifications.setNotificationHandler({
                        handleNotification: async () => ({
                                shouldShowAlert: true,
                                shouldPlaySound: true,
                                shouldSetBadge: true,
                        }),
                });
                (async function () {
                        // setToken()
                        setFCMToken()
                        //     await AsyncStorage.removeItem('user')
                        const userCheck = await AsyncStorage.getItem("user");
                        const newUser = JSON.parse(userCheck)
                        const locale = await AsyncStorage.getItem("locale");
                        dispatch(setLocaleAction(locale || 'fr'))
                        dispatch(setUserAction(newUser));
                        if (newUser) {
                                checkActive(newUser)
                        }
                        setUserLoading(false);
                })();
        }, []);
        const prefix = ExpoLinking.createURL('/')

        const netinfo = useNetInfo()
        const intl = useIntl()
        useEffect(() => {
                if (!userLoading && netinfo.type !== 'unknown' && netinfo.isInternetReachable === false && !netinfo.isConnected) {
                        // toast.show({
                        //         placement: "top",
                        //         status: 'success',
                        //         duration: 10000,
                        //         render: () => <NoInternet />
                        // })
                }
        }, [netinfo, userLoading])
        if (userLoading) {
                return (
                        <View
                                style={{
                                        flex: 1,
                                        alignContent: "center",
                                        alignItems: "center",
                                        justifyContent: "center",
                                }}
                        >
                                <ActivityIndicator
                                        color="#007BFF"
                                        animating={userLoading}
                                        size="large"
                                />
                        </View>
                );
        }
        return (
                <Host>
                        {/* <UpdatingScreen /> */}
                        <NavigationContainer
                                linking={{
                                        prefixes: [prefix],
                                        config: {
                                        },
                                        async getInitialURL() {
                                                // First, you may want to do the default deep link handling
                                                // Check if app was opened from a deep link
                                                const url = await Linking.getInitialURL();

                                                if (url != null) {
                                                        return url;
                                                }

                                                // Handle URL from expo push notifications
                                                const response = await Notifications.getLastNotificationResponseAsync();
                                                const myUrl = response?.notification.request.content.data.url;
                                                return myUrl;
                                        },
                                        subscribe(listener) {
                                                const onReceiveURL = ({ url }) => listener(url);

                                                // Listen to incoming links from deep linking
                                                const linkingSubscription = Linking.addEventListener('url', onReceiveURL);

                                                // Listen to expo push notifications
                                                const subscription = Notifications.addNotificationResponseReceivedListener(response => {
                                                        const data = response.notification.request.content.data

                                                        // Any custom logic to see whether the URL needs to be handled
                                                        //...

                                                        // Let React Navigation handle the URL
                                                        listener(data.url);

                                                });
                                                return () => {
                                                        // Clean up the event listeners
                                                        // Linking.removeEventListener('url', onReceiveURL);
                                                        linkingSubscription.remove()
                                                        subscription.remove();
                                                };
                                        },
                                }}
                                theme={{
                                        colors: {
                                                background: "#E1EAF3",
                                        },
                                }}
                        >
                                <Toast />
                                {user ? <RootNavigator /> : <WelcomeNavigator />}
                        </NavigationContainer>
                </Host>
        );
}

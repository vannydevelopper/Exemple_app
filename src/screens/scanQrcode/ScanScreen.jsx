import React, { useState, useEffect } from 'react'
import { Button, Text, View, StyleSheet, TouchableNativeFeedback, ActivityIndicator } from 'react-native'
import { Portal } from 'react-native-portalize';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useToast } from 'native-base';
import { fetchApi, calcCrow } from '../../functions';
import { useDispatch, useSelector } from 'react-redux';
import { userSelector } from '../../store/selectors/userSelector';
import { setUserAction } from '../../store/actions/userActions';
import ErrorModalScan from '../../components/Error/ErrorModalScan';


export default function ScanScreen() {
        const [hasPermission, setHasPermission] = useState(null);
        const [scanned, setScanned] = useState(false);
        const [location, setLocation] = useState(null)
        const [loading, setLoading] = useState(false)
        const [errors, setErrors] = useState(null)
        const navigation = useNavigation()
        const toast = useToast()
        const user = useSelector(userSelector)
        const dispatch = useDispatch()

        const qrCodeCoords = {
                long: 29.3839331,
                lat: -3.3845894
        }

        const askCameraPermission = async () => {
                const { status } = await BarCodeScanner.requestPermissionsAsync();
                setHasPermission(status === "granted");
        }

        // const askLocationPermission = async () => {
        //         let { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
        //         if (locationStatus !== 'granted') {
        //                 console.log('Permission to access location was denied');
        //                 setLocation(false)
        //                 return;
        //         }
        //         var location = await Location.getCurrentPositionAsync({});
        //         // setLocation(location)
        // }
        useEffect(() => {
                askCameraPermission()
                // askLocationPermission()
        }, []);


        const qrCodeData = '~e5pJVNcN*UC#:q2ezWB7,9WS$Ca#Bzaw}f"tFT4#KHQTRTY``?]x+7UAPctRh3.N$@jn%[]Tv;;ZuQ*qHR&M[k+Z$7s]9su-n6}'

        const handleBarCodeScanned = async ({ type, data }) => {
                setScanned(true);
                //     clearTimeout(timer)
                try {
                        if (type == 256) {
                                setLoading(true)
                                let { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
                                if (locationStatus !== 'granted') {
                                        console.log('Permission to access location was denied');
                                        setLocation(false)
                                        return;
                                }
                                var location = await Location.getCurrentPositionAsync({});
                                if (location) {
                                        const distance = calcCrow(qrCodeCoords.lat, qrCodeCoords.long, location.coords.latitude, location.coords.longitude)
                                        if ((distance*1000) <= 50 ) {
                                                const presence = await fetchApi('/presences', {
                                                        method: 'POST',
                                                        body: JSON.stringify({
                                                                employeId: user.collaboId,
                                                                long: location.coords.longitude,
                                                                lat: location.coords.latitude,
                                                                PATH_QR_CODE:data,
                                                        }),
                                                        headers: {
                                                                'Content-Type': 'application/json'
                                                        }
                                                });
                                                dispatch(setUserAction({ ...user, presence: true }))
                                        }else{
                                                setErrors("Votre presence n'est pas pris en charge")
                                        }
                                }
                        }
                }
                catch (error) {
                        console.log(error)
                        if (error.errors) {
                                if (error.errors.message) {
                                        setErrors(error.errors.message)
                                } else {
                                        setErrors("Votre QrCode n'est pas correct")
                                }
                        } else {
                                setErrors("Votre QrCode n'est pas correct")
                        }
                } finally {
                        setLoading(false)
                }



                //     if(type == 256 && data == qrCodeData) {
                //               setLoading(true)
                //               Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                //               try {
                //                         const presence = await fetchApi('/presences', {
                //                                   method: 'POST',
                //                                   body: JSON.stringify({
                //                                             employeId: user.collaboId,
                //                                             long: location.coords.longitude,
                //                                             lat: location.coords.latitude
                //                                   }),
                //                                   headers: {
                //                                             'Content-Type': 'application/json'
                //                                   }
                //                         });
                //                         dispatch(setUserAction({...user, presence: true}))
                //               } catch (error) {
                //                         console.log(error)
                //                         setLoading(false)
                //                         Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
                //                         var timer = setTimeout(() => {
                //                                   setScanned(false)
                //                         }, 3000)
                //                         toast.show({
                //                                   title: "Présence non pris en compte",
                //                                   placement: "bottom",
                //                                   status: 'error',
                //                                   duration: 2000,
                //                                   maxWidth: '80%'
                //                         })
                //               }
                //     } else {
                //               Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
                //               var timer = setTimeout(() => {
                //                         setScanned(false)
                //               }, 2000)
                //     }
        };

        /* if (hasPermission === null) {
                  return <Text>Requesting for camera permission</Text>;
        } */
        if (hasPermission === false) {
                return <View style={{ alignContent: 'center', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                        <Text>Pas d'accès à la caméra</Text>
                        <TouchableNativeFeedback
                                background={TouchableNativeFeedback.Ripple('#fff')}
                                useForeground={true}
                                onPress={() => askCameraPermission()}
                        >
                                <View style={{ backgroundColor: '#ddd', borderRadius: 10, padding: 10, marginTop: 50 }}>
                                        <Text>Autoriser l'accès</Text>
                                </View>
                        </TouchableNativeFeedback>
                </View>
        }

        if (location === false) {
                return <View style={{ alignContent: 'center', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                        <Text>Pas d'accès à la localisation</Text>
                        <TouchableNativeFeedback
                                background={TouchableNativeFeedback.Ripple('#fff')}
                                useForeground={true}
                                onPress={() => askLocationPermission()}
                        >
                                <View style={{ backgroundColor: '#ddd', borderRadius: 10, padding: 10, marginTop: 50 }}>
                                        <Text>Autoriser l'accès</Text>
                                </View>
                        </TouchableNativeFeedback>
                </View>
        }

        return (
                <Portal>
                        <View style={styles.container}>
                                {errors ? <ErrorModalScan onClose={() => setErrors(null)} body={errors} handleTitle="Ok" /> : null}
                                <BarCodeScanner
                                        // onBarCodeScanned={scanned || !location ? undefined : handleBarCodeScanned}
                                        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                                        style={StyleSheet.absoluteFillObject}
                                        barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
                                />
                                <View style={styles.mask}>
                                        <Text style={styles.scanTitle}>
                                                Scanner un QR code de présence
                                        </Text>
                                        <View style={styles.maskScan} />
                                        <View style={styles.scanActions}>
                                                {/* {location && <Text style={{color: 'red'}}>{ calcCrow(qrCodeCoords.lat, qrCodeCoords.long, location.coords.latitude, location.coords.longitude) }</Text>} */}
                                                <TouchableNativeFeedback
                                                        background={TouchableNativeFeedback.Ripple('#ddd')}
                                                        useForeground={true}
                                                        onPress={() => navigation.goBack()}
                                                >
                                                        <View style={styles.actionBtn}>
                                                                <Ionicons name="close" size={40} color="#fff" />
                                                        </View>
                                                </TouchableNativeFeedback>
                                        </View>
                                </View>
                                {loading && <View style={{ flex: 1, height: '100%', width: '100%', backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'center', alignItems: 'center', position: 'absolute' }}>
                                        <View style={{ width: 100, height: 100, backgroundColor: '#fff', borderRadius: 100, justifyContent: 'center', alignItems: 'center' }}>
                                                <ActivityIndicator animating={true} color={'#000'} size='large' />
                                        </View>
                                </View>}
                        </View>
                </Portal>
        );
}
const styles = StyleSheet.create({
        container: {
                flex: 1,
                paddingVertical: 30,
                borderStartColor: '#fff'
        },
        mask: {
                flex: 1,
                alignItems: 'center',
                justifyContent: 'space-around'
        },
        scanTitle: {
                color: '#fff',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                fontSize: 16,
                padding: 15,
                borderRadius: 10
        },
        scanActions: {
                flexDirection: 'row',
                justifyContent: 'space-around',
                alignContent: 'center',
                alignItems: 'center',
                width: '100%'
        },
        maskScan: {
                width: '70%',
                height: 250,
                borderColor: '#fff',
                borderRadius: 20,
                borderWidth: 2,
                backgroundColor: 'transparent'
        },
        actionBtn: {
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                padding: 10,
                borderRadius: 100,
                justifyContent: 'center',
                alignContent: 'center',
                alignItems: 'center',
                overflow: 'hidden'
        }
})
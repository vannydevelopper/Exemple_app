import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, BackHandler, Image, StyleSheet, Text, TouchableNativeFeedback, TouchableOpacity, View, useWindowDimensions } from 'react-native'
import MapboxGL from '@rnmapbox/maps';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { DrawerActions, useNavigation, useRoute } from '@react-navigation/native';
import { AntDesign, FontAwesome, MaterialCommunityIcons, Ionicons, Entypo } from '@expo/vector-icons';
import * as Location from 'expo-location'
import { Feather } from '@expo/vector-icons';
import fetchApi from '../../helpers/fetchApi';
import Loading from '../../components/app/Loading';
import { useDispatch, useSelector } from 'react-redux';
import { userSelector } from '../../store/selectors/userSelector';
import { Modalize } from 'react-native-modalize';
import MapTypesModalize from '../../components/map/MapTypesModalize';
import { Portal } from 'react-native-portalize';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { COLORS } from '../../styles/COLORS';
import wait from '../../helpers/wait';
import { useIntl } from 'react-intl';
import { OutlinedTextField } from "rn-material-ui-textfield";
import { useForm } from '../../hooks/useForm';
import { useFormErrorsHandle } from '../../hooks/useFormErrorsHandle';


export const ACCESS_TOKEN = 'pk.eyJ1IjoiZHVraXp3ZSIsImEiOiJja3pvYmg1cnMzNmswMnVueTU4YnEyczgzIn0.qEoChU3ktP0_WUusXi9ZCg'
MapboxGL.setAccessToken(ACCESS_TOKEN);

export default function AdresseFavorisMapScreen() {
        const [isDragging, setIsDragging] = useState(false)
        const [reverseGeocodingResult, setReverseGeocodingResult] = useState(null)
        const [initialLoading, setInitialLoading] = useState(true)
        const [currentLocation, setCurrentLocation] = useState(null)
        const [initialLocation, setInitialLocation] = useState(null)
        const [selectedLocation, setSelectedLocation] = useState(null)
        const navigation = useNavigation()
        const route = useRoute()
        const [loadingStreet, setLoadingStreet] = useState(true)
        const [centerCoordinate, setCenterCoordinate] = useState(null)
        const cameraRef = useRef(null)
        const [isEnabled, setIsEnabled] = useState(true);
        const [loading, setLoading] = useState(false)
        const user = useSelector(userSelector)
        const dispatch = useDispatch()
        const mapTypeModalizeRef = useRef()
        const [mapType, setMapType] = useState(MapboxGL.StyleURL.Street)
        const [mapHeight, setMapHeight] = useState(0)
        const [isOpen, setIsOpen] = useState(false)
        const MAX_LENGTH = 20

        const backHandler = useRef(null)
        const intl = useIntl()

        const { Home, Work, location } = route.params

        const [data, handleChange, setValue] = useForm({
                titre: "",
        })

        const { errors, setError, getErrors, setErrors, checkFieldData, isValidate, getError, hasError } = useFormErrorsHandle(data, {
                titre: {
                        required: true,
                        alpha: true,
                        length: [1, MAX_LENGTH]
                }
        }, {
                titre: {
                        required: intl.formatMessage({ id: "LoginScreen.required" }),
                        alpha: intl.formatMessage({ id: "ModifierPasswordScreen.caracteres" }),
                        length: intl.formatMessage({ id: "OtherRaisonInput.numbreMinimun" })
                },
        })

        const [selectedAdress, setSelectedAdress] = useState(null)

        useEffect(() => {
                if (location) {
                        setSelectedAdress(location)
                }
        }, [location])

        const { width } = useWindowDimensions()

        const onProfilePress = useCallback(() => {
                navigation.goBack()
        }, [])

        const translateY = useSharedValue(0)
        const animatedStyles = useAnimatedStyle(() => ({
                transform: [{ translateY: translateY.value }]
        }))


        const onRegionDidChange = useCallback(async (coordinates) => {
                try {
                        setSelectedLocation(coordinates)
                        // const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${newRegion.geometry.coordinates.join(',')}.json?access_token=${ACCESS_TOKEN}&country=BI&limit=1&routing=false`
                        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coordinates[1]}&lon=${coordinates[0]}&accept-language=fr`
                        const res = await fetch(url)
                        const json = await res.json()
                        setReverseGeocodingResult(json)
                } catch (error) {
                        console.log(error)
                } finally {
                        setLoadingStreet(false)
                }
        }, [])

        const isValidAdd = () => {
                var isValid = false
                isValid = reverseGeocodingResult != null ? true : false
                return isValid && isValidate()
        }

        const handleTargetPress = useCallback(async () => {
                setCenterCoordinate(currentLocation)
                cameraRef.current.setCamera({
                        centerCoordinate: currentLocation,
                        zoomLevel: 17,
                        animationDuration: 1000
                })
        }, [currentLocation, cameraRef.current])

        const onConfirm = async () => {
                try {
                        setLoading(true)
                        const form = new FormData()
                        if (data.titre) {
                                form.append('TITRE', data.titre)
                        }
                        if (selectedLocation[1]) {
                                form.append('LATITUDE', selectedLocation[1])
                        }
                        if (selectedLocation[0]) {
                                form.append('LONGITUDE', selectedLocation[0])
                        }
                        if (reverseGeocodingResult.display_name) {
                                form.append('NOM_ADRESSE', reverseGeocodingResult.display_name)
                        }

                        const userData = await fetchApi(`/driver/drivers//newadresse/places/${user.ID_DRIVER}`, {
                                method: "POST",
                                body: form
                        });
                        await wait(500)
                        navigation.navigate("AdresseFavorisScreen")
                }
                catch (error) {
                        console.log(error)
                }
                finally {
                        setLoading(false)
                }
        }

        useEffect(() => {
                if (cameraRef.current) {
                        if (selectedAdress) {
                                setLoadingStreet(true)
                                setCenterCoordinate([location.lon, location.lat])
                                cameraRef.current.flyTo([location.lon, location.lat], 1000)
                        } else if (initialLocation) {
                                setCenterCoordinate(initialLocation)
                                cameraRef.current.flyTo(initialLocation, 1000)
                        }
                }
        }, [initialLocation, selectedAdress])

        useEffect(() => {
                setInitialLoading(false)
        }, [])

        useEffect(() => {
                if (isDragging) {
                        translateY.value = withTiming(-10, { duration: 100 })
                } else {
                        translateY.value = withTiming(0, { duration: 100 })
                }
        }, [isDragging])

        useEffect(() => {
                (async () => {
                        let { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
                        if (locationStatus !== 'granted') {
                                return setLoading(false)
                        }
                        var loc = await Location.getCurrentPositionAsync({});
                })()
        }, []);
        if (initialLoading) {
                return null
        }

        const AnimatedIcon = Animated.createAnimatedComponent(FontAwesome)
        return (
                <>
                        {<Loading isLoading={loading} />}
                        <View style={styles.container}>
                                <MapboxGL.MapView
                                        style={styles.map}
                                        onCameraChanged={() => {
                                                if (!loadingStreet) {
                                                        setLoadingStreet(true)
                                                }
                                        }}
                                        onMapIdle={(state) => {
                                                onRegionDidChange(state.properties.center)
                                        }}
                                        onTouchStart={() => {
                                                setIsDragging(true)
                                        }}
                                        onTouchEnd={() => setIsDragging(false)}
                                        styleURL={mapType}
                                        onLayout={event => {
                                                setMapHeight(event.nativeEvent.layout.height)
                                        }}
                                        zoomEnabled={true}
                                        logoEnabled={false}
                                        attributionEnabled={false}
                                        scaleBarEnabled={false}
                                >
                                        <MapboxGL.UserLocation
                                                // showsUserHeadingIndicator
                                                renderMode="normal"
                                                animated
                                                onUpdate={point => {
                                                        setCurrentLocation([point.coords.longitude, point.coords.latitude])
                                                        if (!initialLocation) {
                                                                setInitialLocation([point.coords.longitude, point.coords.latitude])
                                                        }
                                                }}
                                                androidRenderMode='normal'
                                                minDisplacement={5}
                                        />
                                        <MapboxGL.Camera
                                                zoomLevel={17}
                                                centerCoordinate={centerCoordinate}
                                                animationMode="none"
                                                ref={cameraRef}
                                        />
                                </MapboxGL.MapView>

                                <View style={[styles.insideMap, { height: mapHeight }]}>
                                        <View style={styles.header}>
                                                <TouchableOpacity onPress={onProfilePress} style={styles.imageContainer}>
                                                        <Ionicons name="chevron-back" size={24} color="black" />
                                                </TouchableOpacity>
                                        </View>

                                        {(isEnabled) ? <View style={[styles.mapPin, { top: (mapHeight / 2) - 50, left: (width / 2) - 25 }]}>
                                                <View style={styles.shadow} />
                                                <AnimatedIcon name="map-pin" size={60} color={COLORS.primary} style={[styles.pinImg, animatedStyles]} />
                                        </View> : null}
                                        {<TouchableOpacity style={[styles.targetLocationBtn]} onPress={handleTargetPress}>
                                                <MaterialCommunityIcons name="target" size={24} color="#777" />
                                        </TouchableOpacity>}
                                        <TouchableOpacity style={styles.mapTypeBtn} activeOpacity={0.5} onPress={() => {
                                                setIsOpen(true)
                                                mapTypeModalizeRef.current.open()
                                        }}>
                                                <Feather name="map" size={20} color="#777" />
                                        </TouchableOpacity>
                                </View>

                                <View style={styles.footerContainer}>
                                        <View style={[styles.footer]}>
                                                <View style={[styles.footerBtn, loadingStreet && { opacity: 0.5 }]}>
                                                        <View style={styles.detailsIcon}>
                                                                <View style={styles.footerItemDetails}>
                                                                        <Text style={styles.footerItemTitle}>
                                                                                {intl.formatMessage({ id: "EditAdressTitleInput.Adresse" })}
                                                                        </Text>
                                                                        <Text style={styles.footerItemValue} numberOfLines={1}>
                                                                                {reverseGeocodingResult ? reverseGeocodingResult.display_name : '-'}
                                                                        </Text>
                                                                </View>
                                                        </View>
                                                </View>
                                                <View style={{ marginHorizontal: 10 }}>

                                                        <OutlinedTextField
                                                                label={intl.formatMessage({ id: "EditAdressTitleInput.Titre" })}
                                                                fontSize={14}
                                                                baseColor={COLORS.smallBrown}
                                                                tintColor={COLORS.primary}
                                                                containerStyle={{ borderRadius: 20 }}
                                                                labelTextStyle={{ fontFamily: "Nunito" }}
                                                                lineWidth={0.5}
                                                                activeLineWidth={0.5}
                                                                errorColor={COLORS.error}
                                                                value={data.titre}
                                                                onChangeText={(newValue) => handleChange('titre', newValue.slice(0, MAX_LENGTH))}
                                                                onBlur={() => checkFieldData('titre')}
                                                                error={hasError('titre') ? getError('titre') : ''}
                                                                autoFocus
                                                                multiline
                                                                returnKeyType="send"
                                                                suffix={<Text style={{ fontSize: 10, fontFamily: "Nunito" }}>{data.titre.length}/{MAX_LENGTH}</Text>}
                                                        />
                                                </View>

                                                <View style={{ padding: 10 }}>
                                                        <TouchableNativeFeedback disabled={!isValidAdd} onPress={onConfirm}>
                                                                <View style={[styles.submitBtn, { opacity: !isValidAdd() ? 0.5 : 1 }]}>
                                                                        <Text style={styles.submitBtnText}>
                                                                                {intl.formatMessage({ id: "AdresseFavorisMapScreen.ConfirmerAdress" })}
                                                                        </Text>
                                                                </View>
                                                        </TouchableNativeFeedback>
                                                </View>
                                        </View>
                                        <Portal>
                                                <GestureHandlerRootView style={{ height: isOpen ? '100%' : 0, opacity: isOpen ? 1 : 0, backgroundColor: 'rgba(0, 0, 0, 0)', position: 'absolute', width: '100%', zIndex: 1 }}>
                                                        <Modalize
                                                                ref={mapTypeModalizeRef}
                                                                adjustToContentHeight
                                                                handlePosition='inside'
                                                                modalStyle={{
                                                                        borderTopRightRadius: 10,
                                                                        borderTopLeftRadius: 10,
                                                                        paddingVertical: 20
                                                                }}
                                                                handleStyle={{ marginTop: 10 }}
                                                                scrollViewProps={{
                                                                        keyboardShouldPersistTaps: "handled"
                                                                }}
                                                                onClosed={() => {
                                                                        setIsOpen(false)
                                                                }}
                                                        >
                                                                <MapTypesModalize mapType={mapType} handleMapTypePress={(type) => {
                                                                        mapTypeModalizeRef.current.close()
                                                                        setMapType(type)
                                                                }} />
                                                        </Modalize>
                                                </GestureHandlerRootView>
                                        </Portal>
                                </View>
                        </View>
                </>
        )
}

const styles = StyleSheet.create({
        container: {
                flex: 1,
        },
        map: {
                flex: 1
        },
        header: {
                position: 'absolute',
                width: '100%',
                top: 0,
                height: 60,
                paddingHorizontal: 10
        },
        headerContent: {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                // backgroundColor: '#FFF',
                marginTop: 10,
                padding: 10,
                borderRadius: 5
        },
        imageContainer: {
                width: 50,
                height: 50,
                backgroundColor: '#fff',
                borderRadius: 8,
                padding: 2,
                justifyContent: 'center',
                alignItems: 'center'
        },
        image: {
                width: "100%",
                height: "100%",
                borderRadius: 40,
                resizeMode: "center"
        },
        onlineText: {
                fontSize: 16,
                fontWeight: 'bold',
                opacity: 0.8
        },
        headerBtn: {
                padding: 10,
                borderRadius: 20
        },
        insideMap: {
                position: 'absolute',
                width: '100%',
                // backgroundColor: 'red'
        },
        mapPin: {
                position: 'absolute',
                alignItems: "center",
                justifyContent: 'center',
                width: 50,
                height: 50
        },
        pinImg: {
                position: 'absolute',
                bottom: 0
        },
        shadow: {
                height: 10,
                width: 10,
                backgroundColor: 'rgba(0, 0, 0, 0.15)',
                borderRadius: 20,
                position: 'absolute',
                bottom: -2.5
        },
        footerContainer: {
                width: '100%',
                backgroundColor: '#FFF',
                borderTopLeftRadius: 15,
                borderTopRightRadius: 15
        },
        footer: {
                // backgroundColor: '#FFF',
        },
        mapTypeBtn: {
                backgroundColor: '#fff',
                width: 50,
                height: 50,
                borderRadius: 50,
                justifyContent: 'center',
                alignItems: 'center',
                elevation: 5,
                shadowColor: '#c4c4c4',
                position: 'absolute',
                right: 10,
                bottom: 70,
                zIndex: 1000
        },
        targetLocationBtn: {
                backgroundColor: '#fff',
                width: 50,
                height: 50,
                borderRadius: 50,
                justifyContent: 'center',
                alignItems: 'center',
                elevation: 5,
                shadowColor: '#c4c4c4',
                position: 'absolute',
                right: 10,
                bottom: 10,
                zIndex: 1000
        },
        footerBtn: {
                flexDirection: 'row',
                alignItems: "center",
                paddingHorizontal: 15,
                paddingVertical: 20,
                borderBottomWidth: 1,
                borderBottomColor: '#F1F1F1'
        },
        currentIcon: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                flex: 1
                // width: 40,
                // height: 40,
                // borderWidth: 1,
                // borderColor: '#85969F',
                // borderRadius: 50,
                // justifyContent: "center",
                // alignItems: "center"
        },
        secondCircle: {
                width: '50%',
                height: '50%',
                borderWidth: 1,
                borderColor: '#85969F',
                borderRadius: 50,
                justifyContent: "center",
                alignItems: "center"
        },
        lastCircle: {
                backgroundColor: '#85969F',
                width: '80%',
                height: '80%',
                borderRadius: 30
        },
        footerItemTitle: {
                fontSize: 20,
                fontFamily: "Nunito-ExtraBold",
                color: '#333'
        },
        detailsIcon: {
                marginLeft: 10,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                flex: 1
        },
        footerItemDetails: {
                width: '90%'
        },
        footerItemValue: {
                color: '#777',
                fontSize: 12,
                fontFamily: "Nunito"
        },
        footerItemIcon: {
                width: 40,
                height: 40,
                backgroundColor: '#85969F',
                borderRadius: 50,
                justifyContent: 'center',
                alignContent: 'center',
                alignItems: 'center'
        },
        submitBtn: {
                backgroundColor: COLORS.primary,
                borderRadius: 5,
                paddingVertical: 15
        },
        submitBtnText: {
                textAlign: 'center',
                color: '#fff',
                fontFamily: "Nunito-Bold"
        },
        carPin: {
                width: 40,
                height: 40,
                resizeMode: 'contain'
        },
        marker: {
                justifyContent: 'center',
                alignItems: 'center',
                maxWidth: 240,
                marginBottom: 95,
                borderRadius: 5
        },
        markerCard: {
                backgroundColor: '#fff',
                padding: 5,
                paddingHorizontal: 12,
                borderRadius: 5,
                elevation: 5,
                shadowColor: '#f1f1f1',
                marginBottom: 12
        },
        markerCardLine: {
                flexDirection: 'row',
                alignItems: 'center'
        },
        markerCardText: {
                fontSize: 10,
                color: '#777',
                marginLeft: 5
        },
        downCaret: {
                position: 'absolute',
                width: 20,
                height: 20,
                backgroundColor: '#fff',
                borderRadius: 2,
                zIndex: -1,
                alignSelf: 'center',
                bottom: '-15%',
                transform: [{
                        rotate: '45deg'
                }]
        },
        searchDriver: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                marginTop: 20
        },
        searchDriverTitle: {
                fontSize: 16,
                fontWeight: 'bold'
        },
        confirmActions: {
                flexDirection: 'row',
                alignItems: 'center'
        },
        closeBtn: {
                borderWidth: 1,
                borderColor: COLORS.primary,
                padding: 10,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 5
        },
        confirmBtn: {
                flex: 1,
                marginLeft: 15
        }
})
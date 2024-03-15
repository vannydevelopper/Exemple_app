import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, BackHandler, Image, StyleSheet, Text, TouchableNativeFeedback, TouchableOpacity, View, useWindowDimensions } from 'react-native'
import MapboxGL from '@rnmapbox/maps';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { DrawerActions, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
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

export default function MapAdresseRouteScreen() {
        const navigation = useNavigation()
        const route = useRoute()
        const [mapHeight, setMapHeight] = useState(0)
        const cameraRef = useRef(null)
        const [loadingPickupAddress, setLoadingPickupAddress] = useState(true)

        const [isMapLoaded, setIsMapLoaded] = useState(false)

        const intl = useIntl()

        const { adresse: incAdresse } = route.params || {}
        // const [course, setCourse] = useState(incCourse)

        const [trajet, setTrajet] = useState(incAdresse)
        const [selectedPickup, setSelectedPickup] = useState(null)
        const [selectedDestination, setSelectedDestination] = useState(null)
        const [loadingDirection, setLoadingDirection] = useState(true)
        const [routeGeoJSON, setrouteGeoJSON] = useState(null);
        const [location, setLocation] = useState(null)
        const [reverseGeocodingResult, setReverseGeocodingResult] = useState(null)


        const refreshLocation = async () => {
                try {
                        const loc = await Location.getCurrentPositionAsync()
                        let longitude = loc.coords.longitude
                        let latitude = loc.coords.latitude
                        setLocation(loc)
                        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${loc.coords.latitude}&lon=${loc.coords.longitude}&accept-language=fr`
                        const response = await fetch(url)
                        const result = await response.json()
                        setReverseGeocodingResult(result)
                        setSelectedPickup({
                                location: [longitude, latitude],
                                reverseGeocodingResult: result
                        })
                } catch (error) {
                        console.log(error)
                }
        }

        useEffect(() => {
                (async () => {
                        if (selectedPickup && selectedDestination && isMapLoaded) {
                                try {
                                        setLoadingDirection(true)
                                        // cameraRef.current?.setCamera({ centerCoordinate: null })
                                        cameraRef.current?.fitBounds([selectedPickup.location[0], selectedPickup.location[1]], [selectedDestination.location[0], selectedDestination.location[1]], [200, 100, 50, 100], 1000)
                                        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${selectedPickup.location[0]},${selectedPickup.location[1]};${selectedDestination.location[0]},${selectedDestination.location[1]}?alternatives=true&geometries=geojson&language=en&overview=simplified&steps=true&access_token=${ACCESS_TOKEN}`
                                        const res = await fetch(url)
                                        const data = await res.json()
                                        let lineStringGeoJSON = {
                                                type: 'FeatureCollection',
                                                features: [
                                                        {
                                                                type: 'Feature',
                                                                properties: {},
                                                                geometry: data?.routes[0]?.geometry,
                                                        },
                                                ],
                                        };
                                        setrouteGeoJSON(lineStringGeoJSON)
                                        // setDirection(data)
                                } catch (error) {
                                        console.log(error)
                                } finally {
                                        setLoadingDirection(false)
                                }
                        }
                })()
        }, [selectedPickup, selectedDestination, isMapLoaded])

        useFocusEffect(useCallback(() => {
                refreshLocation()
        }, []))

        useEffect(() => {
                (async () => {
                        try {
                                setSelectedDestination({
                                        location: [trajet.LONGITUDE, trajet.LATITUDE],
                                        reverseGeocodingResult: trajet.NOM_ADRESSE
                                })
                        } catch (error) {
                                console.log(error)
                        } finally {
                                setLoadingPickupAddress(false)
                        }
                })()
        }, [trajet])



        return (
                <View style={styles.container}>
                        <MapboxGL.MapView
                                style={styles.map}
                                onLayout={event => {
                                        setMapHeight(event.nativeEvent.layout.height)
                                }}
                                zoomEnabled={true}
                                logoEnabled={false}
                                attributionEnabled={false}
                                scaleBarEnabled={false}
                                onDidFinishLoadingMap={() => {
                                        setIsMapLoaded(true)
                                }}
                        >
                                <MapboxGL.Camera
                                        zoomLevel={17}
                                        centerCoordinate={selectedPickup ? selectedPickup.location : null}
                                        // centerCoordinate={direction ? direction : null}
                                        animationMode="none"
                                        ref={cameraRef}
                                />
                                {selectedPickup ? <MapboxGL.MarkerView
                                        coordinate={selectedPickup.location}
                                        key='pickup'
                                >
                                        <View style={[styles.marker, { marginTop: 20 }]}>
                                                <View style={styles.markerCard}>
                                                        <View style={styles.markerInfoContent}>
                                                                <View style={styles.markerCardLine}>
                                                                        <View style={[styles.currentIcon, { width: 15, height: 15 }]}>
                                                                                <View style={styles.secondCircle}>
                                                                                        <View style={styles.lastCircle} />
                                                                                </View>
                                                                        </View>
                                                                        <View>
                                                                                <Text style={[styles.markerCardText, { fontWeight: 'bold', color: '#000' }]}>{intl.formatMessage({ id: 'MapAdresseRouteScreen.Localisation' })}</Text>
                                                                                <Text style={styles.markerCardText} numberOfLines={1}>
                                                                                        {selectedPickup ? reverseGeocodingResult?.display_name : ''}
                                                                                </Text>
                                                                        </View>
                                                                </View>
                                                                <View style={styles.downCaret} />
                                                        </View>
                                                </View>
                                                <View style={[styles.currentIcon, { width: 20, height: 20, borderWidth: 0, backgroundColor: '#40a4ae75' }]}>
                                                        <View style={[styles.secondCircle, { borderColor: '#fff', width: '40%', height: '40%', borderWidth: 2 }]}>
                                                                <View style={[styles.lastCircle, { opacity: 1, backgroundColor: '#40a4ae' }]} />
                                                        </View>
                                                </View>
                                        </View>
                                </MapboxGL.MarkerView> : null}
                                {selectedDestination ? <MapboxGL.MarkerView
                                        coordinate={selectedDestination.location}
                                >
                                        <View style={styles.marker}>
                                                <View style={styles.markerCard}>
                                                        <View style={styles.markerInfoContent}>
                                                                <View style={styles.markerCardLine}>
                                                                        <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.primary} style={{}} />
                                                                        <View style={{}}>
                                                                                <Text style={[styles.markerCardText, { fontFamily: 'Nunito-Bold', color: '#000' }]}>{intl.formatMessage({ id: 'CarteAdresseTrajetMapScreen.Destination' })}</Text>
                                                                                <Text style={styles.markerCardText} numberOfLines={1}>
                                                                                        {selectedDestination?.reverseGeocodingResult}
                                                                                </Text>
                                                                        </View>
                                                                </View>
                                                                <View style={styles.downCaret} />
                                                        </View>
                                                </View>
                                                <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.primary} style={{}} />
                                        </View>
                                </MapboxGL.MarkerView> : null}
                                {routeGeoJSON ? <MapboxGL.ShapeSource id="routeLine" shape={routeGeoJSON}>
                                        <MapboxGL.LineLayer id="lines" style={{
                                                lineWidth: 3,
                                                lineCap: "round",
                                                lineJoin: "round",
                                                lineColor: COLORS.primary
                                        }} />
                                </MapboxGL.ShapeSource> : null}

                        </MapboxGL.MapView>
                        <View style={[styles.insideMap, { height: mapHeight }]}>
                                <View style={styles.header}>
                                        <TouchableOpacity onPress={() => {
                                                navigation.goBack()
                                        }} style={styles.imageContainer}>
                                                <AntDesign name="close" size={24} color={COLORS.primary} />
                                        </TouchableOpacity>
                                </View>
                        </View>
                </View>
        )
}

const styles = StyleSheet.create({
        container: {
                flex: 1,
        },
        map: {
                flex: 1
        },
        marker: {
                justifyContent: 'center',
                alignItems: 'center',
                maxWidth: 240,
                marginBottom: 95
        },
        markerCard: {
                padding: 5,
                paddingHorizontal: 12,
                marginBottom: -2,
        },
        markerInfoContent: {
                borderRadius: 10,
                backgroundColor: '#fff',
                elevation: 5,
                padding: 5,
                paddingHorizontal: 12,
        },
        markerCardLine: {
                flexDirection: 'row',
                alignItems: 'center',
                padding: 5
        },
        markerCardText: {
                fontSize: 10,
                color: '#777',
                marginLeft: 5,
                fontFamily: "Nunito"
        },
        currentIcon: {
                width: 40,
                height: 40,
                borderWidth: 1,
                borderColor: '#85969F',
                borderRadius: 50,
                justifyContent: "center",
                alignItems: "center"
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
        insideMap: {
                position: 'absolute',
                width: '100%',
                // backgroundColor: 'red'
        },
        header: {
                position: 'absolute',
                width: '100%',
                top: 0,
                padding: 10
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
})
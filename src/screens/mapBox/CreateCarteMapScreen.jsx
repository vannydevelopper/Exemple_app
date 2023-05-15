import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableNativeFeedback, ActivityIndicator, Image, StatusBar, TouchableOpacity } from "react-native";
import Animated, { useAnimatedStyle, useInterpolateConfig, useSharedValue, withTiming } from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import MapboxGL from '@rnmapbox/maps';
import * as Location from 'expo-location'
import fetchApi from "../../helpers/fetchApi";

export const ACCESS_TOKEN = 'pk.eyJ1IjoibWFydGlubWVkaWFib3giLCJhIjoiY2s4OXc1NjAxMDRybzNobTE2dmo1a3ZndCJ9.W9Cm7Pjp25FQ00bII9Be6Q'
// export const ACCESS_TOKEN = 'pk.eyJ1IjoiZHVraXp3ZSIsImEiOiJja3pvYmg1cnMzNmswMnVueTU4YnEyczgzIn0.qEoChU3ktP0_WUusXi9ZCg'
MapboxGL.setAccessToken(ACCESS_TOKEN);

export default function MapAgentScreen() {
        const navigation = useNavigation()
        const [loading, setLoading] = useState(false)
        const [location, setLocation] = useState(null)
        const [loadingMap, setLoadingMap] = useState(true)

        const [locAgents, setLocAgents] = useState(null)
        const [loadingAgents, setLoadingAgents] = useState(false)
        const [direction, setDirection] = useState(null)
        const [routeGeoJSON, setrouteGeoJSON] = useState(null);
        const [loadingRoutes, setLoadingRoutes] = useState(true)

        const [selectedLocation, setSelectedLocation] = useState(null)
        const [loadingStreet, setLoadingStreet] = useState(false)
        const [reverseGeocodingResult, setReverseGeocodingResult] = useState(null)



          const searchLocalisation = useCallback(() => {
                    console.log(location)
          }, [location])

        const onRegionDidChange = async (newRegion) => {
                try {
                        setSelectedLocation(newRegion.geometry.coordinates)
                        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${newRegion.geometry.coordinates.join(',')}.json?access_token=${ACCESS_TOKEN}&country=BI&limit=1&routing=false`
                        const res = await fetch(url)
                        const json = await res.json()
                        setReverseGeocodingResult(json.features[0])
                } catch (error) {
                        console.log(error)
                } finally {
                        setLoadingStreet(false)
                }
        }

        useEffect(() => {
                (async () => {
                        let { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
                        if (locationStatus !== 'granted') {
                                return setLoading(false)
                        }
                        var loc = await Location.getCurrentPositionAsync({});
                        setLocation([loc.coords.longitude, loc.coords.latitude])
                })()
        }, []);

        useEffect(() => {
                const timer = setTimeout(() => {
                        setLoadingMap(false)
                }, 1000)
                return () => {
                        clearTimeout(timer)
                }
        }, [])

        //Fonction pour recuperer des coordonnees de l'affectation de l'agent
        useEffect(() => {
                (async () => {
                        try {
                                setLoadingAgents(true)
                                if (location) {
                                        const rep = await fetchApi("/users/connected")
                                        setLocAgents(rep)
                                }
                        }
                        catch (error) {
                                console.log(error)
                        } finally {
                                setLoadingAgents(false)
                        }
                })()
        }, [location])


        //Fonction pour tracer une route d'une coordonees quelconques
        useEffect(() => {
                (async () => {
                        try {
                                if (location && locAgents) {
                                        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${location[0]},${location[1]};${locAgents.LONGITUDE},${locAgents.LATITUDE}?alternatives=true&geometries=geojson&language=en&overview=simplified&steps=true&access_token=${ACCESS_TOKEN}`
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
                                        setDirection(data)
                                }
                        }
                        catch (error) {
                                console.log(error)
                        } finally {
                                setLoadingRoutes(false)
                        }
                })()
        }, [location, locAgents])



        if (loadingMap) {
                return <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                        <ActivityIndicator animating size={"large"} color='#000' />
                </View>
        }
        return (
                <>

                        <View style={styles.container}>
                                <StatusBar hidden />
                                {location ? <MapboxGL.MapView
                                        style={styles.map}
                                        onRegionDidChange={onRegionDidChange}
                                // zoomEnabled={false}
                                >
                                        <MapboxGL.Camera
                                                zoomLevel={13}
                                                centerCoordinate={location}
                                                animationMode="none"
                                        />
                                        <MapboxGL.MarkerView
                                                coordinate={location}
                                                key='pickup'
                                        >
                                                <View style={[styles.marker, { marginTop: 20 }]}>
                                                        <View style={styles.markerCard}>
                                                                <View style={styles.markerCardLine}>
                                                                        <View style={[styles.currentIcon, { width: 20, height: 20 }]}>
                                                                                <View style={styles.secondCircle}>
                                                                                        <View style={styles.lastCircle} />
                                                                                </View>
                                                                        </View>
                                                                        <View>
                                                                                <Text style={[styles.markerCardText, { fontWeight: 'bold', color: '#000' }]}>Point actuelle</Text>
                                                                                <Text style={styles.markerCardText} numberOfLines={1}>
                                                                                        {/* {selectedPickup.reverseGeocodingResult ? selectedPickup.reverseGeocodingResult.display_name : ''} */}
                                                                                        Agents
                                                                                </Text>
                                                                        </View>
                                                                </View>
                                                                <View style={styles.downCaret} />
                                                        </View>
                                                        <View style={[styles.currentIcon, { width: 40, height: 40, borderWidth: 0, backgroundColor: '#40a4ae75' }]}>
                                                                <View style={[styles.secondCircle, { borderColor: '#fff', width: '40%', height: '40%', borderWidth: 2 }]}>
                                                                        <View style={[styles.lastCircle, { opacity: 1, backgroundColor: '#40a4ae' }]} />
                                                                </View>
                                                        </View>
                                                </View>
                                        </MapboxGL.MarkerView>

                                        {locAgents ? <MapboxGL.MarkerView
                                                coordinate={[locAgents.LONGITUDE, locAgents.LATITUDE]}
                                                key='pickupDestination'
                                        >
                                                <View style={[styles.marker, { marginTop: 20 }]}>
                                                        <View style={styles.markerCard}>
                                                                <View style={styles.markerCardLine}>
                                                                        <View style={[styles.currentIcon, { width: 20, height: 20 }]}>
                                                                                <View style={styles.secondCircle}>
                                                                                        <View style={styles.lastCircle} />
                                                                                </View>
                                                                        </View>
                                                                        <View>
                                                                                <Text style={[styles.markerCardText, { fontWeight: 'bold', color: '#000' }]}>Point d'affectation</Text>
                                                                                <Text style={styles.markerCardText} numberOfLines={1}>
                                                                                        {/* {selectedPickup.reverseGeocodingResult ? selectedPickup.reverseGeocodingResult.display_name : ''} */}
                                                                                        Agents
                                                                                </Text>
                                                                        </View>
                                                                </View>
                                                                <View style={styles.downCaret} />
                                                        </View>
                                                        <View style={[styles.currentIcon, { width: 40, height: 40, borderWidth: 0, backgroundColor: '#40a4ae75' }]}>
                                                                <View style={[styles.secondCircle, { borderColor: '#fff', width: '40%', height: '40%', borderWidth: 2 }]}>
                                                                        {/* <View style={[styles.lastCircle, { opacity: 1, backgroundColor: '#40a4ae' }]} /> */}
                                                                        <Animated.Image source={require('../../../assets/images/location-pin.png')} style={[styles.pinImg]} />
                                                                </View>
                                                        </View>
                                                </View>
                                        </MapboxGL.MarkerView> : null}


                                        {routeGeoJSON ? <MapboxGL.ShapeSource id="routeLine" shape={routeGeoJSON}>
                                                <MapboxGL.LineLayer id="lines" style={{
                                                        lineWidth: 6,
                                                        lineCap: "round",
                                                        lineJoin: "round",
                                                        lineColor: "#007bff"
                                                }} />
                                        </MapboxGL.ShapeSource> : null}

                                </MapboxGL.MapView> :
                                        <View style={{ width: '100%', height: 100 }} />}


                                <View style={styles.insideMap}>
                                        <View style={styles.header}>
                                                <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple('#C4C4C4', true)} onPress={() => navigation.goBack()}>
                                                        <View style={styles.headerBtn}>
                                                                <Ionicons name="arrow-back-outline" size={24} color="#777" />
                                                        </View>
                                                </TouchableNativeFeedback>
                                        </View>
                                        <TouchableOpacity style={styles.trackLocation} onPress={searchLocalisation}>
                                                <View >
                                                        <Ionicons name="location-outline" size={24} color="black" />
                                                </View>
                                        </TouchableOpacity>

                                        <View style={styles.footer}>

                                                {locAgents ? <TouchableNativeFeedback>
                                                        <View style={[styles.footerBtn]}>
                                                                <View style={styles.footerItemIcon}>
                                                                        <MaterialCommunityIcons name="map-marker" size={20} color="#fff" />
                                                                </View>
                                                                <View style={styles.footerItemDetails}>
                                                                        <Text style={styles.footerItemTitle}>
                                                                                {locAgents.LIEU_EXACTE}
                                                                        </Text>
                                                                        {locAgents ? <View>
                                                                                <Text style={styles.footerItemValue} numberOfLines={1}>
                                                                                        {locAgents.ZONE_NAME}, {locAgents.COMMUNE_NAME}, {locAgents.PROVINCE_NAME}, Burundi
                                                                                </Text>
                                                                        </View> : null}

                                                                </View>
                                                        </View>
                                                </TouchableNativeFeedback> : null}
                                        </View>
                                </View>
                        </View>
                </>
        )
}

const styles = StyleSheet.create({
        container: {
                flex: 1,
        },
        insideMap: {
                position: 'absolute',
                width: '100%',
                height: '100%',
                justifyContent: "center",
                alignItems: "center"
        },
        header: {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                position: 'absolute',
                width: '100%',
                top: 0,
                height: 60,
                backgroundColor: 'rgba(52, 52, 52, 0.2)'
        },
        headerBtn: {
                padding: 10,
                backgroundColor: "#fff",
                justifyContent: "center",
                alignContent: "center",
                justifyContent: "center",
                borderRadius: 50,
                marginHorizontal: 5
        },
        map: {
                flex: 1
        },
        mapPin: {
                position: 'absolute',
                top: "43.5%",
                alignItems: "center",
                width: 50,
                height: 50
        },
        shadow: {
                height: 10,
                width: 20,
                backgroundColor: 'rgba(0, 0, 0, 0.15)',
                borderRadius: 20,
                position: 'absolute',
                bottom: -2
        },
        pinImg: {
                width: 30,
                height: 30,
                position: 'absolute',
                bottom: 0
        },
        footer: {
                position: 'absolute',
                bottom: 0,
                backgroundColor: '#FFF',
                width: '100%'
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
        footerItemTitle: {
                fontSize: 16,
                color: '#333'
        },
        footerItemDetails: {
                marginLeft: 10,
        },
        footerItemValue: {
                color: '#777',
                fontSize: 12
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
        trackLocation: {
                width: 50,
                height: 50,
                backgroundColor: "#fff",
                borderRadius: 50,
                justifyContent: "center",
                alignContent: "center",
                alignItems: "center",
                position: 'absolute',
                right: 2,
                bottom: 88
        }
})
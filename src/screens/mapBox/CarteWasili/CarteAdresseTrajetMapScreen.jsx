import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View, TouchableNativeFeedback, TouchableOpacity } from "react-native";
import MapboxGL from '@rnmapbox/maps';
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Locations from "expo-location";
import { AntDesign, MaterialCommunityIcons, MaterialIcons, Entypo, Ionicons } from "@expo/vector-icons";
import { COLORS } from '../../styles/COLORS';
import fetchApi from "../../helpers/fetchApi";
import { useIntl } from "react-intl";

export const ACCESS_TOKEN = 'pk.eyJ1IjoiZHVraXp3ZSIsImEiOiJja3pvYmg1cnMzNmswMnVueTU4YnEyczgzIn0.qEoChU3ktP0_WUusXi9ZCg'
MapboxGL.setAccessToken(ACCESS_TOKEN);

export default function CarteAdresseTrajetMapScreen() {
        const navigation = useNavigation()
        const route = useRoute()
        const [mapHeight, setMapHeight] = useState(0)
        const cameraRef = useRef(null)
        const [selectedPickup, setSelectedPickup] = useState(null)
        const [selectedDestination, setSelectedDestination] = useState(null)
        const [loadingPickupAddress, setLoadingPickupAddress] = useState(true)
        const [routeGeoJSON, setrouteGeoJSON] = useState(null);
        const [isMapLoaded, setIsMapLoaded] = useState(false)
        const [loadingDirection, setLoadingDirection] = useState(true)
        const intl = useIntl()

        const { course: incCourse } = route.params || {}
        const [course, setCourse] = useState(incCourse)

        const [trajet, setTrajet] = useState(null)
        const [trajetArrets, setTrajetArrets] = useState([])
        const [newTrajetArrets, setNewTrajetArrets] = useState([])
        const [loadingTrajet, setLoadingTrajet] = useState(true)

        useEffect(() => {
                (async () => {
                        try {
                                const response = await fetchApi(`/course/courses/trajethistorydata/${course.ID_COURSE}`)
                                setTrajet(response.result)
                                setTrajetArrets(response.result.course_arrets)
                        }
                        catch (error) {
                                console.log({ error })
                        }
                        finally {
                                setLoadingTrajet(false)
                        }
                })()
        }, [])

        useEffect(() => {
                (async () => {
                        try {
                                setSelectedPickup({
                                        location: [trajet.START_LONGITUDE, trajet.START_LATITUDE],
                                        reverseGeocodingResult: course.ADDRESSE_PICKUP
                                })
                                setSelectedDestination({
                                        location: [trajet.END_LONGITUDE, trajet.END_LATITUDE],
                                        reverseGeocodingResult: course.ADDRESSE_DESTINATION
                                })
                        } catch (error) {
                                console.log(error)
                        } finally {
                                setLoadingPickupAddress(false)
                        }
                })()
        }, [course, trajet])


        useEffect(() => {
                (async () => {
                        if (selectedPickup && selectedDestination && isMapLoaded) {
                                try {
                                        setLoadingDirection(true)
                                        cameraRef.current?.fitBounds([selectedPickup.location[0], selectedPickup.location[1]], [selectedDestination.location[0], selectedDestination.location[1]], [200, 100, 50, 100], 1000)
                                        var lineData = null
                                        if (trajet.TRAJET_HISTORY_DATA) {
                                                const trajetHistoryData = JSON.parse(trajet.TRAJET_HISTORY_DATA);
                                                const longitudes = trajetHistoryData.map(({ longitude }) => longitude);
                                                const latitudes = trajetHistoryData.map(({ latitude }) => latitude);
                                                lineData = longitudes.map((longitude, index) => [longitude, latitudes[index]]);
                                        }
                                        var arretData = null
                                        if (trajetArrets.length > 0) {
                                                arretData = trajetArrets.map(({ LATITUDE, LONGITUDE, NOM_ADDRESSE }) => ({
                                                        location: [LONGITUDE, LATITUDE],
                                                        address: NOM_ADDRESSE
                                                }));
                                        }

                                        setNewTrajetArrets(arretData)

                                        let lineStringGeoJSON = {
                                                type: 'FeatureCollection',
                                                features: [
                                                        {
                                                                type: 'Feature',
                                                                properties: {},
                                                                geometry: { coordinates: lineData, type: "LineString" },
                                                        },
                                                ],
                                        };
                                        setrouteGeoJSON(lineStringGeoJSON)


                                } catch (error) {
                                        console.log(error)
                                } finally {
                                        setLoadingDirection(false)
                                }
                        }
                })()
        }, [selectedPickup, selectedDestination, isMapLoaded, trajet, trajetArrets])

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
                                                                                <Text style={[styles.markerCardText, { fontWeight: 'bold', color: '#000' }]}>{intl.formatMessage({ id: 'CarteAdresseTrajetMapScreen.LieuPrise' })}</Text>
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

                                {routeGeoJSON ? (
                                        <MapboxGL.ShapeSource id="routeLine" shape={routeGeoJSON}>
                                                <MapboxGL.LineLayer
                                                        id="lines"
                                                        style={{
                                                                lineWidth: 3,
                                                                lineCap: "round",
                                                                lineJoin: "round",
                                                                lineColor: COLORS.primary
                                                        }}
                                                />
                                                {newTrajetArrets?.length > 0 ? <>
                                                        {newTrajetArrets?.map((stop, index) => (
                                                                <MapboxGL.MarkerView coordinate={stop.location} key={`stop-${index}`}>
                                                                        <View style={styles.marker}>
                                                                                <View style={styles.markerCard}>
                                                                                        <View style={styles.markerInfoContent}>
                                                                                                <View style={styles.markerCardLine}>
                                                                                                        <MaterialCommunityIcons name="map-marker" size={20} color="#85969F" style={{}} />
                                                                                                        <View style={{marginLeft:4}}>
                                                                                                                <Text style={[{ color: '#000', fontSize:10, fontFamily: "Nunito" }]}>{intl.formatMessage({ id: 'CarteAdresseTrajetMapScreen.PointArret' })}</Text>
                                                                                                                <Text style={[{ fontFamily: 'Nunito-Bold', color: '#000', fontSize:10 }]}>{stop.address}</Text>
                                                                                                        </View>
                                                                                                </View>
                                                                                                <View style={styles.downCaret} />
                                                                                        </View>
                                                                                </View>
                                                                                <MaterialCommunityIcons name="map-marker" size={20} color="#85969F" style={{}} />
                                                                        </View>
                                                                </MapboxGL.MarkerView>
                                                        ))}
                                                </> : null}
                                        </MapboxGL.ShapeSource>
                                ) : null}

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
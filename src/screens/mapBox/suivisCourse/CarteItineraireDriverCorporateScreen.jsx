import React, { useCallback, useEffect, useRef, useState } from "react";
import {
        Alert,
        AppState,
        Image,
        Linking,
        StyleSheet,
        Text,
        TouchableNativeFeedback,
        TouchableOpacity,
        TouchableWithoutFeedback,
        View,
        useWindowDimensions,
        ScrollView
} from "react-native";
import MapboxGL from "@rnmapbox/maps";
import {
        DrawerActions,
        useNavigation,
        useRoute,
} from "@react-navigation/native";
import {
        MaterialCommunityIcons,
        Ionicons,
        AntDesign,
        FontAwesome,
        Feather,
        Entypo,
        EvilIcons
} from "@expo/vector-icons";
import * as Location from "expo-location";
import fetchApi, { API_URL } from "../../helpers/fetchApi";
import LottieView from "lottie-react-native";
import Loading from "../../components/app/Loading";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { unsetUserAction } from "../../store/actions/userActions";
import { useDispatch, useSelector } from "react-redux";
import { userSelector } from "../../store/selectors/userSelector";
import io from "socket.io-client";
import IDS_COURSE_STATUS from "../../constants/IDS_COURSE_STATUS";
import { Modalize } from "react-native-modalize";
import MapTypesModalize from "../../components/map/MapTypesModalize";
import { Portal } from "react-native-portalize";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { COLORS } from "../../styles/COLORS";
import wait from "../../helpers/wait";

export const ACCESS_TOKEN =
        "pk.eyJ1IjoiZHVraXp3ZSIsImEiOiJja3pvYmg1cnMzNmswMnVueTU4YnEyczgzIn0.qEoChU3ktP0_WUusXi9ZCg";
import ImageView from "react-native-image-viewing";
import ConfirmModal from '../../components/modals/ConfirmModal';
import ErrorModal from '../../components/modals/ErrorModal';
import CancellationRaisonsModalize from '../../components/map/CancellationRaisonsModalize';
import useFetch from '../../hooks/useFetch';
import { useIntl } from "react-intl";
import moment from "moment";
import messaging from '@react-native-firebase/messaging';
import { setToastAction } from "../../store/actions/appActions";
import SmallLoadingSkeletons from "../../components/skeletons/SmallLoadingSkeletons";
import { BeneficiairesRender } from "../../components/corporate/BeneficiairesRender";
import ListesBeneficiaireModal from "../../components/corporate/ListesBeneficiaireModal";

MapboxGL.setAccessToken(ACCESS_TOKEN);

export default function CarteItineraireDriverCorporateScreen() {
        const [initialLoading, setInitialLoading] = useState(true);
        const navigation = useNavigation();
        const route = useRoute();
        const [loadingStreet, setLoadingStreet] = useState(false);
        const cameraRef = useRef(null);
        const [loading, setLoading] = useState(false);
        const user = useSelector(userSelector);
        const dispatch = useDispatch();
        const backHanler = useRef();
        const socket = useRef(io(API_URL)).current;
        const [isFinished, setIsFinished] = useState(false);
        const mapTypeModalizeRef = useRef();
        const listeBeneficiresModalizeRef = useRef();
        const [mapType, setMapType] = useState(MapboxGL.StyleURL.Street);
        const [mapHeight, setMapHeight] = useState(0);
        const [isOpen, setIsOpen] = useState(false);
        const [isOpenBeneficiaire, setIsOpenBeneficiaire] = useState(false);
        const [isCanceling, setIscanceling] = useState(false);
        const [showImageModal, setShowImageModal] = useState(false);
        const driverRequestInterval = useRef(null);
        const [showConfirmCancelModal, setShowConfirmCancelModal] = useState(false);
        const [showConfirmDangerModal, setShowConfirmDangerModal] = useState(false);
        const intl = useIntl()
        const ID_ADMIN_TYPE_NOTIFICATION_CHAUFFEUR_NOTFOUND = 3
        const [driverCoordinates, setDriverCoordinates] = useState(null);
        const [driver, setDriver] = useState(null);
        const [error, setError] = useState(null);
        const tripDetailsModalizeRef = useRef(null)
        const [isDetailsOpen, setIsDetailsOpen] = useState(false)
        const [centerCoordinate, setCenterCoordinate] = useState(null)

        const [toPickupDirection, setToPickupDirection] = useState(null)
        const [toPickupRouteGeoJSON, setToPickupRouteGeoJSON] = useState(null)
        const [loadingToPickupDirection, setLoadingToPickupDirection] = useState(true)
        const [noDriverFound, setNoDriverFound] = useState(false)
        const [isMapLoaded, setIsMapLoaded] = useState(false)
        const [currentLocation, setCurrentLocation] = useState(null)

        const cancellatonModalizeRef = useRef()
        const [IsCancellationOpen, setIsCancellationOpen] = useState(false)
        const [loadingRaisons, raisons] = useFetch("/course/raisons_annulation")

        const [followUserLocation, setFollowUserLocation] = useState(false)

        const [isMapLoading, setIsMapLoading] = useState(true)
        const returnToFollowTimer = useRef(null)

        const [requestSentToDriver, setRequestSentToDriver] = useState(null)
        const { idCourse } = route.params
        const [course, setCourse] = useState(null)

        const [loadingDirection, setLoadingDirection] = useState(true)
        const [routeGeoJSON, setrouteGeoJSON] = useState(null);

        const [loadingBeneficiaires, setLoadingBeneficiaires] = useState(true)
        const [beneficiaires, setBeneficiaires] = useState([])
        const [showImageBeneficiaireModal, setShowImageBeneficiaireModal] = useState(false);

        const { width } = useWindowDimensions()

        useEffect(() => {
                (async () => {
                        try {
                                const response = await fetchApi(`/course/courses/${idCourse}`)
                                setCourse(response.result)
                        }
                        catch (error) {
                                console.log({ error })
                        }
                        finally {
                                setLoading(false)
                        }
                })()
        }, [])

        useEffect(() => {
                if (!isMapLoading && !followUserLocation) {
                        returnToFollowTimer.current = setTimeout(() => {
                                setFollowUserLocation(true)
                        }, 2000)
                } else {
                        clearTimeout(returnToFollowTimer.current)
                }
                return () => {
                        clearTimeout(returnToFollowTimer.current)
                }
        }, [isMapLoading, followUserLocation])

        const refreshDriverCoordinates = useCallback(async () => {
                try {
                        if (course.ID_DRIVER != null) {
                                const d = await fetchApi(`/driver/drivers/courses/${course.ID_DRIVER}`);
                                setDriverCoordinates([d.result.LAST_LONGITUDE, d.result.LAST_LATITUDE]);
                                // setDriverCoordinates([driverSimulation.lon, driverSimulation.lat])
                                if (cameraRef.current) {
                                        // cameraRef.current.setCamera({
                                        //           centerCoordinate: [d.result.LAST_LONGITUDE, d.result.LAST_LATITUDE],
                                        //           zoomLevel: 18,
                                        // });
                                }
                                if (!driver) {
                                        setDriver(d.result);
                                }
                        }
                } catch (error) {
                        console.log(error);
                }
        }, [course, cameraRef.current, driver]);

        const getStatusText = () => {
                var label = intl.formatMessage({ id: "TripingScreen.recherhcechauf" })
                if (course?.ID_STATUT == IDS_COURSE_STATUS.PRIS_PAR_CHAFFEUR) {
                        label = intl.formatMessage({ id: "TripingScreen.Beneficiairepretconduire" })
                }
                if (course?.ID_STATUT == IDS_COURSE_STATUS.PRIS_PAR_CHAFFEUR) {
                        label = intl.formatMessage({ id: "TripingScreen.Beneficiairepretconduire" });
                }
                if (course?.ID_STATUT == IDS_COURSE_STATUS.VERS_LEPICKUP) {
                        label = intl.formatMessage({ id: "TripingScreen.chauffeurBenefiArrivevousprendre" });
                }
                if (course?.ID_STATUT == IDS_COURSE_STATUS.ARRIVE_AU_PICKUP) {
                        label = `${intl.formatMessage({ id: "TripingScreen.chauffeurBenefiArrive" })}`;
                }
                if (course?.ID_STATUT == IDS_COURSE_STATUS.COURSE_EN_COURS) {
                        label = `${intl.formatMessage({ id: "TripingScreen.courseencours" })}`;
                }
                if (course?.ID_STATUT == IDS_COURSE_STATUS.COURSE_TERMINE) {
                        label = `${intl.formatMessage({ id: "TripingScreen.coursetermine" })}`;
                }
                return label
        };

        const handleAppStateChange = (newState) => {
                if (newState == "active") {
                        refreshCourse();
                }
        };


        const refreshCourse = async () => {
                try {
                        const currentTrip = await fetchApi(`/course/courses/${idCourse}`);
                        if (currentTrip.result) {
                                setCourse(currentTrip.result)
                        }
                } catch (error) {
                        console.log(error);
                } finally {
                        setLoading(false);
                }
        };
        const getDriverDuration = useCallback(() => {
                if (toPickupDirection) {
                        const formated = new Date(toPickupDirection.routes[0].duration * 1000)
                                .toISOString()
                                .substr(14, 5)
                                .replace(".", ":");
                        return formated;
                }
                return "";
        }, [toPickupDirection]);

        const getDriverDistance = useCallback(() => {
                if (toPickupDirection) {
                        const formated = parseFloat(toPickupDirection.routes[0].distance / 1000).toFixed(2)
                        return formated
                }
                return "";
        }, [toPickupDirection]);
        const handleCarPress = () => {
                setShowImageModal(true);
        };

        const handleImagesBenecifiairePress = () => {
                setShowImageBeneficiaireModal(true)
        }

        useEffect(() => {
                if (course?.ID_DRIVER) {
                        setRequestSentToDriver(null)
                }
        }, [course])

        const onCancel = async (ID_RAISON_ANNULATION, AUTRE_RAISON_ANNULATION) => {
                try {
                        setLoading(true)
                        setIscanceling(true)
                        const res = await fetchApi(`/course/courses/change_status/${course?.ID_COURSE}`, {
                                method: "PUT",
                                body: JSON.stringify({
                                        ID_STATUT: IDS_COURSE_STATUS.ANNLER_PAR_RIDER,
                                        IS_RIDER: 1,
                                        ID_RAISON_ANNULATION,
                                        AUTRE_RAISON_ANNULATION: ID_RAISON_ANNULATION == 'autre' ? AUTRE_RAISON_ANNULATION : null
                                }),
                                headers: { "Content-Type": "application/json" },
                        })
                        setLoading(false)
                        setCourse(null)
                        navigation.navigate("HomeScreen")
                } catch (error) {
                        console.log(error)
                } finally {
                        setLoading(false)
                }
        }

        const onProfilePress = useCallback(() => {
                navigation.dispatch(DrawerActions.toggleDrawer());
        }, []);

        const handleTargetPress = useCallback(async () => {
                setFollowUserLocation(false)
                setCenterCoordinate(currentLocation)
                cameraRef.current.setCamera({
                        centerCoordinate: currentLocation,
                        zoomLevel: 17,
                        animationDuration: 1000
                })
        }, [currentLocation, cameraRef.current])

        const researchDriver = async () => {
                setNoDriverFound(false);
                await fetchApi(`/course/courses/research_driver/${course?.ID_COURSE}`);
        };

        useEffect(() => {
                const timer = setTimeout(() => {
                        setInitialLoading(false);
                }, 100);
                return () => {
                        clearTimeout(timer);
                };
        }, []);

        useEffect(() => {
                messaging().onMessage(async message => {
                        const body = message.data
                        var data = {}
                        if (body.data) {
                                data = JSON.parse(body.data)
                        }
                        const { SEND_TRIP_REQUEST, IS_NO_DRIVER_FOUND, driver, drivers } = data
                        if (SEND_TRIP_REQUEST) {
                                // setRequestSentToDriver(driver)
                                setRequestSentToDriver(drivers)
                        }
                        if (IS_NO_DRIVER_FOUND) {
                                setNoDriverFound(true)
                        }
                });
        }, [])
        useEffect(() => {
                socket.on("connect", (err, data) => {
                        isSocketConnected = true;
                        socket.emit("join", { userId: `r_${user.ID_RIDER}`, userType: "rider" });
                });
                socket.on("STATUS_COURSE_DEMANDEUR_CHANGED", ({ course: cs }) => {
                        if (
                                cs.ID_STATUT == IDS_COURSE_STATUS.COURSE_TERMINE ||
                                cs.ID_STATUT == IDS_COURSE_STATUS.TERMINE_PAR_ADMIN
                        ) {
                                navigation.navigate("DetailCourseScreen", {
                                        idCourse: cs.ID_COURSE
                                });
                                setCourse(null)
                        }
                });
                socket.on("NO_DRIVER_FOUND", ({ course: cs }) => {
                        if (cs.ID_COURSE == cs.ID_COURSE) {
                                setRequestSentToDriver(null)
                                setNoDriverFound(true);
                        }
                });
                socket.on("TRIP_CANCELED", ({ error }) => {
                        setError(error);
                });
                socket.on("SEND_TRIP_REQUEST", ({ driver }) => {
                        setRequestSentToDriver(driver)
                });
                socket.on("error", (error) => {
                        console.log(error);
                });
                socket.on("disconnect", () => {
                        isSocketConnected = false;
                });
                return () => {
                        socket.disconnect();
                };
        }, [socket]);

        useEffect(() => {
                const subscription = AppState.addEventListener(
                        "change",
                        handleAppStateChange
                );
                return () => {
                        subscription.remove();
                };
        }, []);
        useEffect(() => {
                if (course?.ID_DRIVER) {
                        if (!driverCoordinates) {
                                refreshDriverCoordinates();
                        }
                        driverRequestInterval.current = setInterval(() => {
                                refreshDriverCoordinates();
                        }, 10000);
                } else {
                        clearInterval(driverRequestInterval.current);
                }
                return () => {
                        clearInterval(driverRequestInterval.current);
                };
        }, [course, driverCoordinates]);

        useEffect(() => {
                (async () => {
                        if (course) {
                                try {
                                        const respo = await fetchApi(`/corporate/corp_corporates/beneficiaires/course/${course?.ID_COURSE}`);
                                        setBeneficiaires(respo.result)
                                } catch (error) {
                                        console.log(error)
                                } finally {
                                        setLoadingBeneficiaires(false)
                                }
                        }
                })()
        }, [course])


        useEffect(() => {
                (async () => {
                        if (course && isMapLoaded) {
                                try {
                                        setLoadingDirection(true)
                                        // cameraRef.current?.setCamera({ centerCoordinate: null })
                                        cameraRef.current?.fitBounds([course.LONGITUDE_PICKUP, course.LATITUDE_PICKUP], [course.LONGITUDE_DESTINATION, course.LATITUDE_DESTINATION], [120, 100, 50, 100], 1000)
                                        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${course.LONGITUDE_PICKUP},${course.LATITUDE_PICKUP};${course.LONGITUDE_DESTINATION},${course.LATITUDE_DESTINATION}?alternatives=true&geometries=geojson&language=en&overview=simplified&steps=true&access_token=${ACCESS_TOKEN}`
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
        }, [course, isMapLoaded])

        useEffect(() => {
                (async () => {
                        if (driverCoordinates) {
                                try {
                                        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${driverCoordinates[0]},${driverCoordinates[1]};${course?.LONGITUDE_PICKUP},${course?.LATITUDE_PICKUP}?alternatives=true&geometries=geojson&language=en&overview=simplified&steps=true&access_token=${ACCESS_TOKEN}`;
                                        const res = await fetch(url);
                                        const data = await res.json();
                                        let lineStringGeoJSON = {
                                                type: "FeatureCollection",
                                                features: [
                                                        {
                                                                type: "Feature",
                                                                properties: {},
                                                                geometry: data?.routes[0]?.geometry,
                                                        },
                                                ],
                                        };
                                        if (!toPickupRouteGeoJSON) {
                                                setToPickupRouteGeoJSON(lineStringGeoJSON);
                                        }
                                        setToPickupDirection(data);
                                } catch (error) {
                                        console.log(error);
                                } finally {
                                        setLoadingToPickupDirection(false);
                                }
                        }
                })();
        }, [driverCoordinates]);


        useEffect(() => {
                if (course && cameraRef.current && isMapLoaded) {
                        if (course?.ID_STATUT == IDS_COURSE_STATUS.COURSE_EN_COURS) {
                                handleTargetPress()
                        } else {
                                cameraRef.current?.fitBounds(
                                        [course.LONGITUDE_DESTINATION, course.LATITUDE_DESTINATION],
                                        [course.LONGITUDE_PICKUP, course.LATITUDE_PICKUP],
                                        [50, 100, 200, 150],
                                        1000
                                );
                        }
                }
        }, [course, isMapLoaded]);

        if (initialLoading || !course) {
                return null
        }
        const canCancel = course?.ID_STATUT < IDS_COURSE_STATUS.COURSE_EN_COURS
        const canMessage = true
        const canCall = course?.ID_STATUT < IDS_COURSE_STATUS.COURSE_EN_COURS
        // const conNotAnnulCourse = (course?.ID_STATUT == IDS_COURSE_STATUS.ANNLER_PAR_RIDER) || (course?.ID_STATUT == IDS_COURSE_STATUS.ANNLER_PAR_DRIVER) || (course[0]?.ID_STATUT == IDS_COURSE_STATUS.ANNLER_PAR_ADMIN) || (course[0]?.ID_STATUT == IDS_COURSE_STATUS.TERMINE_PAR_ADMIN)

        const sendAlert = async () => {
                dispatch(setToastAction({
                        icon: <Entypo name="check" size={24} color={COLORS.primary} />,
                        iconBackground: "#fff",
                        description: intl.formatMessage({ id: "TripingScreen.successEmergency" })
                }))
                const loc = await Location.getCurrentPositionAsync()
                const body = new FormData()
                body.append("LONGITUDE", loc.coords.longitude)
                body.append("LATITUDE", loc.coords.latitude)
                body.append("ID_COURSE", idCourse)
                await fetchApi("/rider/riders/emergency/send_emergency", {
                        method: "POST",
                        body
                })
        }
        return (
                <>
                        <CancellationRaisonsModalize cancellatonModalizeRef={cancellatonModalizeRef} isOpen={IsCancellationOpen} setIsOpen={setIsCancellationOpen} loadingRaisons={loadingRaisons} raisons={raisons?.result || []} onCancel={onCancel} />
                        {error ? <ErrorModal onClose={async () => {
                                setError(null)
                                await wait(200)
                                // dispatch(setEntireCourseAction({ course: null, isRequestingDriver: false }))
                                navigation.navigate("Root")
                        }} handleClose={() => {
                                setError(null)
                        }} title={error.title} body={error.body} handleTitle="Ok" /> : null}
                        {<Loading isLoading={loading} />}
                        {showConfirmCancelModal && <ConfirmModal
                                title={intl.formatMessage({ id: 'TripingScreen.anlcourse' })}
                                body={intl.formatMessage({ id: 'TripingScreen.voulezVs' })}
                                handleTitle={intl.formatMessage({ id: 'TripingScreen.Oui' })}
                                exitLabel={intl.formatMessage({ id: 'TripingScreen.Non' })}
                                onClose={() => setShowConfirmCancelModal(false)}
                                onConfirm={() => {
                                        setShowConfirmCancelModal(false)
                                        setIsCancellationOpen(true)
                                        cancellatonModalizeRef.current.open()
                                        // onCancel()
                                }}
                                onDecline={() => {
                                        setShowConfirmCancelModal(false)
                                }}
                        />}
                        {showConfirmDangerModal && <ConfirmModal
                                title={intl.formatMessage({ id: 'TripingScreen.successEmergencyTitle' })}
                                body={intl.formatMessage({ id: 'TripingScreen.successEmergencyBody' })}
                                handleTitle={intl.formatMessage({ id: 'TripingScreen.Oui' })}
                                exitLabel={intl.formatMessage({ id: 'TripingScreen.Non' })}
                                onClose={() => setShowConfirmDangerModal(false)}
                                onConfirm={() => {
                                        setShowConfirmDangerModal(false)
                                        // setIsCancellationOpen(true)
                                        // cancellatonModalizeRef.current.open()
                                        sendAlert()
                                        // onCancel()
                                }}
                                onDecline={() => {
                                        setShowConfirmDangerModal(false)
                                }}
                        />}
                        <View style={styles.container}>
                                <MapboxGL.MapView
                                        style={styles.map}
                                        styleURL={mapType}
                                        onLayout={event => {
                                                setMapHeight(event.nativeEvent.layout.height)
                                        }}
                                        zoomEnabled={true}
                                        logoEnabled={false}
                                        attributionEnabled={false}
                                        scaleBarEnabled={false}
                                        onDidFinishLoadingMap={() => {
                                                setIsMapLoaded(true)
                                                setIsMapLoading(false)
                                        }}
                                        onTouchStart={() => {
                                                setFollowUserLocation(false)
                                        }}
                                >
                                        <MapboxGL.UserLocation
                                                // showsUserHeadingIndicator
                                                renderMode="normal"
                                                onUpdate={(point) => {
                                                        setCurrentLocation([point.coords.longitude, point.coords.latitude])
                                                }}
                                                minDisplacement={25}
                                        />

                                        {(driverCoordinates && course.ID_DRIVER != null && course.ID_STATUT != IDS_COURSE_STATUS.COURSE_EN_COURS) ? <MapboxGL.MarkerView
                                                coordinate={driverCoordinates}
                                                key='driverPosition'
                                        >
                                                <View style={[styles.marker, { marginTop: 20 }]}>
                                                        <View style={styles.markerCard}>
                                                                <View style={styles.markerInfoContent}>
                                                                        <View style={styles.markerCardLine}>
                                                                                <View style={{ width: 30, height: 30 }}>
                                                                                        {course?.IMAGE_DRIVER ? <Image source={{ uri: course?.IMAGE_DRIVER }} style={styles.image} /> :
                                                                                                <Image source={require('../../../assets/images/user.png')} style={styles.image} />}
                                                                                </View>
                                                                                <View>
                                                                                        <Text style={[styles.markerCardText, { fontWeight: 'bold', color: '#000' }]}>{course?.NOM_DRIVER} {course?.PRENOM_DRIVER}</Text>
                                                                                        {(getDriverDuration() != "" && !([IDS_COURSE_STATUS.ARRIVE_AU_PICKUP, IDS_COURSE_STATUS.COURSE_EN_COURS].includes(course?.ID_STATUT))) ? <Text style={styles.markerCardText} numberOfLines={1}>
                                                                                                {getDriverDuration()} min
                                                                                        </Text> : null}
                                                                                </View>
                                                                        </View>
                                                                </View>
                                                                <View style={styles.downCaret} />
                                                        </View>
                                                        <Image source={require('../../../assets/images/car.png')} style={styles.carPin} />
                                                </View>
                                        </MapboxGL.MarkerView> : null}
                                        {course ? <MapboxGL.MarkerView
                                                coordinate={[course?.LONGITUDE_PICKUP, course?.LATITUDE_PICKUP]}
                                                key='pickup'
                                        >
                                                <View style={[styles.marker, { marginTop: 20 }]}>
                                                        <View style={styles.markerCard}>
                                                                <View style={styles.markerInfoContent}>
                                                                        <View style={styles.markerCardLine}>
                                                                                {(course?.ID_STATUT == IDS_COURSE_STATUS.VERS_LEPICKUP && getDriverDuration()) ? (
                                                                                        <View style={styles.driverMarkerMin}>
                                                                                                <Text style={[styles.driverMarkerMinText]} >
                                                                                                        {getDriverDuration() ? getDriverDuration().substring(0, 2) : "00:00"}
                                                                                                </Text>
                                                                                                <Text style={styles.driveMarkerMinLabel}>min</Text>
                                                                                        </View>
                                                                                ) :
                                                                                        <View style={[styles.currentIcon, { width: 15, height: 15 }]}>
                                                                                                <View style={styles.secondCircle}>
                                                                                                        <View style={styles.lastCircle} />
                                                                                                </View>
                                                                                        </View>}
                                                                                <View>
                                                                                        <Text style={[styles.markerCardText, { fontWeight: 'bold', color: '#000' }]}>{intl.formatMessage({ id: 'TripingScreen.pointdepart' })}</Text>
                                                                                        <Text style={styles.markerCardText} numberOfLines={1}>
                                                                                                {course?.ADDRESSE_PICKUP ? course?.ADDRESSE_PICKUP : ''}
                                                                                        </Text>
                                                                                </View>
                                                                        </View>
                                                                </View>
                                                                <View style={styles.downCaret} />
                                                        </View>
                                                        <View style={[styles.currentIcon, { width: 20, height: 20, borderWidth: 0, backgroundColor: '#40a4ae75' }]}>
                                                                <View style={[styles.secondCircle, { borderColor: '#fff', width: '40%', height: '40%', borderWidth: 2 }]}>
                                                                        <View style={[styles.lastCircle, { opacity: 1, backgroundColor: '#40a4ae' }]} />
                                                                </View>
                                                        </View>
                                                </View>
                                        </MapboxGL.MarkerView> : null}
                                        {course ? <MapboxGL.MarkerView
                                                coordinate={[course?.LONGITUDE_DESTINATION, course?.LATITUDE_DESTINATION]}
                                        >
                                                <View style={styles.marker}>
                                                        <View style={styles.markerCard}>
                                                                <View style={styles.markerInfoContent}>
                                                                        <View style={styles.markerCardLine}>
                                                                                {/* <MaterialCommunityIcons name="map-marker-outline" size={20} color={COLORS.primary} /> */}
                                                                                <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.primary} style={{}} />
                                                                                <View style={{}}>
                                                                                        <Text style={[styles.markerCardText, { fontFamily: 'Nunito-Bold', color: '#000' }]}>{intl.formatMessage({ id: 'mapScreen.destinationpoint' })}</Text>
                                                                                        <Text style={styles.markerCardText} numberOfLines={1}>
                                                                                                {course?.ADDRESSE_DESTINATION ? course?.ADDRESSE_DESTINATION : ''}
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
                                        {(toPickupRouteGeoJSON && course?.ID_STATUT != IDS_COURSE_STATUS.COURSE_EN_COURS) ? <MapboxGL.ShapeSource id="toPickup" shape={toPickupRouteGeoJSON}>
                                                <MapboxGL.LineLayer id="linesPickup" style={{
                                                        lineWidth: 3,
                                                        lineCap: "round",
                                                        lineJoin: "round",
                                                        lineColor: "#777",
                                                        lineDasharray: [1, 2]
                                                }} />
                                        </MapboxGL.ShapeSource> : null}
                                        {course?.LONGITUDE_PICKUP ? <MapboxGL.Camera
                                                followUserLocation={course?.ID_STATUT == IDS_COURSE_STATUS.COURSE_EN_COURS ? followUserLocation : false}
                                                zoomLevel={course?.ID_STATUT == IDS_COURSE_STATUS.COURSE_EN_COURS ? 17 : 17}
                                                // centerCoordinate={course.ID_STATUT == IDS_COURSE_STATUS.COURSE_EN_COURS ? null : driverCoordinates}
                                                animationMode="flyTo"
                                                ref={cameraRef}
                                                maxZoomLevel={18}
                                                centerCoordinate={centerCoordinate}
                                        /> : null}
                                </MapboxGL.MapView>
                                <View style={[styles.insideMap, { height: mapHeight }]}>
                                        <TouchableOpacity style={styles.mapTypeBtn} activeOpacity={0.5} onPress={() => {
                                                setIsOpen(true)
                                                mapTypeModalizeRef.current.open()
                                        }}>
                                                <Feather name="map" size={20} color="#777" />
                                        </TouchableOpacity>
                                        {/* <TouchableOpacity style={styles.targetLocationBtn} activeOpacity={0.5} onPress={handleTargetPress}>
                                                <MaterialCommunityIcons name="target" size={24} color="#777" />
                                        </TouchableOpacity> */}
                                        {/* {course?.ID_DRIVER != null && <TouchableOpacity style={styles.dangerBtn} activeOpacity={0.5} onPress={() => {
                                                setShowConfirmDangerModal(true)
                                        }}>
                                                <Feather name="shield" size={24} color={COLORS.ecommerceRed} />
                                        </TouchableOpacity>} */}
                                        {(course?.ID_DRIVER == null && !noDriverFound) ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                <View style={styles.wavesContainer}>
                                                        <LottieView style={{ width: 350, height: 350 }} source={require('../../../assets/lotties/waves.json')} autoPlay loop />
                                                </View>
                                        </View> : null}
                                </View>
                                <View style={[styles.insideMap, { height: mapHeight, marginTop: 10 }]}>
                                        <View style={styles.header}>
                                                <TouchableOpacity onPress={() => {
                                                        navigation.goBack()
                                                }} style={styles.imageContainerBack}>
                                                        <AntDesign name="close" size={24} color={COLORS.primary} />
                                                </TouchableOpacity>
                                        </View>
                                </View>
                                <Modalize
                                        ref={tripDetailsModalizeRef}
                                        // contentRef={contentRef}
                                        // adjustToContentHeight
                                        withHandle={false}
                                        modalStyle={{ backgroundColor: '#fff', borderTopLeftRadius: 15, borderTopRightRadius: 15 }}
                                        scrollViewProps={{ keyboardShouldPersistTaps: 'handled', scrollEnabled: false }}
                                        avoidKeyboardLikeIOS={true}
                                        onPositionChange={(position) => {
                                                setIsDetailsOpen(position == "top")
                                        }}
                                        modalHeight={course?.ID_DRIVER != null ? 530 : 520}
                                        alwaysOpen={course?.ID_DRIVER != null ? 275 : 220}
                                >
                                        <View style={styles.footerContainer}>
                                                <TouchableWithoutFeedback onPress={() => {
                                                        if (isDetailsOpen) {
                                                                tripDetailsModalizeRef.current?.close("alwaysOpen")
                                                        } else {
                                                                tripDetailsModalizeRef.current?.open("top")
                                                        }
                                                }}>
                                                        <View style={styles.customModalizeHandle}>
                                                                <View style={styles.modalizeHandle} />
                                                                <Text style={styles.handleFeedback}>{intl.formatMessage({ id: 'TripingScreen.handleFeedback' })}</Text>
                                                        </View>
                                                </TouchableWithoutFeedback>
                                                <View style={[styles.footer]}>
                                                        {
                                                                (course?.ID_DRIVER == null && !noDriverFound)
                                                                        ? (
                                                                                <View style={styles.searchDriver}>
                                                                                        <TouchableWithoutFeedback onPress={() => {
                                                                                                if (isDetailsOpen) {
                                                                                                        tripDetailsModalizeRef.current?.close("alwaysOpen")
                                                                                                } else {
                                                                                                        tripDetailsModalizeRef.current?.open("top")
                                                                                                }
                                                                                        }}>
                                                                                                <View style={{ alignItems: 'center' }}>
                                                                                                        {/* <View style={{ width: 100, height: 120 }}>
                                                                                                                        <LottieView
                                                                                                                                  style={{
                                                                                                                                            height: "100%",
                                                                                                                                            width: "100%"
                                                                                                                                  }}
                                                                                                                                  source={require("../../../assets/lotties/app-loading.json")}
                                                                                                                                  autoPlay
                                                                                                                                  resizeMode="contain"
                                                                                                                        />
                                                                                                              </View> */}
                                                                                                        <Text style={[styles.searchDriverTitle]}>
                                                                                                                {intl.formatMessage({ id: 'TripingScreen.recherhcechauf' })}
                                                                                                        </Text>
                                                                                                        {/* <Text style={styles.searchDriverDescription}>
                                                                                                                        Veuillez patienter
                                                                                                              </Text> */}
                                                                                                </View>
                                                                                        </TouchableWithoutFeedback>
                                                                                        <TouchableOpacity
                                                                                                // disabled={loadingStreet}
                                                                                                onPress={() => setShowConfirmCancelModal(true)}
                                                                                                style={styles.cancelPureBtn}
                                                                                                activeOpacity={0.5}
                                                                                        >
                                                                                                <Text style={styles.cancelPureBtnText}>{intl.formatMessage({ id: 'TripingScreen.Annulercourse' })}</Text>
                                                                                        </TouchableOpacity>
                                                                                </View>
                                                                        ) : null}
                                                        {(noDriverFound) ? (
                                                                <View style={{ marginVertical: 30 }}>
                                                                        <Text
                                                                                style={[
                                                                                        styles.searchDriverTitle,
                                                                                        { textAlign: "center", marginVertical: 40 },
                                                                                ]}
                                                                        >
                                                                                {intl.formatMessage({ id: 'TripingScreen.aucunTrouve' })}
                                                                        </Text>
                                                                        <View style={styles.actions}>
                                                                                <View style={styles.noDriverAcions}>
                                                                                        <TouchableNativeFeedback
                                                                                                disabled={loadingStreet}
                                                                                                onPress={() => setShowConfirmCancelModal(true)}
                                                                                        >
                                                                                                <View
                                                                                                        style={[
                                                                                                                styles.noDriverAcion,
                                                                                                                {
                                                                                                                        backgroundColor: "#D2001A",
                                                                                                                        opacity: 0.8,
                                                                                                                        marginRight: 5,
                                                                                                                },
                                                                                                                loadingStreet && { opacity: 0.5 },
                                                                                                        ]}
                                                                                                >
                                                                                                        <AntDesign name="close" size={20} color="#fff" />
                                                                                                        <Text style={[styles.submitBtnText, { marginLeft: 10 }]}>
                                                                                                                {intl.formatMessage({ id: 'TripingScreen.Annuler' })}
                                                                                                        </Text>
                                                                                                </View>
                                                                                        </TouchableNativeFeedback>
                                                                                        <TouchableNativeFeedback
                                                                                                disabled={loadingStreet}
                                                                                                onPress={researchDriver}
                                                                                        >
                                                                                                <View
                                                                                                        style={[
                                                                                                                styles.noDriverAcion,
                                                                                                                { marginLeft: 5 },
                                                                                                                loadingStreet && { opacity: 0.5 },
                                                                                                        ]}
                                                                                                >
                                                                                                        <Ionicons name="refresh-sharp" size={24} color="#fff" />
                                                                                                        <Text style={[styles.submitBtnText, { marginLeft: 10 }]}>
                                                                                                                {intl.formatMessage({ id: 'TripingScreen.Réessayer' })}
                                                                                                        </Text>
                                                                                                </View>
                                                                                        </TouchableNativeFeedback>
                                                                                </View>
                                                                        </View>
                                                                </View>
                                                        ) : null}
                                                        {course?.ID_DRIVER != null ? (
                                                                <View style={styles.driverInfo}>
                                                                        <View style={styles.driverHeder}>
                                                                                <TouchableOpacity style={styles.driverInfoContainer} activeOpacity={0.8} onPress={handleCarPress} >
                                                                                        <View style={styles.driverImages}>
                                                                                                <View style={styles.driverImageContainer}>
                                                                                                        {course?.IMAGE_DRIVER ? (
                                                                                                                <Image
                                                                                                                        source={{ uri: course?.IMAGE_DRIVER }}
                                                                                                                        style={styles.driverImage}
                                                                                                                />
                                                                                                        ) : (
                                                                                                                <Image
                                                                                                                        source={require("../../../assets/images/user.png")}
                                                                                                                        style={styles.driverImage}
                                                                                                                />
                                                                                                        )}
                                                                                                        {/* {driver?.average ? (
                                                                                                                                            <View style={styles.ratingContainer}>
                                                                                                                                                      <AntDesign name="star" size={15} color="#fff" />
                                                                                                                                                      <Text style={styles.ratingText}>
                                                                                                                                                                {driver.average.toFixed(1)}
                                                                                                                                                      </Text>
                                                                                                                                            </View>
                                                                                                                                  ) : null} */}
                                                                                                </View>
                                                                                        </View>
                                                                                        <View style={styles.driverNames}>
                                                                                                <Text style={styles.driverName}>
                                                                                                        {course?.NOM_DRIVER} {course?.PRENOM_DRIVER}
                                                                                                </Text>
                                                                                                <Text style={styles.driverTel}>+257 {course?.TEL_DRIVER}</Text>
                                                                                        </View>
                                                                                </TouchableOpacity>
                                                                                <View>
                                                                                        <TouchableNativeFeedback useForeground disabled={!canCancel} onPress={() => setShowConfirmCancelModal(true)}>
                                                                                                <View style={[styles.cancelBtn, { opacity: canCancel ? 1 : 0.5 }]}>
                                                                                                        <AntDesign name="close" size={24} color={COLORS.error} />
                                                                                                </View>
                                                                                        </TouchableNativeFeedback>
                                                                                </View>
                                                                        </View>
                                                                        <TouchableOpacity onPress={handleCarPress} activeOpacity={0.8} style={styles.carSection}>
                                                                                <View style={styles.carinfo}>
                                                                                        <Text style={styles.plateNumber}>
                                                                                                {course?.NUMERO_PLAQUE || "B1234A"}
                                                                                        </Text>
                                                                                        <Text style={styles.carModel}>
                                                                                                {course?.MARQUE || "TOYOTA"} {course?.MODELE || "Ractis"} [{course?.COULEUR || "Gris"}]
                                                                                        </Text>
                                                                                </View>
                                                                                <View style={styles.carImageContainer}>
                                                                                        <Image source={course?.PHOTO_VEHICULE ? { uri: course?.PHOTO_VEHICULE } : require("../../../assets/images/car_corporate.png")} style={styles.carImage} />
                                                                                </View>
                                                                        </TouchableOpacity>
                                                                        <View style={[styles.actions, { marginTop: 10 }]}>
                                                                                <View style={{ flex: 1 }}>
                                                                                        <TouchableNativeFeedback
                                                                                                disabled={!canMessage}
                                                                                                onPress={() =>
                                                                                                        navigation.navigate("ConversationScreen", {
                                                                                                                idCourse: course?.ID_COURSE,
                                                                                                                idDriver: course?.ID_DRIVER != null ? course?.ID_DRIVER : null,
                                                                                                        })
                                                                                                }
                                                                                                useForeground
                                                                                        >
                                                                                                <View
                                                                                                        style={[
                                                                                                                styles.messageBtn,
                                                                                                                {
                                                                                                                        opacity: canMessage ? 1 : 0.5,
                                                                                                                }
                                                                                                        ]}
                                                                                                >
                                                                                                        <Ionicons
                                                                                                                name="chatbox-outline"
                                                                                                                size={24}
                                                                                                                color={"#fff"}
                                                                                                                style={{ marginTop: 3 }}
                                                                                                        />
                                                                                                        {/* <Text style={styles.actionTextLabel}>{intl.formatMessage({ id: 'TripingScreen.Message' })} {course.driver.NOM} </Text> */}
                                                                                                </View>
                                                                                        </TouchableNativeFeedback>
                                                                                </View>
                                                                                <View style={{ flex: 1 }}>
                                                                                        <TouchableNativeFeedback
                                                                                                disabled={!canCall}
                                                                                                onPress={() =>
                                                                                                        Linking.openURL(`tel:${course?.TEL_DRIVER}`)
                                                                                                }
                                                                                                useForeground
                                                                                        >
                                                                                                <View
                                                                                                        style={[
                                                                                                                styles.callBtn,
                                                                                                                !canCall && { opacity: 0.5 }
                                                                                                        ]}
                                                                                                >
                                                                                                        <Ionicons
                                                                                                                name="call-outline"
                                                                                                                size={24}
                                                                                                                color={COLORS.primary}
                                                                                                        />
                                                                                                </View>
                                                                                        </TouchableNativeFeedback>
                                                                                </View>
                                                                        </View>
                                                                </View>
                                                        ) : null}
                                                        {course?.ID_DRIVER != null ? <View style={[styles.tripStatus]}>
                                                                <Text style={styles.courseStatus}>{getStatusText()}</Text>
                                                                {/* {course.ID_STATUT == IDS_COURSE_STATUS.VERS_LEPICKUP ? (
                                                                        <Text style={[styles.courseStatus, { marginLeft: 0, color: "#333" },]} >
                                                                                {getDriverDuration() || "00:00"} min
                                                                        </Text>
                                                                ) : null} */}
                                                                {course.ID_STATUT == IDS_COURSE_STATUS.COURSE_EN_COURS ? <LottieView style={{ width: 30, height: 35, marginTop: 1 }} source={require('../../../assets/lotties/trip-in-progress.json')} autoPlay /> : null}
                                                        </View> : null}
                                        <View style={styles.pickupDestionation}>
                                                  <View style={styles.addressIcons}>
                                                            <View style={styles.currentIcon}>
                                                                      <View style={styles.secondCircle}>
                                                                                <View style={styles.lastCircle} />
                                                                      </View>
                                                            </View>
                                                            <View style={styles.addressSeparator}>
                                                                      <View style={styles.separatorDot} />
                                                                      <View style={styles.separatorDot} />
                                                                      <View style={styles.separatorDot} />
                                                                      <View style={styles.separatorDot} />
                                                            </View>
                                                            <View style={[styles.footerItemIcon, { backgroundColor: COLORS.primary }]}>
                                                                      <MaterialCommunityIcons name="map-marker" size={15} color="#fff" />
                                                            </View>
                                                  </View>
                                                  <View style={styles.adressBlock}>
                                                            <View style={styles.footerItemDetails}>
                                                                      <Text style={styles.addressTitle}>{intl.formatMessage({ id: "TripingScreen.pointdepart" })}</Text>
                                                                      <Text style={styles.footerItemValue} numberOfLines={1}>
                                                                                {course.ADDRESSE_PICKUP ? course.ADDRESSE_PICKUP : "-"}
                                                                      </Text>
                                                            </View>
                                                            <View style={[styles.footerItemDetails, { marginTop: 10 }]}>
                                                                      <Text style={styles.addressTitle}>{intl.formatMessage({ id: "mapScreen.destinationpoint" })}</Text>
                                                                      <Text style={styles.footerItemValue} numberOfLines={1}>
                                                                                {course.ADDRESSE_DESTINATION ? course.ADDRESSE_DESTINATION : "-"}
                                                                      </Text>
                                                            </View>
                                                  </View>
                                        </View>
                                                        {loadingBeneficiaires ?
                                                                <SmallLoadingSkeletons /> :
                                                                beneficiaires.length == 0 ? null :
                                                                        <>
                                                                                <View style={styles.cardBeneficiares}>
                                                                                        {/* <View style={[styles.beneficiaresCard]}>
                                                                                                <Text style={styles.courseStatus}>{intl.formatMessage({ id: 'ListesBeneficiaireCourseScreen.Beneficiaires' })}</Text>
                                                                                        </View> */}
                                                                                        {/* <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                                                                                                {beneficiaires.map((beneficire, index) => {
                                                                                                        return (
                                                                                                                <View style={styles.cardDetailsBeneficiaires} key={index}>
                                                                                                                        <View style={styles.beneficiairesRanger}>
                                                                                                                                <TouchableOpacity style={styles.cardUserBeneficiaires} onPress={handleImagesBenecifiairePress} >
                                                                                                                                        <View style={{ width: 30, height: 30 }}>
                                                                                                                                                {course?.IMAGE ? <Image source={{ uri: course?.IMAGE }} style={styles.driverImage} /> :
                                                                                                                                                        <Image source={require('../../../assets/images/user.png')} style={styles.driverImage} />}
                                                                                                                                        </View>
                                                                                                                                </TouchableOpacity>
                                                                                                                                <View style={styles.beneficiaresItemDetails}>
                                                                                                                                        <Text>{beneficire?.riders?.NOM} {beneficire?.riders?.PRENOM}</Text>
                                                                                                                                        <Text style={styles.beneficiaresItemValue} numberOfLines={1}>
                                                                                                                                                {beneficire?.riders?.TELEPHONE}
                                                                                                                                        </Text>
                                                                                                                                </View>
                                                                                                                        </View>
                                                                                                                </View>
                                                                                                        )
                                                                                                })}
                                                                                        </ScrollView> */}
                                                                                        <TouchableNativeFeedback
                                                                                                background={TouchableNativeFeedback.Ripple('#C4C4C4')}
                                                                                                onPress={() => {
                                                                                                        setIsOpenBeneficiaire(true)
                                                                                                        listeBeneficiresModalizeRef.current.open()
                                                                                                }}
                                                                                        >
                                                                                                <View style={[styles.corporate, { marginTop: 15 }]}>
                                                                                                        {/* <View style={styles.corporateImageContainer}>
                                                                                                                <MaterialCommunityIcons name="account-group-outline" size={40} color="#777" />
                                                                                                        </View> */}
                                                                                                        <View style={styles.corporateDetails}>
                                                                                                                <View style={styles.corporateTop}>
                                                                                                                        <Text style={styles.corporateName} numberOfLines={1}>{intl.formatMessage({ id: 'CorporatesScreen.Bénéficiaires' })}</Text>
                                                                                                                        <Entypo name="chevron-small-down" size={24} color="#fff" />
                                                                                                                </View>
                                                                                                                <View style={styles.corporateBottom}>
                                                                                                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                                                                                <View style={{ marginLeft: 0 }}>
                                                                                                                                        {(beneficiaires.length > 0 || beneficiaires.length > 0) ? <BeneficiairesRender beneficiaires={beneficiaires.map(c => ({ NOM: c.riders?.NOM, PRENOM: c.riders?.PRENOM }))} /> : null}
                                                                                                                                </View>
                                                                                                                        </View>
                                                                                                                </View>
                                                                                                        </View>
                                                                                                </View>
                                                                                        </TouchableNativeFeedback>
                                                                                </View>
                                                                        </>
                                                        }


                                                        <View style={styles.moreInfos}>
                                                                <View style={styles.moreInfo}>
                                                                        <AntDesign name="clockcircleo" size={20} color="#777" />
                                                                        <Text style={styles.moreInfoValue}>{moment(course?.DATE_INSERTION).format("HH:mm")}</Text>
                                                                </View>
                                                                <View style={[styles.moreInfo, { marginLeft: 20 }]}>
                                                                        <AntDesign name="car" size={20} color="#777" />
                                                                        <Text style={styles.moreInfoValue}>{course?.NOM_CORPORATE}</Text>
                                                                </View>
                                                                {course?.NOM_CORP_CORPORATE ? <View style={[styles.moreInfo, { marginLeft: 20 }]}>
                                                                        <FontAwesome name="building-o" size={20} color="#777" />
                                                                        <Text style={styles.moreInfoValue}>{course?.NOM_CORP_CORPORATE}</Text>
                                                                </View> : null}
                                                        </View>
                                                        <View style={{ paddingVertical: 16, marginHorizontal: 10 }}>
                                                                {course?.ID_STATUT != IDS_COURSE_STATUS.COURSE_EN_COURS && !canCancel ? <TouchableNativeFeedback
                                                                        disabled={loadingStreet}
                                                                        onPress={() => setShowConfirmCancelModal(true)}
                                                                >
                                                                        <View
                                                                                style={[
                                                                                        { backgroundColor: "#D2001A", opacity: 0.8, paddingVertical: 12, borderRadius: 8 },
                                                                                        loadingStreet && { opacity: 0.5 },
                                                                                ]}
                                                                        >
                                                                                <Text style={styles.submitBtnText}>{intl.formatMessage({ id: 'TripingScreen.Annulercourse' })}</Text>
                                                                        </View>
                                                                </TouchableNativeFeedback> : null
                                                                }
                                                        </View>
                                                </View>
                                                <Portal>
                                                        <GestureHandlerRootView
                                                                style={{
                                                                        height: isOpen ? "100%" : 0,
                                                                        opacity: isOpen ? 1 : 0,
                                                                        backgroundColor: "rgba(0, 0, 0, 0)",
                                                                        position: "absolute",
                                                                        width: "100%",
                                                                        zIndex: 1,
                                                                }}
                                                        >
                                                                <Modalize
                                                                        ref={mapTypeModalizeRef}
                                                                        adjustToContentHeight
                                                                        handlePosition="inside"
                                                                        modalStyle={{
                                                                                borderTopRightRadius: 10,
                                                                                borderTopLeftRadius: 10,
                                                                                paddingVertical: 20,
                                                                        }}
                                                                        handleStyle={{ marginTop: 10 }}
                                                                        scrollViewProps={{
                                                                                keyboardShouldPersistTaps: "handled",
                                                                        }}
                                                                        onClosed={() => {
                                                                                setIsOpen(false);
                                                                        }}
                                                                >
                                                                        <MapTypesModalize
                                                                                mapType={mapType}
                                                                                handleMapTypePress={(type) => {
                                                                                        mapTypeModalizeRef.current.close();
                                                                                        setMapType(type);
                                                                                }}
                                                                        />
                                                                </Modalize>
                                                        </GestureHandlerRootView>
                                                </Portal>

                                                <Portal>
                                                        <GestureHandlerRootView
                                                                style={{
                                                                        height: isOpenBeneficiaire ? "100%" : 0,
                                                                        opacity: isOpenBeneficiaire ? 1 : 0,
                                                                        backgroundColor: "rgba(0, 0, 0, 0)",
                                                                        position: "absolute",
                                                                        width: "100%",
                                                                        zIndex: 1,
                                                                }}
                                                        >
                                                                <Modalize
                                                                        ref={listeBeneficiresModalizeRef}
                                                                        adjustToContentHeight
                                                                        handlePosition="inside"
                                                                        modalStyle={{
                                                                                borderTopRightRadius: 10,
                                                                                borderTopLeftRadius: 10,
                                                                                paddingVertical: 20,
                                                                        }}
                                                                        handleStyle={{ marginTop: 10 }}
                                                                        scrollViewProps={{
                                                                                keyboardShouldPersistTaps: "handled",
                                                                        }}
                                                                        onClosed={() => {
                                                                                setIsOpenBeneficiaire(false);
                                                                        }}
                                                                >
                                                                        <ListesBeneficiaireModal
                                                                                beneficiaires={beneficiaires}
                                                                                listeBeneficiresModalizeRef={listeBeneficiresModalizeRef}
                                                                                setIsOpenBeneficiaire={setIsOpenBeneficiaire}
                                                                        />
                                                                </Modalize>
                                                        </GestureHandlerRootView>
                                                </Portal>
                                        </View>
                                </Modalize>
                        </View>
                        {showImageModal && course.ID_DRIVER != null && (
                                <ImageView
                                        images={[{ uri: course.PHOTO_VEHICULE }]}
                                        imageIndex={0}
                                        visible={showImageModal}
                                        onRequestClose={() => setShowImageModal(false)}
                                        swipeToCloseEnabled
                                        keyExtractor={(_, index) => index.toString()}
                                />
                        )}

                        {showImageBeneficiaireModal && course.ID_DRIVER != null && (
                                <ImageView
                                        images={[{ uri: course?.IMAGE }]}
                                        imageIndex={0}
                                        visible={showImageBeneficiaireModal}
                                        onRequestClose={() => setShowImageBeneficiaireModal(false)}
                                        swipeToCloseEnabled
                                        keyExtractor={(_, index) => index.toString()}
                                />
                        )}
                </>
        );
}

const styles = StyleSheet.create({
        container: {
                flex: 1,
        },
        map: {
                flex: 1,
        },
        header: {
                position: "absolute",
                width: "100%",
                top: 0,
                height: 60,
                paddingHorizontal: 10,
        },
        headerContent: {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#FFF",
                marginTop: 10,
                padding: 10,
                borderRadius: 5,
        },
        imageContainer: {
                width: 40,
                height: 40,
                backgroundColor: "#8aa9db",
                borderRadius: 40,
                padding: 2,
                justifyContent: "center",
                alignItems: "center",
        },
        imageContainerBack: {
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
                resizeMode: "cover",
        },
        onlineText: {
                fontSize: 16,
                fontWeight: "bold",
                opacity: 0.8,
        },
        headerBtn: {
                padding: 10,
                borderRadius: 20,
        },
        insideMap: {
                position: "absolute",
                width: "100%",
                // backgroundColor: 'red'
        },
        mapPin: {
                position: "absolute",
                alignItems: "center",
                justifyContent: "center",
                width: 50,
                height: 50,
        },
        pinImg: {
                width: 30,
                height: 30,
                position: "absolute",
                bottom: 0,
        },
        shadow: {
                height: 10,
                width: 20,
                backgroundColor: "rgba(0, 0, 0, 0.15)",
                borderRadius: 20,
                position: "absolute",
                bottom: -2,
        },
        footerContainer: {
                width: "100%",
        },
        footer: {
                // backgroundColor: "#FFF",
        },
        mapTypeBtn: {
                backgroundColor: '#fff',
                width: 50,
                height: 50,
                borderRadius: 50,
                justifyContent: 'center',
                alignItems: 'center',
                elevation: 5,
                position: 'absolute',
                right: 10,
                top: 20
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
                top: 80,
                zIndex: 1000
        },
        dangerBtn: {
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
                top: 140,
                zIndex: 1000
        },
        footerBtn: {
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 10,
                paddingVertical: 5,
                // borderBottomWidth: 1,
                borderBottomColor: "#F1F1F1",
        },
        currentIcon: {
                  width: 20,
                  height: 20,
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
                fontSize: 14,
                fontWeight: "bold",
                color: "#333",
        },
        detailsIcon: {
                marginLeft: 10,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                flex: 1,
        },
        footerItemDetails: {
                width: "90%",
        },
        footerItemValue: {
                color: "#777",
                fontSize: 12,
        },
        footerItemIcon: {
          width: 20,
          height: 20,
          backgroundColor: '#85969F',
          borderRadius: 50,
          justifyContent: 'center',
          alignContent: 'center',
          alignItems: 'center'
        },
        submitBtn: {
                backgroundColor: "#8aa9db",
                borderRadius: 8,
                paddingVertical: 12,
                flex: 1,
        },
        submitBtnText: {
                textAlign: "center",
                color: "#fff",
                fontWeight: "bold",
        },
        carPin: {
                width: 40,
                height: 40,
                resizeMode: "contain",
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
                marginBottom: 12,
        },
        markerInfoContent: {
                borderRadius: 10,
                backgroundColor: '#fff',
                elevation: 5,
                paddingVertical: 10,
                paddingHorizontal: 12,
        },
        markerCardLine: {
                flexDirection: "row",
                alignItems: "center"
        },
        markerCardText: {
                fontSize: 10,
                color: '#777',
                marginLeft: 5,
                fontFamily: "Nunito"
        },
        downCaret: {
                position: 'absolute',
                width: 20,
                height: 20,
                backgroundColor: '#fff',
                borderRadius: 5,
                alignSelf: 'center',
                bottom: '-5%',
                transform: [{
                        rotate: '45deg'
                }]
        },
        searchDriver: {
                paddingHorizontal: 10,
                alignItems: 'center',
        },
        searchDriverTitle: {
                fontSize: 15,
                fontFamily: "Nunito-ExtraBold",
                textAlign: 'center',
                marginTop: 20
        },
        confirmActions: {
                flexDirection: "row",
                alignItems: "center",
        },
        actions: {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 10
        },
        messageBtn: {
                padding: 10,
                flexDirection: "row",
                justifyContent: 'center',
                alignItems: "center",
                borderRadius: 10,
                backgroundColor: "#fff",
                // borderWidth: 1,
                borderColor: "green",
                backgroundColor: COLORS.primary,
                flex: 1,
                // width: "50%",
                marginRight: 10,
                overflow: 'hidden'
        },
        callBtn: {
                // width: "50%",
                flex: 1,
                height: 50,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 10,
                backgroundColor: "#fff",
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: COLORS.primary
        },
        confirmBtn: {
                flex: 1,
                marginLeft: 15,
        },
        directionOverview: {
                paddingHorizontal: 10,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 15,
        },
        block: {
                justifyContent: "center",
                alignItems: "center",
        },
        blockTitle: {
                color: "#777",
                fontSize: 13,
        },
        blockValue: {
                fontWeight: "bold",
                fontSize: 14,
                opacity: 0.8,
        },
        driverInfo: {
                // padding: 10,
        },
        driverHeder: {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: 'space-between',
                borderBottomWidth: 1,
                borderBottomColor: "#f1f1f1",
                paddingTop: 0,
                padding: 10
        },
        driverInfoContainer: {
                flexDirection: "row",
                alignItems: "center",
        },
        tripStatus: {
                marginTop: 10,
                paddingHorizontal: 10,
                paddingBottom: 15,
                flexDirection: 'row',
                alignItems: 'center',
                // justifyContent: 'center'
        },
        courseStatus: {
                color: '#777',
                fontFamily: "Nunito-Bold",
                fontSize: 17
        },
        driverNames: {
                marginLeft: 10
        },
        driverName: {
                fontFamily: "Nunito-Bold",
                fontSize: 16,
        },
        driverTel: {
                fontFamily: "Nunito",
                color: "#777",
                fontSize: 13,
                marginTop: 2
        },
        driverImages: {
                flexDirection: "row",
                alignItems: "center",
        },
        driverImageContainer: {
                width: 60,
                height: 60,
                borderRadius: 80,
                backgroundColor: COLORS.primary,
                // padding: 3,
                zIndex: 2,
        },
        driverImage: {
                width: "100%",
                height: "100%",
                borderRadius: 80,
                resizeMode: "cover",
        },
        ratingContainer: {
                position: "absolute",
                bottom: -5,
                flexDirection: "row",
                alignSelf: "center",
                alignItems: "center",
                backgroundColor: COLORS.primary,
                paddingVertical: 2,
                paddingHorizontal: 5,
                borderRadius: 10,
        },
        ratingText: {
                color: "#fff",
                fontSize: 10,
                marginLeft: 3,
        },
        carImageContainer: {
                width: 120,
                height: 60,
                // backgroundColor: "#e8ebeb",
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
                padding: 2
        },
        carImage: {
                width: "100%",
                height: "100%",
                resizeMode: "cover",
                borderRadius: 10
        },
        plateNumber: {
                fontFamily: "Nunito-ExtraBold",
                fontSize: 16,
        },
        carModel: {
                color: "#777",
                fontSize: 13,
                fontFamily: "Nunito",
        },
        actionTextLabel: {
                marginLeft: 10,
                color: COLORS.primary,
                fontFamily: "Nunito-Bold",
                fontSize: 15
        },
        noDriverAcions: {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
        },
        noDriverAcion: {
                backgroundColor: COLORS.primary,
                borderRadius: 8,
                paddingVertical: 12,
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
        },
        searchDriverDescription: {
                fontFamily: "Nunito",
                color: "#777",
                fontSize: 12,
                marginTop: 5,
                textAlign: 'center'
        },
        cancelPureBtn: {
                padding: 10,
                marginTop: 25,
                marginBottom: 22,
                backgroundColor: COLORS.primary,
                borderRadius: 30,
                paddingHorizontal: 30,
                minWidth: 220
        },
        cancelPureBtnText: {
                fontFamily: "Nunito-Bold",
                fontSize: 16,
                // color: COLORS.error,
                color: "#fff",
                textAlign: 'center'
        },
        adressBlock: {
                marginLeft: 15,
        },
        moreInfos: {
                flexDirection: 'row',
                alignItems: "center",
                marginTop: 15,
                paddingHorizontal: 10
        },
        moreInfo: {
                alignItems: 'center',
                flexDirection: 'row',
                alignItems: 'center'
        },
        moreInfoValue: {
                fontFamily: "Nunito",
                color: '#777',
                marginLeft: 5
        },
        addressSeparator: {
                height: 25,
                width: 5,
                justifyContent: 'space-between',
                alignItems: 'center',
                marginVertical: 5
        },
        separatorDot: {
                width: 3,
                height: 3,
                borderRadius: 2,
                backgroundColor: '#c4c4c4'
        },
        addressIcons: {
                alignItems: 'center',
                marginTop: 3
        },
        carSection: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 10,
                paddingHorizontal: 10
        },
        carinfo: {
        },
        cancelBtn: {
                width: 50,
                height: 50,
                borderRadius: 10,
                borderColor: "#e8ebeb",
                borderWidth: 2,
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden'
        },
        driverMarkerMin: {
                width: 35,
                height: 32,
                borderRadius: 8,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: "#e8ebeb"
        },
        driverMarkerMinText: {
                fontFamily: "Nunito-Bold",
                fontSize: 12,
                textAlign: "center"
        },
        driveMarkerMinLabel: {
                color: '#777',
                fontSize: 10,
                textAlign: "center",
                fontFamily: "Nunito",
                marginTop: -5
        },
        customModalizeHandle: {
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 5,
        },
        modalizeHandle: {
                height: 5,
                width: 40,
                backgroundColor: "#ddd",
                borderRadius: 10
        },
        handleFeedback: {
                color: '#777',
                fontSize: 10,
                fontFamily: "Nunito",
                textAlign: 'center'
        },
        traitementText: {
                fontSize: 10,
                fontFamily: "Nunito",
                color: "#777",
                textTransform: 'lowercase'
        },
        wavesContainer: {
                width: 200,
                height: 200,
                justifyContent: 'center',
                alignItems: 'center'
        },
        cardBeneficiares: {
        },
        cardUserBeneficiaires: {
                width: 33,
                height: 33,
                borderRadius: 50,
                backgroundColor: COLORS.primary,
                borderWidth: 1,
                borderColor: "#777",
                justifyContent: "center",
                alignContent: "center",
                alignItems: "center"
        },
        beneficiaresItemDetails: {
                // width: "40%",
                marginLeft: 5
        },
        beneficiaresItemValue: {
                color: "#777",
                fontSize: 12,
        },
        beneficiaresCard: {
                paddingBottom: 15,
                flexDirection: 'row',
                alignItems: 'center',
        },
        beneficiairesRanger: {
                marginHorizontal: 5,
                backgroundColor: '#F5F4F1',
                borderRadius: 10,
                padding: 10,
                justifyContent: "center",
                alignContent: "center",
                alignItems: "center"
        },
        cardDetailsBeneficiaires: {
                // flexDirection: "row",
                // flexWrap: 'wrap',

                // flexDirection: 'row',
                //     flexWrap: 'wrap',
                //     justifyContent: "space-around"
        },
        corporates: {
                paddingHorizontal: 10
        },
        corporate: {
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 10,
                paddingLeft: 5,
                paddingVertical: 10,
                marginHorizontal: 10,

                borderWidth: 1,
                borderColor: COLORS.primary,
                // borderColor: "#777",
                backgroundColor:"#777",
                marginTop: 10,
                borderRadius: 10,
                overflow: 'hidden'
        },
        corporateImageContainer: {
                width: 100,
                height: 50,
                justifyContent: 'center',
                alignItems: 'center'
        },
        corporateImage: {
                width: '100%',
                height: '100%',
                resizeMode: 'cover'
        },
        corporateDetails: {
                flex: 1
        },
        corporateTop: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
        },
        corporateBottom: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
        },
        corporateName: {
                fontSize: 13,
                fontFamily: "Nunito-Bold",
                maxWidth: '80%',
                color: "#fff"
        },
        corporateMutedText: {
                color: '#777',
                fontSize: 11,
                fontFamily: "Nunito"
        },
        footerItemDetails: {
        },
        addressTitle: {
                  fontFamily: "Nunito-Bold",
                  fontSize: 16
        },
        footerItemValue: {
                  color: '#777',
                  fontSize: 13,
                  fontFamily: "Nunito"
        },
        addressIcons: {
                  alignItems: 'center',
                  marginTop: 3
        },
        pickupDestionation: {
                  flexDirection: 'row',
                  maxWidth: "95%",
                  paddingHorizontal: 10
        },
        adressBlock: {
                  marginLeft: 15,
        },
});

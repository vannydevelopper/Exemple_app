import React, { useEffect, useState, useRef, useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, TouchableNativeFeedback, AppState } from "react-native";
import { COLORS } from "../../styles/COLORS"
import { Entypo, MaterialCommunityIcons, Foundation, FontAwesome5 } from '@expo/vector-icons';
import fetchApi from "../../helpers/fetchApi";
import { useNavigation } from "@react-navigation/native";
import { ID_STATUS_DRIVER_COURSE } from "../../constants/ID_STATUS_DRIVER_COURSE";
import useFetch from "../../hooks/useFetch";
import moment from 'moment'

export const MINUTES_TO_ACCEPT = 2


/**
 * composant pour afficher unde course par rapport du driver deja prise
 * @author Vanny Boy <vanny@mediabox.bi>
 * @date 1/3/2023
 * @returns 
 */

export default function CourseConfirmation() {
        const [courses, setCourses] = useState(null)
        const [loadingAnnilation, setLoadingAnnilation] = useState(false)
        const [loadingConfirme, setLoadingConfirme] = useState(false)
        const [loadingNewStatus, setLoadingNewStatus] = useState(false)
        const [annulationCourse, setAnnulationCourse] = useState(true)
        const [leftUnix, setLeftUnix] = useState(new Date().getTime())
        const [loadingStatus, status] = useFetch('/services/driver_livreurs/status')
        const navigation = useNavigation()

        const getNextStatus = currentStatusId => {
                const currentStatus = status.result.findIndex(value => value.ID_STATUS_COURSE == currentStatusId)
                const nextStatus = status.result[currentStatus + 1]
                return nextStatus
        }

        const checkAnnulation = async () => {
                try {
                        setLoadingAnnilation(true)
                        const res = await fetchApi(`/services/driver_livreurs/annulation/${courses.ID_DRIVER_COURSE}`, {
                                method: "PUT",
                                body: JSON.stringify({
                                        ID_LIVREUR: courses.ID_LIVREUR
                                }),
                                headers: { "Content-Type": "application/json" },
                        });
                        setAnnulationCourse(false)
                }
                catch (error) {
                        console.log(error)
                } finally {
                        setLoadingAnnilation(false)
                        setAnnulationCourse(false)
                }
        }

        const checkConfirmation = async () => {
                try {
                        setLoadingConfirme(true)
                        const res = await fetchApi(`/services/driver_livreurs/confirmation/${courses.ID_DRIVER_COURSE}`, {
                                method: "PUT",
                                body: JSON.stringify({
                                        ID_STATUS_COURSE: 2
                                }),
                                headers: { "Content-Type": "application/json" },
                        });
                        setCourses(res.result)
                }
                catch (error) {
                        console.log(error)
                } finally {
                        setLoadingConfirme(false)
                }
        }

        const onStatusChange = async (newStatusId) => {
                try {
                        setLoadingNewStatus(true)
                        const res = await fetchApi(`/services/driver_livreurs/confirmation/${courses.ID_DRIVER_COURSE}`, {
                                method: "PUT",
                                body: JSON.stringify({
                                        ID_STATUS_COURSE: newStatusId
                                }),
                                headers: { "Content-Type": "application/json" },
                        });
                        if (newStatusId == 4) {
                                setCourses()
                                const res = await fetchApi(`/services/driver_livreurs/status/commande/${courses.ID_DRIVER_COURSE}`, {
                                        method: "PUT",
                                        headers: { "Content-Type": "application/json" },
                                });
                        } else {
                                setCourses(res.result)
                        }

                }
                catch (error) {
                        console.log(error)
                } finally {
                        setLoadingNewStatus(false)
                }
        }

        /**
         * Fonction pour lancer le conteur des menutes en attendant la confirmation du livreurs
         * @param {*} newState 
         */

        const handleAppStateChange = (newState) => {
                if (newState == 'active') {
                        if (courses && courses.ID_STATUS_COURSE == ID_STATUS_DRIVER_COURSE.ETTENTE) {
                                setLeftUnix(moment((moment(courses.DATE_DEMANDE).add(MINUTES_TO_ACCEPT, 'minutes')) - moment()).unix())
                        }
                }
        };

        useEffect(() => {
                if (courses && courses.ID_STATUS_COURSE == ID_STATUS_DRIVER_COURSE.ETTENTE) {
                        setLeftUnix(moment((moment(courses.DATE_DEMANDE).add(MINUTES_TO_ACCEPT, 'minutes')) - moment()).unix())
                        const timer = setInterval(() => {
                                setLeftUnix(t => t - 1)
                        }, 1000)
                        return () => {
                                clearInterval(timer)
                        }
                }
        }, [courses])
        useEffect(() => {
                if (courses) {
                        const leftMinutes = moment(moment.unix(leftUnix)).get('minutes')
                        if (leftMinutes > 2) {
                                if (courses.ID_STATUS_COURSE == ID_STATUS_DRIVER_COURSE.ETTENTE) {
                                        checkAnnulation(1)
                                }
                                setCourses(null)
                        }
                }
        }, [leftUnix])

        useEffect(() => {
                AppState.addEventListener('change', handleAppStateChange);
                return () => {
                        AppState.removeEventListener('change', handleAppStateChange);
                };
        }, []);

        useEffect(() => {
                (async () => {
                        try {
                                const response = await fetchApi("/services/driver_livreurs")
                                setCourses(response.result)
                        }
                        catch (error) {
                                console.log(error)
                        }
                })()
        }, [])

        if (!courses) {
                return null
        }

        return (
                <>
                        {annulationCourse ? <View style={styles.container}>
                                <View style={styles.cardTitle}>
                                        <Text style={{ ...styles.titlePrincipal, fontSize: 18, marginVertical: 4 }}>Course</Text>
                                </View>
                                <View style={{ marginHorizontal: 10 }}>
                                        <View style={styles.cardStatus}>
                                                <View style={styles.cardIcon}>
                                                        <Entypo name="location" size={20} color="black" />
                                                </View>
                                                <View style={styles.cardDescription}>
                                                        <Text style={styles.titlePrincipal}>Addresse depart</Text>
                                                        {courses.ADDRESSE_PICKER ? <Text>{courses.ADDRESSE_PICKER}</Text> : null}
                                                </View>
                                        </View>
                                        <View style={styles.cardStatus}>
                                                <View style={styles.cardIcon}>
                                                        <Entypo name="location" size={20} color="black" />
                                                </View>
                                                <View style={styles.cardDescription}>
                                                        <Text style={styles.titlePrincipal}>Adresse destination</Text>
                                                        {courses.ADRESSE_DEST ? <Text>{courses.ADRESSE_DEST}</Text> : null}
                                                </View>
                                        </View>
                                        <View style={styles.details}>
                                                <View style={[styles.detail, { marginLeft: 0 }]}>
                                                        <MaterialCommunityIcons name="map-marker-distance" size={20} color="#555" />
                                                        <Text style={styles.detailValue}>12 km</Text>
                                                </View>
                                                <View style={styles.detail}>
                                                        <Foundation name="dollar" size={24} color="#555" />
                                                        <Text style={styles.detailValue}>500 FBU</Text>
                                                </View>
                                                {courses.ID_STATUS_COURSE == ID_STATUS_DRIVER_COURSE.ETTENTE ? <View style={styles.detail}>
                                                        <FontAwesome5 name="clock" size={15} color="black" />
                                                        <Text style={styles.detailValue}>
                                                                {moment(moment.unix(leftUnix)).format('mm : ss')}
                                                        </Text>
                                                </View> : null}
                                        </View>
                                        {courses.ID_STATUS_COURSE == ID_STATUS_DRIVER_COURSE.ETTENTE ? <View style={styles.boutonCard}>
                                                {loadingAnnilation ?
                                                        <View style={{ flex: 1, justifyContent: 'center', right: 50 }}>
                                                                <ActivityIndicator animating={true} size="large" color={"black"} />
                                                        </View> :
                                                        <TouchableOpacity style={styles.boutonIgnore} onPress={checkAnnulation}>
                                                                <Text style={styles.titleIgnore}>Ignorer</Text>
                                                        </TouchableOpacity>}

                                                {loadingConfirme ? <View style={{ flex: 1, justifyContent: 'center', left: 40 }}>
                                                        <ActivityIndicator animating={true} size="large" color={"black"} />
                                                </View> :
                                                        <TouchableOpacity style={styles.boutonIgnore} onPress={checkConfirmation}>
                                                                <Text>Confirmer</Text>
                                                        </TouchableOpacity>}
                                        </View> :
                                                <>
                                                        {loadingNewStatus ? <View style={{ flex: 1, justifyContent: 'center', right: 50 }}>
                                                                <ActivityIndicator animating={true} size="large" color={"black"} />
                                                        </View> :
                                                                <TouchableNativeFeedback onPress={() => onStatusChange(getNextStatus(courses.ID_STATUS_COURSE).ID_STATUS_COURSE)}>
                                                                        <View style={styles.cardStatusNext}>
                                                                                <View style={{ marginHorizontal: 10 }}>
                                                                                        <Text style={styles.titleStatus}>Changer le status</Text>
                                                                                        {!loadingStatus ? <Text style={styles.statusDescription}>{getNextStatus(courses.ID_STATUS_COURSE).DESCRIPTION_STATUT}</Text> : null}
                                                                                </View>
                                                                        </View>
                                                                </TouchableNativeFeedback>}

                                                </>}


                                </View>
                        </View> : null}
                </>
        )
}

const styles = StyleSheet.create({
        container: {
                backgroundColor: "#ddd",
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                bottom: 0,
                position: "absolute",
                width: "100%",
                height: 245,
                zIndex: 1
        },
        cardTitle: {
                justifyContent: "center",
                alignItems: "center",
        },
        titlePrincipal: {
                color: COLORS.ecommercePrimaryColor,
                fontWeight: "bold"
        },
        boutonCard: {
                paddingVertical: 10,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between"
        },
        boutonIgnore: {
                borderRadius: 15,
                paddingVertical: 12,
                paddingHorizontal: 40,
                alignSelf: "flex-end",
                borderWidth: 1,
                borderColor: COLORS.ecommercePrimaryColor
        },
        cardIcon: {
                width: 35,
                height: 35,
                borderRadius: 50,
                backgroundColor: "#fff",
                justifyContent: "center",
                alignItems: "center"
        },
        cardStatus: {
                flexDirection: "row",
                alignContent: "center",
                alignItems: "center",
                marginVertical: 5

        },
        cardDescription: {
                marginLeft: 15
        },
        cardStatusNext: {
                marginTop: 3,
                padding: 8,
                backgroundColor: "#49b7b7",
                borderRadius: 10
        },
        titleStatus: {
                color: "#fff",
                fontWeight: "bold"
        },
        statusDescription: {
                color: "#FFF"
        },
        details: {
                flexDirection: 'row',
                alignItems: "center",
                paddingHorizontal: 10,
                marginVertical: 2
        },
        detail: {
                flexDirection: 'row',
                alignItems: "center",
                backgroundColor: '#F1F1F1',
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 30,
                marginLeft: 5
        },
        detailValue: {
                fontSize: 12,
                color: '#555',
                marginLeft: 5,
                fontWeight: "bold"
        },
})
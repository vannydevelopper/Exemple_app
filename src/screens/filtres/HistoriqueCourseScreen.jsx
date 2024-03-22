import { DrawerActions, useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import React, { useState, useCallback, useRef, useEffect } from "react";
import { StyleSheet, Text, TouchableNativeFeedback, View, ActivityIndicator, FlatList, RefreshControl, TouchableWithoutFeedback, TouchableOpacity } from "react-native";
import { AntDesign, MaterialIcons, FontAwesome5, SimpleLineIcons, Entypo } from '@expo/vector-icons';
import { COLORS } from "../../styles/COLORS";
import fetchApi from "../../helpers/fetchApi";
import moment from 'moment'
import IDS_COURSE_STATUS from "../../constants/IDS_COURSE_STATUS";
import { useIntl } from "react-intl";
import SmallLoadingSkeletons from "../../components/skeletons/SmallLoadingSkeletons";
import NoDataFound from "../../components/app/NoDataFound";
import SystemError from "../../components/app/SystemError";
import { Modalize } from 'react-native-modalize';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import FiltreHistoriqueModalize from "../../components/filtre/FiltreHistoriqueModalize";
import { Portal } from 'react-native-portalize';

export default function HistoriqueCourseScreen() {
        const [historiques, setHistoriques] = useState([])
        const route = useRoute()
        const [loading, setLoading] = useState(true)
        const navigation = useNavigation()
        const [IsLoadingMore, setIsLoadingMore] = useState(false)
        const [offset, setOffset] = useState(0)
        const [refreshing, setRefreshing] = useState(false)
        const [hasSystemError, setHasSystemError] = useState(false)
        const modalizeRef = useRef(null)
        const [isOpen, setIsOpen] = useState(false)
        const [filters, setFilters] = useState(null)
        const [selectedCorporate, setSelectedCorporate] = useState(null)
        const intl = useIntl()
        const LIMIT = 10
        const isCloseToBottom = useCallback(({ layoutMeasurement, contentOffset, contentSize }) => {
                const paddingToBottom = 20;
                return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
        }, []);

        const getFilterCount = useCallback(() => {
                var count = 0
                if (filters?.codeCourse) count += 1
                if (filters?.corporate) count += 1
                if (filters?.dateDebut) count += 1
                if (filters?.dateFin) count += 1
                return count
        }, [filters])


        const onLoadMore = async () => {
                try {
                        setIsLoadingMore(true)
                        const newOffset = offset + LIMIT
                        const hrs = await getHistoriqueDriver(newOffset)
                        setOffset(newOffset)
                        setHistoriques(h => [...h, ...hrs.result])
                } catch (error) {
                        console.log(error)
                } finally {
                        setIsLoadingMore(false)
                }
        }

        const getHistoriqueDriver = useCallback(async (offset = 0) => {
                try {
                        var url = `/course/courses/drivers/driver_history?limit=${LIMIT}&offset=${offset}`;

                        if (filters) {
                                const { codeCourse, corporate, dateDebut, dateFin } = filters;

                                if (codeCourse) {
                                        url += `&codeCourse=${encodeURIComponent(codeCourse)}`;
                                }
                                if (corporate) {
                                        url += `&corporate=${encodeURIComponent(corporate)}`;
                                }
                                if (dateDebut) {
                                        const formattedDateDebut = moment(dateDebut).format("YYYY-MM-DD");
                                        url += `&dateDebut=${encodeURIComponent(formattedDateDebut)}`;
                                }

                                if (dateFin) {
                                        const formattedDateFin = moment(dateFin).format("YYYY-MM-DD");
                                        url += `&dateFin=${encodeURIComponent(formattedDateFin)}`;
                                }
                        }

                        console.log(url);

                        return await fetchApi(url);
                } catch (error) {
                        console.log(error);
                }
        }, [filters]);

        const onRefresh = async () => {
                try {
                        setRefreshing(true)
                        setOffset(0)
                        const res = await getHistoriqueDriver()
                        setHistoriques(res.result)
                }
                catch (error) {
                        console.log(error)
                        setHasSystemError(true)
                }
                finally {
                        setRefreshing(false)
                }
        }
        useFocusEffect(useCallback(() => {
                (async () => {
                        try {
                                setOffset(0)
                                const response = await getHistoriqueDriver(0)
                                setHistoriques(response.result)
                        } catch (error) {
                                console.log(error)
                        } finally {
                                setLoading(false)
                        }
                })()
        }, [filters]))

        useEffect(() => {
                const params = route.params || {}
                const { corporate } = params
                if (corporate) {
                        setSelectedCorporate(corporate)
                        setFilters(null)
                }
        }, [route])
        if (hasSystemError) {
                return <SystemError onTryAgain={() => {
                        setLoading(true)
                        setHasSystemError(false)
                        getHistoriqueDriver()
                }} />
        }

        const TripStatus = ({ ID_STATUT }) => {
                if ([IDS_COURSE_STATUS.COURSE_TERMINE, IDS_COURSE_STATUS.TERMINE_PAR_ADMIN].includes(ID_STATUT)) {
                        return (
                                <View style={styles.statusBlock}>
                                        <AntDesign name="checkcircle" size={15} color={COLORS.primary} />
                                        <Text style={styles.statusName}>{intl.formatMessage({ id: "HistoriqueCourseScreen.terminee" })}</Text>
                                </View>
                        )
                }
                if ([IDS_COURSE_STATUS.ANNLER_PAR_DRIVER, IDS_COURSE_STATUS.ANNLER_PAR_RIDER, IDS_COURSE_STATUS.ANNLER_PAR_ADMIN].includes(ID_STATUT)) {
                        return (
                                <View style={styles.statusBlock}>
                                        <AntDesign name="closecircle" size={15} color="#e04a3f" />
                                        <Text style={[styles.statusName, { color: "#e04a3f" }]}>{intl.formatMessage({ id: "HistoriqueCourseScreen.annulee" })}</Text>
                                </View>
                        )
                }
                if ([IDS_COURSE_STATUS.PROBLEMATIQUE].includes(ID_STATUT)) {
                        return (
                                <View style={styles.statusBlock}>
                                        <Entypo name="back-in-time" size={16} color="#a16207" />
                                        <Text style={[styles.statusName, { color: "#a16207" }]}>En ettente</Text>
                                </View>
                        )
                }
                return null
        }

        return (
                <>
                        <View style={styles.container}>
                                {(loading || (!loading && historiques.length > 0)) ? <View style={styles.headerLeft}>
                                        <Text style={styles.title}>{intl.formatMessage({ id: 'HistoriqueCourseScreen.HISTORQUES' })}</Text>
                                        <TouchableOpacity style={styles.filterBtn} onPress={() => {
                                                setIsOpen(true)
                                                modalizeRef.current.open()
                                        }}>
                                                <SimpleLineIcons name="equalizer" size={24} color="#5E94FF" style={{ fontWeight: 'bold', transform: [{ rotate: '-90deg' }] }} />
                                                {getFilterCount() > 0 ? <Text style={styles.filterBadge}>
                                                        {getFilterCount()}
                                                </Text> : null}
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                                onPress={() => {
                                                        setIsOpen(true)
                                                        modalizeRef.current.open()
                                                }}
                                        >
                                                <SimpleLineIcons name="equalizer" size={24} color="#5E94FF" style={{ fontWeight: 'bold', right: 11, transform: [{ rotate: '-90deg' }] }} />
                                        </TouchableOpacity>
                                </View> : null}
                                {loading ? <SmallLoadingSkeletons /> : historiques.length == 0 ?
                                        <View style={styles.emptyContainer}>
                                                <Text style={styles.title}>{intl.formatMessage({ id: 'HistoriqueCourseScreen.HISTORQUES' })}</Text>
                                                <NoDataFound />
                                        </View>
                                        :
                                        <>
                                                <FlatList
                                                        refreshControl={<RefreshControl
                                                                colors={[COLORS.primary]} refreshing={refreshing}
                                                                onRefresh={onRefresh} />}

                                                        onScroll={({ nativeEvent }) => {
                                                                if (isCloseToBottom(nativeEvent) && !IsLoadingMore) {
                                                                        onLoadMore()
                                                                }
                                                        }}
                                                        style={styles.historiques}
                                                        data={historiques}
                                                        ListFooterComponent={() => <ActivityIndicator animating size={'small'} color={COLORS.primary} style={{ marginVertical: 10, opacity: IsLoadingMore ? 1 : 0 }} />}
                                                        renderItem={({ item: historique, index }) => {
                                                                const showDate = index == 0 ? true : moment(historiques[index - 1].DATE_INSERTION).date() != moment(historiques[index].DATE_INSERTION).date()
                                                                return (
                                                                        <View>
                                                                                {showDate ? <Text style={[styles.date, { marginTop: index > 0 ? 15 : 0 }]}>
                                                                                        {moment(historique.DATE_INSERTION).calendar(null, {
                                                                                                sameDay: `[${intl.formatMessage({ id: "HistoriqueCourseScreen.Aujourdui" })}]`,
                                                                                                lastDay: `[${intl.formatMessage({ id: "HistoriqueCourseScreen.hier" })}]`,
                                                                                                nextDay: 'DD-MM-YYYY',
                                                                                                lastWeek: 'DD-MM-YYYY',
                                                                                                sameElse: 'DD-MM-YYYY',
                                                                                        })}
                                                                                </Text> : null}
                                                                                <TouchableNativeFeedback onPress={() => navigation.navigate('DetailCourseScreen', { idCourse: historique.ID_COURSE, idHistorique: historique.ID_HISTORIQUE })} useForeground>
                                                                                        <View style={styles.course}>
                                                                                                <View style={styles.statutCourse}>
                                                                                                        <View style={styles.cardCodeCourse}>
                                                                                                                <Text style={styles.hour}>{moment(historique.DATE_INSERTION).format("HH:mm")}</Text>
                                                                                                                <Text style={styles.hour}>{historique.NUMERO_COURSE ? ` - #${historique.NUMERO_COURSE}` : null}</Text>
                                                                                                                {historique.NOM_METHODE ? <View style={styles.cardMethodPaymants}><Text style={styles.methodPaymentBadge}>{historique.NOM_METHODE}</Text></View> : null}
                                                                                                        </View>
                                                                                                        <TripStatus ID_STATUT={historique.ID_STATUT} />
                                                                                                </View>
                                                                                                <View style={styles.adressBlock}>
                                                                                                        <MaterialIcons name="place" size={20} color="#777" />
                                                                                                        <Text style={[styles.adressName, {}]} numberOfLines={1}>{historique.ADDRESSE_PICKUP}</Text>
                                                                                                </View>
                                                                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
                                                                                                        <View style={styles.addressSeparator}>
                                                                                                                <View style={styles.separatorDot} />
                                                                                                                <View style={styles.separatorDot} />
                                                                                                                <View style={styles.separatorDot} />
                                                                                                                <View style={styles.separatorDot} />
                                                                                                        </View>
                                                                                                        <View style={styles.courseMontant}>
                                                                                                                <View style={styles.detailsBlock}>
                                                                                                                        <View style={styles.detail}>
                                                                                                                                <AntDesign name="dashboard" size={15} color="#777" />
                                                                                                                                <Text style={styles.detailValue}>{historique.DISTANCE_PARCOURUE ? historique.DISTANCE_PARCOURUE.toFixed(2) : '0'} KM</Text>
                                                                                                                        </View>
                                                                                                                        <View style={[styles.detail, { marginLeft: 10 }]}>
                                                                                                                                <AntDesign name="clockcircleo" size={15} color="#777" />
                                                                                                                                <Text style={styles.detailValue}>{historique.DUREE_PARCOURUE ? historique.DUREE_PARCOURUE.toFixed(1) : '0'} MIN</Text>
                                                                                                                        </View>
                                                                                                                        {historique.CORPORATE_NAME ? <View style={[styles.detail, { marginLeft: 10, flex: 1 }]}>
                                                                                                                                <FontAwesome5 name="building" size={15} color="#777" />
                                                                                                                                <Text style={styles.detailValue} numberOfLines={1}>{historique.CORPORATE_NAME}</Text>
                                                                                                                        </View> : null}
                                                                                                                </View>
                                                                                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                                                                        {historique.ID_COURSE_PROMOTION ? <Text style={styles.promoText}>Promo</Text> : null}
                                                                                                                        <Text numberOfLines={1} style={{ fontSize: 15, fontFamily: "Nunito-Bold", textAlign: 'right' }}>{historique.MONTANT.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FBU</Text>
                                                                                                                </View>
                                                                                                        </View>
                                                                                                </View>
                                                                                                <View style={styles.adressBlock}>
                                                                                                        <MaterialIcons name="place" size={20} color={COLORS.primary} />
                                                                                                        <Text style={[styles.adressName]} numberOfLines={1}>{historique.ADDRESSE_DESTINATION ? historique.ADDRESSE_DESTINATION : "-"}</Text>
                                                                                                </View>
                                                                                                {historique.POURCENTAGE ? <Text style={styles.majorationBadge}>+{historique.POURCENTAGE}%</Text> : null}
                                                                                        </View>
                                                                                </TouchableNativeFeedback>
                                                                        </View>
                                                                )
                                                        }}
                                                        keyExtractor={(historique, index) => index.toString()}
                                                // onEndReachedThreshold={2}
                                                // onEndReached={() => {
                                                //         if (!IsLoadingMore) {
                                                //                 onLoadMore()
                                                //         }
                                                // }}
                                                // ListFooterComponent={() => <View style={{ marginTop: 5, opacity: IsLoadingMore ? 1 : 0 }}><SmallLoadingSkeletons length={3} /></View>}
                                                />
                                        </>
                                }
                        </View>

                        <Modalize
                                ref={modalizeRef}
                                // adjustToContentHeight
                                handlePosition="inside"
                                modalStyle={{ backgroundColor: '#fff', borderTopLeftRadius: 15, borderTopRightRadius: 15 }}
                                scrollViewProps={{ keyboardShouldPersistTaps: 'handled' }}
                                adjustToContentHeight
                                closeSnapPointStraightEnabled={true}
                                onClosed={() => {
                                        setIsOpen(false)
                                }}
                                onClose={() => {
                                        // Keyboard.dismiss()
                                }}
                        >
                                <FiltreHistoriqueModalize
                                        filters={filters}
                                        setFilters={setFilters}
                                        selectedCorporate={selectedCorporate}
                                        modalizeRef={modalizeRef}
                                />
                        </Modalize>
                </>

        )


}
const styles = StyleSheet.create({
        container: {
                flex: 1,
                backgroundColor: COLORS.primaryBackground,
        },
        menuOpener: {
                padding: 10
        },
        menuOpenerLine: {
                height: 3,
                width: 30,
                backgroundColor: COLORS.primary,
                marginTop: 5,
                borderRadius: 10
        },
        courseMontant: {
                flexDirection: "row",
                justifyContent: "space-between",
                flex: 1
        },
        headerLeft: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 10
        },
        historiques: {
                paddingHorizontal: 10
        },
        title: {
                textAlign: 'center',
                marginLeft: 10,
                fontSize: 20,
                fontFamily: 'Nunito-Bold'
        },
        headerBtn: {
                padding: 10
        },
        hour: {
                fontFamily: "Nunito-Bold"
        },
        detail: {
                flexDirection: "row",
                alignItems: 'center'
        },
        detailsBlock: {
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: 12,
                flex: 1
        },
        detailValue: {
                fontSize: 13,
                marginLeft: 3,
                color: '#777',
                textTransform: 'capitalize',
                fontFamily: "Nunito"
        },
        statutCourse: {
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: 'center',
                marginBottom: 5
        },
        adressBlock: {
                flexDirection: "row",
                alignItems: 'center',
                maxWidth: '95%'
        },
        adressName: {
                marginLeft: 5,
                color: '#333',
                fontSize: 14,
                fontFamily: "Nunito"
        },
        addressSeparator: {
                height: 25,
                width: 5,
                justifyContent: 'space-between',
                alignItems: 'center',
                marginLeft: 8,
                marginVertical: 2
        },
        separatorDot: {
                width: 3,
                height: 3,
                borderRadius: 2,
                backgroundColor: '#c4c4c4'
        },
        date: {
                color: '#777',
                // paddingHorizontal: 10,
                fontFamily: 'Nunito-Bold',
                fontSize: 16
        },
        course: {
                backgroundColor: "white",
                marginTop: 10,
                paddingVertical: 20,
                paddingHorizontal: 10,
                borderRadius: 10,
                overflow: 'hidden'
        },
        statusBlock: {
                flexDirection: 'row',
                alignItems: 'center'
        },
        statusName: {
                marginLeft: 2,
                color: COLORS.primary,
                fontFamily: "Nunito-Bold"
        },
        majorationBadge: {
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: COLORS.primary,
                borderBottomRightRadius: 5,
                borderTopLeftRadius: 5,
                fontSize: 10,
                color: "#fff",
                paddingHorizontal: 5,
                fontFamily: 'Nunito-Bold'
        },
        emptyContainer: {
                flex: 1,
                backgroundColor: '#fff',
                paddingVertical: 20
        },
        methodPaymentBadge: {
                backgroundColor: "#FF7F50",
                borderRadius: 5,
                fontSize: 10,
                color: "#fff",
                paddingHorizontal: 5,
                fontFamily: "Nunito-Bold",
                marginLeft: 10
        },
        cardCodeCourse: {
                flexDirection: "row"
        },
        cardMethodPaymants: {
                justifyContent: "center"
        },
})
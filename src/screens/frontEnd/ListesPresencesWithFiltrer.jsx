import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TouchableNativeFeedback } from "react-native";
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { Portal } from 'react-native-portalize'
import { Modalize } from 'react-native-modalize'
import moment from 'moment';
import subText from "../../helpers/subText";
import { fetchApi } from "../../functions";
import { useFocusEffect } from "@react-navigation/native";
import Skeleton from "../../components/Skeleton/Skeleton";
import { Icon, Input } from 'native-base';
import { useSelector } from "react-redux";
import { userSelector } from "../../store/selectors/userSelector";

export const Skeletons = () => {
        const fakeElements = []
        for (let i = 1; i <= 20; i++) {
                fakeElements.push(i)
        }
        return (
                <View style={{ alignItems: "center", padding: 15 }}>
                        {fakeElements.map((fe, i) => <View key={i.toString()} style={{ backgroundColor: '#e8e7e7', padding: 10, width: '100%', borderRadius: 10, flexDirection: 'row', marginTop: i > 0 ? 10 : 0 }}>
                                <Skeleton style={{ width: 60, height: 60, borderRadius: 50, backgroundColor: '#fff' }} />
                                <View style={{ flex: 1, marginLeft: 5 }}>
                                        <Skeleton style={{ flex: 1, height: 40, borderRadius: 2, backgroundColor: '#fff' }} />
                                        <View style={{ width: '100%', justifyContent: 'space-between', flexDirection: 'row', marginTop: 5 }}>
                                                <Skeleton style={{ width: '30%', height: 10, borderRadius: 2, backgroundColor: '#fff' }} />
                                                <Skeleton style={{ width: '30%', height: 10, borderRadius: 2, backgroundColor: '#fff' }} />
                                        </View>
                                </View>
                        </View>)}
                </View>
        )
}
export default function ListesRetardScreen() {
        const monthsRef = useRef()
        const [months] = useState(['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'])
        const [selectedMonth, setSelectedMonth] = useState(moment().get('month'))
        const user = useSelector(userSelector)

        const yearsRef = useRef()
        const [years, setYears] = useState([])
        const [selectedYear, setSelectedYear] = useState(moment().get('year'))

        const [allPresences, setAllPresences] = useState([])
        const [loading, setLoading] = useState(true)
        const [offset, setOffset] = useState(0)
        const LIMIT = 10

        const collaborateurRef = useRef()
        const [loadingCollabo, setLoadingCollabo] = useState(false)
        const [collaborateurs, setCollaborateurs] = useState([])
        const [selectedCollaborateur, setSelectedCollaborateur] = useState([])
        const [search, setSearch] = useState('')
        const onCorporateSelect = (collabo) => {
                collaborateurRef.current.close()
                setSelectedCollaborateur(collabo)
        }

        // const CollaborateursModalize = () => {
        //         return (
        //                 <View style={styles.modalContent}>
        //                         <View style={styles.modalList}>
        //                                 <View style={{ marginHorizontal: 10, marginBottom: 10 }}>
        //                                         <Input value={search} onChangeText={(value) => setSearch(value)} mt={2} placeholder="Recherche" size='lg' py={2} InputLeftElement={
        //                                                 <Icon
        //                                                         as={<AntDesign name="user" size={24} color="black" />}
        //                                                         size={5}
        //                                                         ml="2"
        //                                                         color="muted.400"
        //                                                 />}
        //                                         />
        //                                 </View>
        //                                 {loadingCollabo ? <Skeletons /> :
        //                                         <>
        //                                                 {collaborateurs.map((collabo, index) => {
        //                                                         return <TouchableNativeFeedback onPress={() => onCorporateSelect(collabo)} key={index}>
        //                                                                 <View style={styles.modalItem}>
        //                                                                         {selectedCollaborateur?.IDEmploye == collabo.IDEmploye ? <MaterialCommunityIcons name="radiobox-marked" size={24} color="#007bff" /> :
        //                                                                                 <MaterialCommunityIcons name="radiobox-blank" size={24} color="#777" />}
        //                                                                         <Text numberOfLines={1} style={styles.modalText}>{collabo.Nom} {collabo.Prenom}</Text>
        //                                                                 </View>
        //                                                         </TouchableNativeFeedback>
        //                                                 })}
        //                                         </>
        //                                 }
        //                         </View>
        //                 </View>
        //         )
        // }

        const MonthsModalize = () => {
                const onMonthSelect = (index) => {
                        monthsRef.current.close()
                        setSelectedMonth(index)
                }
                return (
                        <View style={styles.modalContent}>
                                <View style={styles.modalList}>
                                        {months.map((month, index) => {
                                                return <TouchableNativeFeedback onPress={() => onMonthSelect(index)} key={index}>
                                                        <View style={styles.modalItem}>
                                                                {index == selectedMonth ? <MaterialCommunityIcons name="radiobox-marked" size={24} color="#007bff" /> :
                                                                        <MaterialCommunityIcons name="radiobox-blank" size={24} color="#777" />}
                                                                <Text numberOfLines={1} style={styles.modalText}>{month}</Text>
                                                        </View>
                                                </TouchableNativeFeedback>
                                        })}
                                </View>
                        </View>
                )
        }

        const YearsModalize = () => {
                const onYearSelect = (year) => {
                        yearsRef.current.close()
                        setSelectedYear(year)
                }
                return (
                        <View style={styles.modalContent}>
                                <View style={styles.modalList}>
                                        {years.map((year, index) => {
                                                return <TouchableNativeFeedback onPress={() => onYearSelect(year)} key={index}>
                                                        <View style={styles.modalItem}>
                                                                {selectedYear == year ? <MaterialCommunityIcons name="radiobox-marked" size={24} color="#007bff" /> :
                                                                        <MaterialCommunityIcons name="radiobox-blank" size={24} color="#777" />}
                                                                <Text numberOfLines={1} style={styles.modalText}>{year}</Text>
                                                        </View>
                                                </TouchableNativeFeedback>
                                        })}
                                </View>
                        </View>
                )
        }

        useEffect(() => {
                const initYear = 2020
                const currentYear = moment().get('year')
                const years = []
                for (let i = currentYear; i >= initYear; i--) {
                        years.push(i)
                }
                setYears(years)
        }, [])

        const getPresences = async (offset = 0) => {
                try {
                        var url = `/absences/retard/historique?month=${selectedMonth + 1}&year=${selectedYear}&collabo=${selectedCollaborateur.IDEmploye}&limit=${LIMIT}&offset=${offset}&`
                        return await fetchApi(url)
                }
                catch (error) {
                        console.log(error)
                }
        }

        useFocusEffect(useCallback(() => {
                (async () => {
                        try {
                                setOffset(0)
                                const pres = await getPresences(0)
                                setAllPresences(pres)
                        }
                        catch (error) {
                                console.log(error)
                        } finally {
                                setLoading(false)
                        }
                })()
        }, [selectedMonth, selectedYear, selectedCollaborateur]))

        useFocusEffect(useCallback(() => {
                (async () => {
                        try {
                                setLoadingCollabo(true)
                                var url = `/collaborateur/employees`
                                if (search) {
                                        url += `?q=${search}`
                                }
                                const colla = await fetchApi(url)
                                setCollaborateurs(colla)
                        }
                        catch (error) {
                                console.log(error)
                        } finally {
                                setLoadingCollabo(false)
                        }
                })()
        }, [search]))

        useEffect(() => {
                (async () => {
                        if (user) {
                                setSelectedCollaborateur({
                                        IDEmploye: user.collaboId,
                                        Nom: user.fname,
                                        USER_PROFILE_ID: user.USER_PROFILE_ID
                                })
                        }
                })()
        }, [user])



        return (
                <>
                        <View style={styles.container}>
                                <View style={styles.cardPrincipal}>
                                        <View style={styles.header}>
                                                {user.USER_PROFILE_ID == 1 ? <TouchableOpacity onPress={() => collaborateurRef.current.open()} style={styles.openModalize}>
                                                        <Text style={styles.openModalizeLabel} numberOfLines={1}>
                                                                {selectedCollaborateur?.Nom || 'Collaborateurs'}
                                                        </Text>
                                                        <AntDesign style={{ marginLeft: 5 }} name="caretdown" size={16} color="#777" />
                                                </TouchableOpacity> : null}
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <TouchableOpacity onPress={() => monthsRef.current.open()} style={styles.openModalize}>
                                                                <Text style={styles.openModalizeLabel} numberOfLines={1}>
                                                                        {subText(months[selectedMonth], 3, false, '')}
                                                                </Text>
                                                                <AntDesign style={{ marginLeft: 5 }} name="caretdown" size={16} color="#777" />
                                                        </TouchableOpacity>
                                                        <TouchableOpacity onPress={() => yearsRef.current.open()} style={{ ...styles.openModalize, marginLeft: 10 }}>
                                                                <Text style={styles.openModalizeLabel} numberOfLines={1}>
                                                                        {selectedYear}
                                                                </Text>
                                                                <AntDesign style={{ marginLeft: 5 }} name="caretdown" size={16} color="#777" />
                                                        </TouchableOpacity>
                                                </View>
                                        </View>
                                        <ScrollView>
                                                {loading ? <Skeletons /> :
                                                        allPresences.length == 0 ?
                                                                <View style={{ marginHorizontal: 10, marginTop: 10 }}><Text style={styles.textAbsence}>Aucun resultat</Text></View>
                                                                : allPresences.map((presence, index) => {
                                                                        return (
                                                                                <View style={styles.detailsHisto} key={index}>
                                                                                        <View style={styles.cardDetailsData}>
                                                                                                <View style={styles.cardIcon}>
                                                                                                        <AntDesign name="user" size={24} color="black" />
                                                                                                </View>
                                                                                                <View style={styles.cardItem}>
                                                                                                        <Text style={styles.itemName}>{presence?.Nom} {presence?.Prenom}</Text>
                                                                                                        <Text>{moment(new Date(presence.DATE_ACTION)).format('DD/MM/YYYY, HH:mm')}</Text>
                                                                                                </View>
                                                                                        </View>
                                                                                </View>
                                                                        )
                                                                })}
                                        </ScrollView>
                                </View>
                        </View>
                        <Modalize ref={collaborateurRef} >
                                <View style={styles.modalContent}>
                                        <View style={styles.modalList}>
                                                <View style={{ marginHorizontal: 10, marginBottom: 10 }}>
                                                        <Input value={search} onChangeText={(value) => setSearch(value)} mt={2} placeholder="Recherche" size='lg' py={2} InputLeftElement={
                                                                <Icon
                                                                        as={<AntDesign name="user" size={24} color="black" />}
                                                                        size={5}
                                                                        ml="2"
                                                                        color="muted.400"
                                                                />}
                                                        />
                                                </View>
                                                {loadingCollabo ? <Skeletons /> :
                                                        <>
                                                                {collaborateurs.map((collabo, index) => {
                                                                        return <TouchableNativeFeedback onPress={() => onCorporateSelect(collabo)} key={index}>
                                                                                <View style={styles.modalItem}>
                                                                                        {selectedCollaborateur?.IDEmploye == collabo.IDEmploye ? <MaterialCommunityIcons name="radiobox-marked" size={24} color="#007bff" /> :
                                                                                                <MaterialCommunityIcons name="radiobox-blank" size={24} color="#777" />}
                                                                                        <Text numberOfLines={1} style={styles.modalText}>{collabo.Nom} {collabo.Prenom}</Text>
                                                                                </View>
                                                                        </TouchableNativeFeedback>
                                                                })}
                                                        </>
                                                }
                                        </View>
                                </View>
                        </Modalize>
                        <Modalize ref={monthsRef}>
                                <MonthsModalize />
                        </Modalize>
                        <Modalize ref={yearsRef}>
                                <YearsModalize />
                        </Modalize>

                </>
        )
}

const styles = StyleSheet.create({
        container: {
                flex: 1,
                backgroundColor: '#F3F7F7',
        },
        cardPrincipal: {
                // flex: 1
        },
        header: {
                paddingHorizontal: 15,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginVertical: 10
        },
        openModalize: {
                backgroundColor: '#dde1ed',
                padding: 10,
                borderRadius: 5,
                marginTop: 5,
                flexDirection: 'row',
                alignContent: 'center',
                alignItems: 'center',
                justifyContent: 'space-between'
        },
        openModalizeLabel: {
                color: '#555',
                fontSize: 14,
        },
        detailsHisto: {
                paddingHorizontal: 10,
                paddingVertical: 5,
                backgroundColor: '#fff',
                margin: 10,
                marginVertical: 5,
                elevation: 1,
                borderRadius: 10,
                marginHorizontal: 14
        },
        cardIcon: {
                width: 50,
                height: 50,
                backgroundColor: "#dde1ed",
                borderRadius: 50,
                justifyContent: "center",
                alignContent: "center",
                alignItems: "center"
        },
        cardDetailsData: {
                flexDirection: "row",
        },
        cardItem: {
                justifyContent: "center",
                // alignItems: "center",
                alignContent: "center",
                marginLeft: 15
        },
        itemName: {
                fontWeight: "bold"
        },
        modalContent: {
                paddingBottom: 20
        },
        modalItem: {
                paddingVertical: 10,
                paddingHorizontal: 15,
                marginTop: 5,
                flexDirection: 'row',
                alignItems: 'center',
                alignContent: 'center'
        },
        modalText: {
                fontSize: 16,
                fontWeight: 'bold',
                marginLeft: 10
        },
})
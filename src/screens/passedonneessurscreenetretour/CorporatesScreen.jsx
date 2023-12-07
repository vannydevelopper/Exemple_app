import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TextInput, TouchableNativeFeedback, TouchableOpacity, View, AppState } from 'react-native'
import { FontAwesome, Fontisto, EvilIcons, AntDesign, Feather, Ionicons, Entypo, FontAwesome5, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/core';
import fetchApi from '../../helpers/fetchApi';
import { COLORS } from '../../styles/COLORS';
import { useRef } from 'react';
import { Modalize } from 'react-native-modalize';
import ConfirmModal from '../../components/modals/ConfirmModal';
import IDS_COURSE_TYPES from '../../constants/IDS_COURSE_TYPES';
import Loading from '../../components/app/Loading';
import { useDispatch } from 'react-redux';
import { setCourseAction } from '../../store/actions/courseActions';
import wait from '../../helpers/wait';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export const BeneficiairesRender = ({ beneficiaires }) => {
        if (beneficiaires.length == 0) return <Text style={styles.beneficiareValue}>-</Text>
        if (beneficiaires.length == 1) return <Text style={styles.beneficiareValue}>{beneficiaires[0].NOM} {beneficiaires[0].PRENOM}</Text>
        const items = beneficiaires.slice(0, 3)
        return (
                <View style={styles.beneficiaresGroupItems}>
                        {items.map((beneficiaire, index) => {
                                return (
                                        <View style={[styles.beneficiaresGroupItem, { marginLeft: index > 0 ? -10 : 0 }]} key={index}>
                                                <Image source={beneficiaire.IMAGE ? { uri: beneficiaire.IMAGE } : require("../../../assets/images/user.png")} style={styles.beneficiaresGroupItemImage} />
                                        </View>
                                )
                        })}
                        {beneficiaires.length > 3 ? <View style={[styles.beneficiaresGroupItem, { marginLeft: -10, backgroundColor: "#ddd" }]}>
                                <View style={{ width: '80%', height: '80%', justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: 30 }}>
                                        <Text style={{ fontWeight: 'bold', fontSize: 12, color: '#fff' }}>+{beneficiaires.length - 3} nn</Text>
                                </View>
                        </View> : null}
                </View>
        )
}

const LIMIT = 10

export default function CorporatesScreen() {
        const [loading, setLoading] = useState(true)
        const [isInSearch, setIsInSearch] = useState(false)
        const [corporates, setCorporates] = useState([])
        const [q, setQ] = useState('')
        const navigation = useNavigation()
        const route = useRoute()
        const [isLoadingMore, setIsLoadingMore] = useState(false)
        const [offset, setOffset] = useState(0)

        const { type = 'all', selectedCorporate } = route.params || {}

        const [shosenCorporate, setShosenCorporate] = useState(null)
        const [selectedDemandeur, setSlectedDemandeur] = useState(null)

        const [beneficiaireBenef, setBeneficiaireBenef] = useState([])

        useEffect(() => {
                if (selectedCorporate) {
                        setShosenCorporate(selectedCorporate)
                        setSlectedDemandeur(selectedCorporate.selectedDemandeur)
                        setBeneficiaireBenef(selectedCorporate.selectedBeneficiaires)
                }
        }, [selectedCorporate])

        /**
         * Fonction qui s'appelle quand on clique sur le bouton de retour
         * @author Dukizwe Darcy <darcy@mediabox.bi>
         */
        const handleBackPress = useCallback(() => {
                if (isInSearch) {
                        setIsInSearch(false)
                        return false
                }
                navigation.goBack()
        }, [isInSearch])

        /**
         * Fonction qui s'appelle quand on clique sur le bouton de recherche
         * @author Dukizwe Darcy <darcy@mediabox.bi>
         */
        const handleSearchPress = () => {
                setIsInSearch(true)
        }

        /**
         * Permet de declencher un retour quand on on clique sur le pays
         * @author Dukizwe Darcy <darcy@mediabox.bi>
         * @param { Object } country le pays choisi
         */
        const handleCorporatePress = corporate => {
                setShosenCorporate(corporate)
                setSlectedDemandeur(null)
                setBeneficiaireBenef([])
                navigation.navigate('DemandeurSelectedScreen', {
                        shosenCorporate:corporate,
                        selectedUserDemandeur:selectedDemandeur
                    })
                // navigation.navigate("ConfirmHailingScreen", { corporate })
        }

       
        const handleSubmit = () => {
                navigation.navigate("ConfirmHailingScreen", {
                        corporate: {
                                ...shosenCorporate,
                                selectedDemandeur,
                                selectedBeneficiaires: beneficiaireBenef
                        }
                })
        }

        const isCloseToBottom = useCallback(({ layoutMeasurement, contentOffset, contentSize }) => {
                const paddingToBottom = 20;
                return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
        }, []);


        /**
         * Permet de selectionner la liste des beneficiares
         * @author Vanny Boy <vanny@mediabox.bi>
         * @param { Object } 
         */
        
        useEffect(() => {
                const { selectedBeneficiaires, selectedDemandeur } = route.params || {}
                if (selectedBeneficiaires) {
                        setBeneficiaireBenef(selectedBeneficiaires)
                }else if(selectedDemandeur){
                        setSlectedDemandeur(selectedDemandeur)
                }
            }, [route])

        const selectedBenef = () =>{
                navigation.navigate('BeneficiaireSelectedScreen', {
                        shosenCorporate:shosenCorporate,
                        selectedUserBeneficiaire: beneficiaireBenef,
                    })

        }

        /**
         * Permet de selectionner la liste des demandeurs
         * @author Vanny Boy <vanny@mediabox.bi>
         * @param { Object } 
         */

        const selectedUserDemandeur = () =>{
                navigation.navigate('DemandeurSelectedScreen', {
                        shosenCorporate:shosenCorporate,
                        selectedUserDemandeur:selectedDemandeur
                    })
        }

        /**
         * Onlood more des coorporates
         * @author Vanny Boy <vanny@mediabox.bi>
         */
        const loadMore = async () => {
                setIsLoadingMore(true)
                const newOffet = offset + LIMIT
                setOffset(newOffet)
                const ms = await getCoorporate(newOffet)
                setCorporates(om => [...om, ...ms.result])
                setIsLoadingMore(false)
        }

        /**
         * Fonction pour recuperer la liste des coorporates
         * @author Vanny Boy <vanny@mediabox.bi>
         */
        const getCoorporate = useCallback(async (ofs = 0) => {
                try {
                        var url = `/corporate/corp_corporates?offset=${ofs}&limit=${LIMIT}`
                        if (q != '') {
                                url = `/corporate/corp_corporates?q=${q}&`
                        }
                        return await fetchApi(url)
                }
                catch (error) {
                        console.log(error)
                }

        }, [q])

        const fetchCoorporates = async () => {
                try {
                        const res = await getCoorporate()
                        setCorporates(res.result)
                } catch (error) {
                        console.log(error)
                } finally {
                        setLoading(false)
                }
        }

        useFocusEffect(useCallback(() => {
                (async () => {
                        fetchCoorporates()
                })()
        }, [q]))

        return (
                <>
                        <View style={styles.container}>
                                <View style={styles.header}>
                                        <View style={styles.exiitSearch}>
                                                <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple('#C4C4C4', true)} onPress={handleBackPress}>
                                                        <View style={styles.headerBtn}>
                                                                <Ionicons name="arrow-back-outline" size={24} color="#777" />
                                                        </View>
                                                </TouchableNativeFeedback>
                                                {isInSearch ? <TextInput autoFocus style={styles.searchInput} value={q} onChangeText={n => setQ(n)} returnKeyType='search' /> : <Text style={styles.selectIndicator}>
                                                        Choisir le corporate
                                                </Text>}
                                        </View>
                                        {!isInSearch ? <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple('#C4C4C4', true)} onPress={handleSearchPress}>
                                                <View style={styles.headerBtn}>
                                                        <Feather name="search" size={24} color="#777" />
                                                </View>
                                        </TouchableNativeFeedback> : null}
                                </View>
                                {loading ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                        <ActivityIndicator animating size={'large'} color={'#777'} />
                                </View> :
                                        <FlatList
                                                onScroll={({ nativeEvent }) => {
                                                        if (isCloseToBottom(nativeEvent) && !isLoadingMore) {
                                                                loadMore()
                                                        }
                                                }}
                                                data={corporates}
                                                ListFooterComponent={() => <ActivityIndicator animating size={'small'} color={'#000'} style={{ marginVertical: 10, opacity: isLoadingMore ? 1 : 0 }} />}
                                                renderItem={({ item: corporate, index }) => {
                                                        return (
                                                                <TouchableNativeFeedback onPress={() => handleCorporatePress(corporate)}>
                                                                        <View style={{ backgroundColor: shosenCorporate?.ID_CORP_CORPORATE == corporate.ID_CORP_CORPORATE ? '#f1f1f1' : '#fff', borderRadius: 8 }}>
                                                                                <View style={styles.institution}>
                                                                                        <View style={styles.institutionLeftSide}>
                                                                                                <View style={styles.logoContainer}>
                                                                                                        {corporate.ICON ?
                                                                                                                <Image source={{ uri: corporate.ICON }} style={styles.logoInstitution} /> :
                                                                                                                <FontAwesome5 name="building" size={24} color="#000" />
                                                                                                        }
                                                                                                </View>
                                                                                                <View style={styles.institutionDetails}>
                                                                                                        <Text style={styles.institutionName} numberOfLines={1}>
                                                                                                                {corporate.NOM}
                                                                                                        </Text>
                                                                                                        <Text style={styles.institutionAddress} numberOfLines={1}>
                                                                                                                {corporate.EMAIL}
                                                                                                        </Text>
                                                                                                </View>
                                                                                        </View>
                                                                                        {(shosenCorporate && shosenCorporate.ID_CORP_CORPORATE == corporate.ID_CORP_CORPORATE && selectedDemandeur && beneficiaireBenef.length > 0) ? <MaterialCommunityIcons name="radiobox-marked" size={24} color="#007bff" /> :
                                                                                                <MaterialCommunityIcons name="radiobox-blank" size={24} color="#777" />}
                                                                                </View>
                                                                                {shosenCorporate?.ID_CORP_CORPORATE == corporate.ID_CORP_CORPORATE ? <View>
                                                                                        <View style={styles.separator} />
                                                                                        <View style={styles.beneficiaresSection}>
                                                                                                <TouchableOpacity style={styles.beneficiare} 
                                                                                                onPress={selectedUserDemandeur}
                                                                                                >
                                                                                                        <View style={styles.beneficiareIcon}>
                                                                                                                <MaterialIcons name="admin-panel-settings" size={20} color="#777" />
                                                                                                        </View>
                                                                                                        <View style={styles.beneficiareDetail}>
                                                                                                                <Text style={styles.beneficiareLabel}>Demandeur</Text>
                                                                                                                <Text style={styles.beneficiareValue}>{selectedDemandeur ? `${selectedDemandeur.NOM} ${selectedDemandeur.PRENOM ? selectedDemandeur.PRENOM : ''}` : '-'}</Text>
                                                                                                        </View>
                                                                                                </TouchableOpacity>
                                                                                                <TouchableOpacity style={[styles.beneficiare, { marginLeft: 20 }]}
                                                                                                onPress={selectedBenef}
                                                                                                >
                                                                                                        <View style={styles.beneficiareIcon}>
                                                                                                                <MaterialCommunityIcons name="account-group-outline" size={20} color="#777" />
                                                                                                        </View>
                                                                                                        <View style={styles.beneficiareDetail}>
                                                                                                                <Text style={styles.beneficiareLabel}>Bénéficiaires</Text>
                                                                                                                <BeneficiairesRender beneficiaires={beneficiaireBenef} />

                                                                                                        </View>
                                                                                                </TouchableOpacity>
                                                                                        </View>
                                                                                </View> : null}
                                                                        </View>
                                                                </TouchableNativeFeedback>
                                                        )
                                                }}
                                                keyExtractor={(item, index) => index}
                                                keyboardShouldPersistTaps='handled'
                                                style={styles.corporates}
                                        />}
                                <View style={{ padding: 10 }}>
                                        <TouchableNativeFeedback onPress={() => handleSubmit()} disabled={!selectedDemandeur || beneficiaireBenef.length == 0}>
                                                <View style={[styles.submitBtn, { opacity: (!selectedDemandeur || beneficiaireBenef.length == 0) ? 0.5 : 1 }]}>
                                                        <Text style={styles.submitBtnText}>
                                                                Confirmer
                                                        </Text>
                                                </View>
                                        </TouchableNativeFeedback>
                                </View>
                        </View>
                </>
        )
}

const styles = StyleSheet.create({
        container: {
                flex: 1,
                backgroundColor: '#fff'
        },
        header: {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 10
        },
        exiitSearch: {
                flexDirection: "row",
                alignItems: "center",
        },
        headerBtn: {
                padding: 10,
                borderRadius: 20
        },
        searchInput: {
                flex: 1
        },
        selectIndicator: {
                fontSize: 14,
                fontWeight: 'bold',
                opacity: 0.7
                // fontWeight: 'bold'
        },
        corporates: {
                paddingHorizontal: 10
        },
        institution: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 10,
                paddingVertical: 10,
                borderRadius: 8
        },
        institutionLeftSide: {
                flexDirection: 'row',
                alignItems: 'center',
        },
        logoContainer: {
                width: 50,
                height: 50,
                borderRadius: 50,
                backgroundColor: '#fff',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: COLORS.primary
        },
        logoInstitution: {
                width: '95%',
                height: '95%',
                borderRadius: 100,
                resizeMode: 'contain'
        },
        institutionDetails: {
                marginLeft: 10
        },
        institutionName: {
                fontWeight: 'bold',
                opacity: 0.8
        },
        institutionAddress: {
                color: '#777',
                fontSize: 12
        },
        modalHeader: {
                paddingHorizontal: 10,
                paddingVertical: 10,
                backgroundColor: '#fff',
                borderBottomWidth: 0.5,
                borderBottomColor: COLORS.smallBrown,
                elevation: 5,
                shadowColor: '#c4c4c4'
        },
        modalHeaderDetails: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: "space-between",
        },
        modalTitle: {
                fontSize: 17,
                color: '#333',
                fontWeight: 'bold',
                opacity: 0.8
        },
        modalSubTitle: {
                fontSize: 12,
                color: '#777',
        },
        employe: {
                paddingHorizontal: 10,
                paddingVertical: 15,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
        },
        employeImageContainer: {
                width: 50,
                height: 50,
                borderRadius: 40
        },
        employeImage: {
                width: '100%',
                height: '100%',
                borderRadius: 40
        },
        employeDetails: {
                flexDirection: 'row',
                alignItems: 'center'
        },
        employeUsernames: {
                marginLeft: 10
        },
        employeNames: {
                fontWeight: 'bold'
        },
        employeSubNames: {
                fontSize: 12,
                color: '#777',
                marginTop: 2
        },
        separator: {
                height: 1,
                width: '100%',
                backgroundColor: '#ddd',
                marginVertical: 2
        },
        beneficiaresSection: {
                paddingHorizontal: 10,
                flexDirection: 'row',
                paddingBottom: 10
        },
        beneficiare: {
                flexDirection: 'row',
                alignItems: 'center'
        },
        beneficiareDetail: {
                marginLeft: 10
        },
        beneficiareIcon: {
                width: 30,
                height: 30,
                borderRadius: 25,
                backgroundColor: '#fff',
                justifyContent: 'center',
                alignItems: 'center'
        },
        beneficiareLabel: {
                fontSize: 12
        },
        beneficiareValue: {
                fontSize: 12,
                color: '#777'
        },
        submitEmployeBtn: {
                paddingVertical: 5,
                flexDirection: 'row',
                alignItems: 'center'
        },
        submitEmployeBtnText: {
                textAlign: 'center',
                color: COLORS.primary,
                fontWeight: 'bold',
        },
        searchInputContainer: {
                borderRadius: 5,
                borderColor: COLORS.smallBrown,
                borderWidth: 0.5,
                flexDirection: 'row',
                alignItems: 'center',
                paddingLeft: 5,
                marginTop: 5
        },
        searchInput: {
                paddingVertical: 5,
                marginLeft: 5,
                flex: 1
        },
        beneficiaresGroupItems: {
                flexDirection: 'row',
                alignItems: 'center'
        },
        beneficiaresGroupItem: {
                width: 30,
                height: 30,
                borderRadius: 30,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#fff'
        },
        beneficiaresGroupItemImage: {
                width: '80%',
                height: '80%',
                resizeMode: 'cover',
                borderRadius: 30,
        },
        submitBtn: {
                backgroundColor: '#8aa9db',
                borderRadius: 8,
                paddingVertical: 12
        },
        submitBtnText: {
                textAlign: 'center',
                color: '#fff',
                fontWeight: 'bold'
        },
})
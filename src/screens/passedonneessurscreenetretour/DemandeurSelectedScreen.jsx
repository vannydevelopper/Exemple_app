import React, { useCallback, useState } from "react";
import { Text, View, Image, TouchableNativeFeedback, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, FlatList } from "react-native";
import { COLORS } from '../../styles/COLORS';
import { FontAwesome, Fontisto, EvilIcons, AntDesign, Feather, Ionicons, Entypo, FontAwesome5, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import fetchApi from "../../helpers/fetchApi";
import { useEffect } from "react";

const LIMIT = 10
export default function DemandeurSelectedScreen() {
        const route = useRoute()
        const navigation = useNavigation()
        const { shosenCorporate, selectedUserDemandeur } = route.params

        const [qBene, setQbenefi] = useState('')
        const [loadingEmployes, setLoadingEmployes] = useState(false)
        const [demandeurs, setDemandeurs] = useState([])
        const [isLoadingMore, setIsLoadingMore] = useState(false)
        const [beneficiares, setBeneficiaires] = useState([])
        const [selectedDemandeur, setSlectedDemandeur] = useState(null)

        const isCloseToBottom = useCallback(({ layoutMeasurement, contentOffset, contentSize }) => {
                const paddingToBottom = 20;
                return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
        }, []);

        useEffect(() => {
                if (selectedUserDemandeur) {
                        setSlectedDemandeur(selectedUserDemandeur)
                }

        }, [selectedUserDemandeur])

        const handleDemandeurPress = (demandeur) => {
                setSlectedDemandeur(demandeur)
                navigation.navigate("CorporatesScreen", { selectedDemandeur:demandeur })

        }

        /**
        * Onlood more des demandeurs
        * @author Vanny Boy <vanny@mediabox.bi>
        */
        const loadMoreDemandeur = async () => {
                setIsLoadingMore(true)
                const newOffet = offset + LIMIT
                setOffset(newOffet)
                const ms = await getDemandeurs(newOffet)
                setDemandeurs(om => [...om, ...ms.result])
                setIsLoadingMore(false)
        }

        /**
        * Fonction pour recuperer la liste des demandeurs
        * @author Vanny Boy <vanny@mediabox.bi>
        */
        const getDemandeurs = useCallback(async (ofs = 0) => {
                try {
                        var url = `/corporate/corp_corporates/riders/${shosenCorporate.ID_CORP_CORPORATE}?offset=${ofs}&limit=${LIMIT}&`
                        if (qBene != '') {
                                url = `/corporate/corp_corporates/riders/${shosenCorporate.ID_CORP_CORPORATE}?q=${qBene}&?offset=${ofs}&limit=${LIMIT}&`
                        }
                        return await fetchApi(url)
                }
                catch (error) {
                        console.log(error)
                }

        }, [qBene, shosenCorporate])

        const fetchDemandeurs = async () => {
                try {
                        setLoadingEmployes(true)
                        const res = await getDemandeurs()
                        setDemandeurs(res.result.filter(r => r.IS_CHEF == 1))
                        setBeneficiaires(res.result)
                } catch (error) {
                        console.log(error)
                } finally {
                        setLoadingEmployes(false)
                }
        }
        useFocusEffect(useCallback(() => {
                (async () => {
                        fetchDemandeurs()
                })()
        }, [qBene, shosenCorporate]))
        return (
                <View style={styles.container}>
                        <View style={styles.modalHeader}>
                                <View style={styles.modalHeaderDetails}>
                                        <View>
                                                <View style={{ flexDirection: "row" }}>
                                                        <TouchableNativeFeedback onPress={() => navigation.goBack()} background={TouchableNativeFeedback.Ripple('#C4C4C4', true)}>
                                                                <View style={styles.headerBtn}>
                                                                        <Ionicons name="chevron-back" size={24} color="black" />
                                                                </View>
                                                        </TouchableNativeFeedback>
                                                        <View>
                                                                <Text style={styles.modalTitle}>Demandeur de la course</Text>
                                                                <Text style={styles.modalSubTitle}>
                                                                        {shosenCorporate?.NOM}
                                                                </Text>
                                                        </View>
                                                </View>
                                        </View>
                                </View>
                        </View>
                        <View style={styles.searchInputContainer}>
                                <Ionicons name="search-outline" size={24} color="#777" />
                                <TextInput placeholder='Recherche...' value={qBene} onChangeText={n => setQbenefi(n)} style={styles.searchInput} />
                        </View>

                        {loadingEmployes ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <ActivityIndicator animating size={'large'} color={'#777'} />
                        </View> :
                                demandeurs.length == 0 ? <Text style={{ textAlign: 'center', color: '#777', marginVertical: 20 }}>
                                        Aucun employé trouvé
                                </Text> :
                                        <FlatList
                                                onScroll={({ nativeEvent }) => {
                                                        if (isCloseToBottom(nativeEvent) && !isLoadingMore) {
                                                                loadMoreDemandeur()
                                                        }
                                                }}
                                                data={demandeurs}
                                                ListFooterComponent={() => <ActivityIndicator animating size={'small'} color={'#000'} style={{ marginVertical: 10, opacity: isLoadingMore ? 1 : 0 }} />}
                                                renderItem={({ item: employe, index }) => {
                                                        return (
                                                                loadingEmployes ? null : <TouchableNativeFeedback onPress={() => handleDemandeurPress(employe)}>
                                                                        <View style={styles.employe}>
                                                                                <View style={styles.employeDetails}>
                                                                                        <View style={styles.employeImageContainer}>
                                                                                                <Image source={employe.IMAGE ? { uri: employe.IMAGE } : require("../../../assets/images/user.png")} style={styles.employeImage} />
                                                                                        </View>
                                                                                        <View style={styles.employeUsernames}>
                                                                                                <Text numberOfLines={1} style={styles.employeNames}>{employe.NOM} {employe.PRENOM}</Text>
                                                                                                <Text numberOfLines={1} style={styles.employeSubNames}>{employe.TELEPHONE}</Text>
                                                                                        </View>
                                                                                </View>
                                                                                {selectedDemandeur && selectedDemandeur.ID_CORPORATE_CLIENT == employe.ID_CORPORATE_CLIENT ? <MaterialCommunityIcons name="radiobox-marked" size={24} color="#007bff" /> :
                                                                                        <MaterialCommunityIcons name="radiobox-blank" size={24} color="#777" />}
                                                                        </View>
                                                                </TouchableNativeFeedback>
                                                        )
                                                }}
                                                keyExtractor={(item, index) => index}
                                                keyboardShouldPersistTaps='handled'
                                        />}
                </View>
        )
}


const styles = StyleSheet.create({
        container: {
                flex: 1,
                backgroundColor: "#fff"
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
                marginTop: 5,
                marginHorizontal: 10
        },
        searchInput: {
                paddingVertical: 5,
                marginLeft: 5,
                flex: 1
        },
        headerBtn: {
                padding: 10
        },



})
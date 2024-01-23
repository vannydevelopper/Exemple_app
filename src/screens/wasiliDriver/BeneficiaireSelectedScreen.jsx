import React, { useCallback, useState } from "react";
import { Text, View, Image, TouchableNativeFeedback, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, FlatList } from "react-native";
import { COLORS } from '../../styles/COLORS';
import { FontAwesome, Fontisto, EvilIcons, AntDesign, Feather, Ionicons, Entypo, FontAwesome5, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import fetchApi from "../../helpers/fetchApi";
import { useEffect } from "react";
import { useIntl } from "react-intl";
import { useRef } from "react";
import { Host, Portal } from "react-native-portalize";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import NewEmployeModalize from "../../components/app/NewEmployeModalize";
import { Modalize } from "react-native-modalize";
import ErrorModal from "../../components/modals/ErrorModal";
import ConfirmModal from "../../components/modals/ConfirmModal";

const LIMIT = 10



export default function BeneficiaireSelectedScreen() {
        const route = useRoute()
        const modalizeRef = useRef(null)
        const optionmodalRef = useRef(null)
        const navigation = useNavigation()
        const { shosenCorporate: incoshosenCorporate, selectedUserBeneficiaire: incoselectedUserBeneficiaire, updatedData: incoupdatedData, selectedAllNewEmploye } = route.params
        const [shosenCorporate, setShosenCorporate] = useState(incoshosenCorporate)
        const [selectedUserBeneficiaire, setSelectedUserBeneficiaire] = useState(incoselectedUserBeneficiaire)
        const [updatedData, setUpdatedData] = useState(incoupdatedData)
        const [isLoadingMore, setIsLoadingMore] = useState(false)
        const [offset, setOffset] = useState(0)
        const [qBene, setQbenefi] = useState('')
        const [loadingEmployes, setLoadingEmployes] = useState(false)
        const [demandeurs, setDemandeurs] = useState([])
        const [beneficiares, setBeneficiaires] = useState([])
        const [selectedBeneficiaires, setSelectedBeneficiaires] = useState([])
        const [selectedNewEmploye, setSelectedNewEmploye] = useState(selectedAllNewEmploye || [])
        const [showConfirmModal, setShowConfirmModal] = useState(false)
        const [removeSelected, setRemoveSelected] = useState(null)
        const [selectedIndex, setSelectedIndex] = useState(null)
        const [loading, setLoading] = useState(false);
        const [isOpen, setIsOpen] = useState(false)
        const intl = useIntl()

        const ListNewEmployes = () => {
                return (
                        <>
                                {selectedNewEmploye.length == 0 ?null :
                                        <>
                                                {selectedNewEmploye.map((employe, index) => {
                                                        return (
                                                                <TouchableNativeFeedback key={index} onPress={() => onHandleOption(employe, index)}>
                                                                        <View style={styles.employe}>
                                                                                <View style={styles.employeDetails}>
                                                                                        <View style={styles.employeImageContainer}>
                                                                                                <Image source={require("../../../assets/images/user.png")} style={styles.employeImage} />
                                                                                        </View>
                                                                                        <View style={styles.employeUsernames}>
                                                                                                <Text numberOfLines={1} style={styles.employeNames}>{employe?.nom} {employe?.prenom}</Text>
                                                                                                <Text numberOfLines={1} style={styles.employeSubNames}>{employe?.telephone}</Text>
                                                                                        </View>
                                                                                </View>
                                                                                <MaterialIcons style={styles.checkIndicator} name="check-box" size={24} color={COLORS.primary} />
                                                                        </View>
                                                                </TouchableNativeFeedback>
                                                        )
                                                })}
                                                <View style={styles.separator} />

                                        </>
                                }
                        </>
                );
        };

        const isBeneficiaireSelected = idEmploye => selectedBeneficiaires.find(b => b.ID_CORPORATE_CLIENT == idEmploye) ? true : false

        const handleBeneficiairePress = beneficiaire => {
                if (isBeneficiaireSelected(beneficiaire.ID_CORPORATE_CLIENT)) {
                        const newBeneficiaires = selectedBeneficiaires.filter(b => b.ID_CORPORATE_CLIENT != beneficiaire.ID_CORPORATE_CLIENT)
                        setSelectedBeneficiaires(newBeneficiaires)
                } else {
                        setSelectedBeneficiaires(b => [...b, beneficiaire])
                }
        }

        const isCloseToBottom = useCallback(({ layoutMeasurement, contentOffset, contentSize }) => {
                const paddingToBottom = 20;
                return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
        }, []);

        const enregistrement = () => {
                navigation.navigate("CorporatesScreen", { selectedBeneficiaires, selectedNewEmploye: selectedNewEmploye })
        }

        useEffect(() => {
                if (selectedUserBeneficiaire) {
                        setSelectedBeneficiaires(selectedUserBeneficiaire)
                }

        }, [selectedUserBeneficiaire])

        /**
        * Onlood more des beneficiaires
        * @author Vanny Boy <vanny@mediabox.bi>
        */
        const loadMoreBeneficiaire = async () => {
                setIsLoadingMore(true)
                const newOffet = offset + LIMIT
                setOffset(newOffet)
                const ms = await getBeneficiaire(newOffet)
                setBeneficiaires(om => [...om, ...ms.result])
                setIsLoadingMore(false)
        }
        /**
         * Fonction pour recuperer la liste des beneficiares
         * @author Vanny Boy <vanny@mediabox.bi>
         */
        const getBeneficiaire = useCallback(async (ofs = 0) => {
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

        const fetchBeneficiare = async () => {
                try {
                        setLoadingEmployes(true)
                        const res = await getBeneficiaire()
                        setDemandeurs(res.result.filter(r => r.IS_CHEF == 1))
                        setBeneficiaires(res.result)
                } catch (error) {
                        console.log(error)
                } finally {
                        setLoadingEmployes(false)
                }
        }

        const onSelectMethod = (method) => {
                // setSelectedMethod(method)
                setIsOpen(true)
                modalizeRef.current.open()
        }

        useFocusEffect(useCallback(() => {
                (async () => {
                        fetchBeneficiare()
                })()
        }, [qBene, shosenCorporate]))

        const onHandleOption = (amploye, index) => {
                setSelectedIndex(index)
                setRemoveSelected(amploye)
                optionmodalRef.current.open()
        }

        const selctedModifier = () => {
                optionmodalRef.current.close()
                navigation.navigate("NewEmployeeSreen", { employeModifier: removeSelected, shosenCorporate: shosenCorporate, selectedIndex: selectedIndex, selectedNewEmploye:selectedNewEmploye })
        }

        const startTriping = async () => {
                try {
                        setShowConfirmModal(null)
                        setLoading(true)
                        const removed = selectedNewEmploye.filter((em, index) => index != selectedIndex)
                        setSelectedNewEmploye(removed)
                        optionmodalRef.current.close()
                }
                catch (error) {
                        console.log(error)
                } finally {
                        setLoading(false)
                }
        }

        useEffect(() => {
                const params = route.params || {}
                const { updatedData: newUpdatedData } = params
                if(newUpdatedData){
                        setSelectedNewEmploye(newUpdatedData)
                }
      }, [route])

      const getSelectedCount = () => {
               return selectedBeneficiaires.length + selectedNewEmploye.length
      }

        return (
                <>
                        {showConfirmModal && <ConfirmModal
                                handleClose={() => setShowConfirmModal(null)}
                                onClose={() => setShowConfirmModal(null)}
                                onDecline={() => setShowConfirmModal(null)}
                                title= {intl.formatMessage({ id: 'BeneficiaireSelectedScreen.Supprimer' })}
                                body={intl.formatMessage({ id: 'BeneficiaireSelectedScreen.supppersonne' })}
                                exitLabel={intl.formatMessage({ id: 'DriverMapScreen.Non' })}
                                handleTitle={intl.formatMessage({ id: 'DriverMapScreen.oui' })}
                                onConfirm={startTriping}
                        />}

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
                                                                        <Text style={styles.modalTitle}>{intl.formatMessage({ id: 'BeneficiaireSelectedScreen.courseben' })}</Text>
                                                                        <Text style={styles.modalSubTitle}>
                                                                                {shosenCorporate?.NOM} {getSelectedCount() > 0 ? ` - ${getSelectedCount()} ${getSelectedCount() > 1 ? intl.formatMessage({ id: 'BeneficiaireSelectedScreen.selections' }) : intl.formatMessage({ id: 'BeneficiaireSelectedScreen.selection' })} ` : ''}
                                                                        </Text>
                                                                </View>
                                                        </View>
                                                </View>
                                                <TouchableOpacity disabled={(selectedBeneficiaires.length == 0 && selectedNewEmploye?.length == 0 && false)} onPress={enregistrement}>
                                                        <View style={[styles.submitEmployeBtn, { opacity: (selectedBeneficiaires.length == 0 && selectedNewEmploye?.length == 0 && false) ? 0.5 : 1 }]}>
                                                                <Ionicons name="ios-checkmark-circle" size={22} color={COLORS.primary} />
                                                                <Text style={styles.submitEmployeBtnText}>
                                                                        {intl.formatMessage({ id: 'AppContainer.Confirmer' })}
                                                                </Text>
                                                        </View>
                                                </TouchableOpacity>
                                        </View>

                                </View>
                                <View style={styles.searchInputContainer}>
                                        <Ionicons name="search-outline" size={24} color="#777" />
                                        <TextInput
                                                placeholder={intl.formatMessage({ id: 'BeneficiaireSelectedScreen.Recherche...' })}
                                                value={qBene} onChangeText={n => setQbenefi(n)}
                                                style={styles.searchInput}

                                        />
                                        <TouchableOpacity
                                                onPress={() => onSelectMethod()}
                                        >
                                                <View style={styles.cardNew}>
                                                        <AntDesign name="plus" size={20} color="#fff" />
                                                        <View style={{ marginLeft: 5 }}>
                                                                <Text style={{ color: "#fff", fontWeight: 'bold' }}> {intl.formatMessage({ id: 'BeneficiaireSelectedScreen.Nouveau' })}</Text>
                                                        </View>
                                                </View>
                                        </TouchableOpacity>

                                </View>

                                {loadingEmployes ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                        <ActivityIndicator animating size={'large'} color={'#777'} />
                                </View> :
                                        (beneficiares.length == 0 && selectedNewEmploye.length == 0) ? <Text style={{ textAlign: 'center', color: '#777', marginVertical: 20 }}>
                                                {intl.formatMessage({ id: 'DemandeurSelectedScreen.Aucun' })}
                                        </Text> :
                                                <>
                                                        <FlatList
                                                                onScroll={({ nativeEvent }) => {
                                                                        if (isCloseToBottom(nativeEvent) && !isLoadingMore) {
                                                                                loadMoreBeneficiaire()
                                                                        }
                                                                }}
                                                                data={beneficiares}
                                                                ListFooterComponent={() => <ActivityIndicator animating size={'small'} color={'#000'} style={{ marginVertical: 10, opacity: isLoadingMore ? 1 : 0 }} />}
                                                                renderItem={({ item: employe, index }) => {
                                                                        return (
                                                                                loadingEmployes ? null : <TouchableNativeFeedback onPress={() => handleBeneficiairePress(employe)}>
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
                                                                                                {isBeneficiaireSelected(employe.ID_CORPORATE_CLIENT) ? <MaterialIcons style={styles.checkIndicator} name="check-box" size={24} color={COLORS.primary} /> :
                                                                                                        <MaterialIcons style={styles.checkIndicator} name="check-box-outline-blank" size={24} color="#ddd" />}
                                                                                        </View>
                                                                                </TouchableNativeFeedback>
                                                                        )
                                                                }}
                                                                keyExtractor={(item, index) => index}
                                                                ListHeaderComponent={ListNewEmployes}
                                                                keyboardShouldPersistTaps='handled'
                                                        />
                                                </>
                                }
                        </View>
                        <Portal>
                                <GestureHandlerRootView style={{ height: isOpen ? '100%' : 0, opacity: isOpen ? 1 : 0, backgroundColor: 'rgba(0, 0, 0, 0)', position: 'absolute', width: '100%', zIndex: 1 }}>
                                        <Modalize
                                                ref={modalizeRef}
                                                adjustToContentHeight
                                                handlePosition='inside'
                                                withHandle={false}
                                                modalStyle={{
                                                        borderTopRightRadius: 10,
                                                        borderTopLeftRadius: 10,
                                                        paddingVertical: 0
                                                }}
                                                handleStyle={{ marginTop: 10 }}
                                                scrollViewProps={{
                                                        keyboardShouldPersistTaps: "handled"
                                                }}
                                                onClosed={() => {
                                                        setIsOpen(false)
                                                }}
                                        >
                                                <NewEmployeModalize
                                                        modalizeRef={modalizeRef}
                                                        setSelectedNewEmploye={data => {
                                                            setSelectedNewEmploye(dt => [...dt, data])
                                                        }}
                                                        selectedNewEmploye={selectedNewEmploye}
                                                />
                                        </Modalize>
                                </GestureHandlerRootView>
                        </Portal>
                        <Modalize ref={optionmodalRef}
                                handlePosition="inside"
                                adjustToContentHeight
                                modalStyle={{ backgroundColor: '#fff', borderTopLeftRadius: 15, borderTopRightRadius: 15 }}
                                scrollViewProps={{ keyboardShouldPersistTaps: 'handled' }}
                        >
                                <View style={{ ...styles.modalContent }}>
                                        <View>
                                                <TouchableNativeFeedback onPress={() => selctedModifier()} >
                                                        <View style={{ ...styles.reponseItem, borderTopColor: '#f5f2f2' }}>
                                                                <Text numberOfLines={2} style={styles.reponseText}>{intl.formatMessage({ id: 'BeneficiaireSelectedScreen.Modifier' })}</Text>
                                                                <Feather name="edit-2" size={24} color="black" />
                                                        </View>
                                                </TouchableNativeFeedback>
                                                <TouchableNativeFeedback onPress={() => setShowConfirmModal(true)}>
                                                        <View style={{ ...styles.reponseItem, borderTopColor: '#f5f2f2' }}>
                                                                <Text numberOfLines={2} style={styles.reponseText}>{intl.formatMessage({ id: 'BeneficiaireSelectedScreen.modSupprimer' })}</Text>
                                                                <MaterialIcons name="delete" size={24} color="red" />
                                                        </View>
                                                </TouchableNativeFeedback>
                                        </View>
                                </View>

                        </Modalize>
                </>
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
                marginHorizontal: 10,
                paddingVertical: 3
        },
        searchInput: {
                paddingVertical: 5,
                marginLeft: 5,
                flex: 1
        },
        headerBtn: {
                padding: 10
        },
        cardNew: {
                paddingVertical: 8,
                borderRadius: 5,
                backgroundColor: COLORS.primary,
                justifyContent: "center",
                alignContent: "center",
                alignItems: "center",
                flexDirection: "row",
                paddingHorizontal: 10,
                marginRight: 2
        },
        cardPrincipal: {
                marginTop: 4,
                flexDirection: "row",
                justifyContent: "space-between",
                marginHorizontal: 10
        },
        modalContent: {
                width: '100%',
                backgroundColor: '#fff',
                borderRadius: 10,
                overflow: 'hidden',
                paddingVertical: 10
        },
        reponseItem: {
                paddingVertical: 15,
                paddingHorizontal: 15,
                marginTop: 5,
                flexDirection: 'row',
                alignItems: 'center',
                alignContent: 'center',
                justifyContent: "space-between"
        },
        reponseText: {
                marginLeft: 10,
                fontWeight: "bold"
        },
        separator: {
                width: "95%",
                height:1,
                backgroundColor: '#ddd',
                flex:1,
                marginHorizontal:10,
                opacity:0.5   
        },
})
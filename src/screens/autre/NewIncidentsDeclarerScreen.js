import React, { useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View, TouchableNativeFeedback, ScrollView, ActivityIndicator, TouchableWithoutFeedback } from "react-native";
import AppHeader from "../components/app/AppHeader";
import { Feather, MaterialIcons, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { OutlinedTextField } from 'rn-material-ui-textfield'
import { useForm } from "../hooks/useForm";
import { useFormErrorsHandle } from "../hooks/useFormErrorsHandle";
import { COLORS } from "../styles/COLORS"
import { Modalize } from 'react-native-modalize';
import { Portal } from 'react-native-portalize';
import { useRef } from "react";
import { useState } from "react";
import useFetch from "../hooks/useFetch";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Loading from "../components/app/Loading";
import fetchApi from "../helpers/fetchApi";
import moment from 'moment'

/**
 * Le screen pour creer une incidents
 * @author Vanny Boy <vanny@mediabox.bi>
 * @date 1/09/2023
 * @returns 
 */


export default function NewIncidentsDeclarerScreen() {
        const [loadingData, setLoadingData] = useState(false)
        const [loading, setLoading] = useState(false)
        const [typeIncident, setTypeIncident] = useState([])
        const navigation = useNavigation()

        const [data, handleChange, setValue] = useForm({
                description: "",
                newTypes: "",
                newTypesIncident: ""
        })
        const { errors, setError, getErrors, setErrors, checkFieldData, isValidate, getError, hasError } = useFormErrorsHandle(data, {
                description: {
                        required: true,
                }
        }, {
                description: {
                        required: "La description est obligatoire",
                },
        })

        const isValidAdd = () => {
                var isValid = false
                isValid = types != null ? true : false
                return isValid && isValidate()
        }

        // Ordres incidents select
        const typeIncidentModalizeRef = useRef(null);
        const [types, setTypes] = useState(null);
        const openTypeIncidentModalize = () => {
                typeIncidentModalizeRef.current?.open();
        };
        const setSelectedTypeIncident = (type) => {
                typeIncidentModalizeRef.current?.close();
                setTypes(type)
                setTypesOrdres(null)
                setTypesLogiciels(null)
        }

        // Types incidents select
        const typeByOrderModalizeRef = useRef(null);
        const [typesOrdres, setTypesOrdres] = useState(null);
        const openTypeIncidentByOrdreModalize = () => {
                typeByOrderModalizeRef.current?.open();
        };
        const setSelectedTypeIncidentByOrdre = (type) => {
                typeByOrderModalizeRef.current?.close();
                setTypesOrdres(type)
                setTypesLogiciels(null)
        }

        // Types logiciels select
        const typeLogicielModalizeRef = useRef(null);
        const [typesLogiciels, setTypesLogiciels] = useState(null);
        const openTypeLogicielsModalize = () => {
                typeLogicielModalizeRef.current?.open();
        };
        const setSelectedTypeLogiciel = (type) => {
                typeLogicielModalizeRef.current?.close();
                setTypesLogiciels(type)
        }

        //Composent pour afficher les ordres principal d'un incidents
        const TypeIncidentList = () => {
                const [loadingTypes, TypesIncidentsAll] = useFetch('/types/incident/allTypesIncidents')

                return (
                        <>
                                {loadingTypes ? <View style={{ flex: 1, alignContent: 'center', alignItems: 'center', justifyContent: 'center' }} >
                                        <ActivityIndicator animating size={'large'} color={'#777'} />
                                </View > :
                                        <View style={styles.modalContainer}>
                                                <View style={styles.modalHeader}>
                                                        <Text style={styles.modalTitle}>Sélectionner l'ordre</Text>
                                                </View>
                                                {TypesIncidentsAll.result?.length == 0 ? <View style={styles.modalHeader}><Text>Aucun ordre trouvés</Text></View> : null}
                                                <View style={styles.modalList}>
                                                        <TouchableNativeFeedback onPress={() => setSelectedTypeIncident('autre')}>
                                                                <View style={styles.modalItem}>
                                                                        {types == 'autre' ? <MaterialCommunityIcons name="radiobox-marked" size={24} color="#007bff" />:
                                                                                <MaterialCommunityIcons name="radiobox-blank" size={24} color="#777" />}
                                                                        <Text numberOfLines={1} style={styles.modalText}>Autre</Text>
                                                                </View>
                                                        </TouchableNativeFeedback>
                                                        {TypesIncidentsAll.result.map((type, index) => {
                                                                return (
                                                                        <ScrollView key={index}>
                                                                                <TouchableNativeFeedback onPress={() => setSelectedTypeIncident(type)}>
                                                                                        <View style={styles.listItem} >
                                                                                                <View style={styles.listItemDesc}>
                                                                                                        {/* <View style={styles.listItemImageContainer}>
                                                                                                                <FontAwesome5 name="typo3" size={24} color="black" />
                                                                                                        </View> */}
                                                                                                        <View style={styles.listNames}>
                                                                                                                <Text style={styles.itemTitle}>{type.ORDRE_INCIDENT}</Text>
                                                                                                                {/* <Text style={styles.itemTitleDesc}>{chef.EMAIL}</Text> */}
                                                                                                        </View>
                                                                                                </View>
                                                                                                {types?.ID_ORDRE_INCIDENT == type.ID_ORDRE_INCIDENT ? <MaterialCommunityIcons name="radiobox-marked" size={24} color="#007bff" />:
                                                                                                         <MaterialCommunityIcons name="radiobox-blank" size={24} color="#777" />}

                                                                                        </View>
                                                                                </TouchableNativeFeedback>
                                                                        </ScrollView>
                                                                )
                                                        })}
                                                </View>
                                        </View>
                                }
                        </>
                )
        }

        //Composent pour afficher la liste des types d'incidents
        const TypeIncidentByOrdreList = () => {

                return (
                        <>
                                {loading ? <View style={{ flex: 1, alignContent: 'center', alignItems: 'center', justifyContent: 'center' }} >
                                        <ActivityIndicator animating size={'large'} color={'#777'} />
                                </View > :
                                        <View style={styles.modalContainer}>
                                                <View style={styles.modalHeader}>
                                                        <Text style={styles.modalTitle}>Sélectionner le type </Text>
                                                </View>
                                                {typeIncident?.length == 0 ? <View style={styles.modalHeader}><Text>Aucun types trouvés</Text></View> : null}
                                                <View style={styles.modalList}>
                                                        <TouchableNativeFeedback onPress={() => setSelectedTypeIncidentByOrdre('autre')}>
                                                                <View style={styles.modalItem}>
                                                                        {typesOrdres == 'autre' ? <MaterialCommunityIcons name="radiobox-marked" size={24} color="#007bff" /> :
                                                                                <MaterialCommunityIcons name="radiobox-blank" size={24} color="#777" />}
                                                                        <Text numberOfLines={1} style={styles.modalText}>Autre</Text>
                                                                </View>
                                                        </TouchableNativeFeedback>
                                                        {typeIncident.map((type, index) => {
                                                                return (
                                                                        <ScrollView key={index}>
                                                                                <TouchableNativeFeedback onPress={() => setSelectedTypeIncidentByOrdre(type)}>
                                                                                        <View style={styles.listItem} >
                                                                                                <View style={styles.listItemDesc}>
                                                                                                        {/* <View style={styles.listItemImageContainer}>
                                                                                                                <FontAwesome5 name="typo3" size={24} color="black" />
                                                                                                        </View> */}
                                                                                                        <View style={styles.listNames}>
                                                                                                                <Text style={styles.itemTitle}>{type.TYPE_INCIDENT}</Text>
                                                                                                        </View>
                                                                                                </View>
                                                                                                {typesOrdres?.ID_TYPE_INCIDENT == type.ID_TYPE_INCIDENT ? <MaterialCommunityIcons name="radiobox-marked" size={24} color="#007bff" /> :
                                                                                                        <MaterialCommunityIcons name="radiobox-blank" size={24} color="#777" />}

                                                                                        </View>
                                                                                </TouchableNativeFeedback>
                                                                        </ScrollView>
                                                                )
                                                        })}
                                                </View>
                                        </View>
                                }
                        </>
                )
        }

        //Composent pour afficher tous les types de logiciels
        const TypeLogicielsList = () => {
                const [loadingLogiciels, TypesLogiciels] = useFetch('/types/incident/allTypesIncidents/parLogiciel')

                return (
                        <>
                                {loadingLogiciels ? <View style={{ flex: 1, alignContent: 'center', alignItems: 'center', justifyContent: 'center' }} >
                                        <ActivityIndicator animating size={'large'} color={'#777'} />
                                </View > :
                                        <View style={styles.modalContainer}>
                                                <View style={styles.modalHeader}>
                                                        <Text style={styles.modalTitle}>Sélectionner le logiciel</Text>
                                                </View>
                                                {TypesLogiciels.result?.length == 0 ? <View style={styles.modalHeader}><Text>Aucun logiciel trouvés</Text></View> : null}
                                                <View style={styles.modalList}>
                                                        {TypesLogiciels.result.map((type, index) => {
                                                                return (
                                                                        <ScrollView key={index}>
                                                                                <TouchableNativeFeedback onPress={() => setSelectedTypeLogiciel(type)}>
                                                                                        <View style={styles.listItem} >
                                                                                                <View style={styles.listItemDesc}>
                                                                                                        {/* <View style={styles.listItemImageContainer}>
                                                                                                                <FontAwesome5 name="typo3" size={24} color="black" />
                                                                                                        </View> */}
                                                                                                        <View style={styles.listNames}>
                                                                                                                <Text style={styles.itemTitle}>{type.NOM_LOGICIEL}</Text>
                                                                                                        </View>
                                                                                                </View>
                                                                                                {typesLogiciels?.ID_INCIDENT_LOGICIEL == type.ID_INCIDENT_LOGICIEL ?  <MaterialCommunityIcons name="radiobox-marked" size={24} color="#007bff" /> :
                                                                                                        <MaterialCommunityIcons name="radiobox-blank" size={24} color="#777" />}

                                                                                        </View>
                                                                                </TouchableNativeFeedback>
                                                                        </ScrollView>
                                                                )
                                                        })}
                                                </View>
                                        </View>
                                }
                        </>
                )
        }

        const getSelectedTypesLabel = () => {
                if (types?.ORDRE_INCIDENT) {
                        return types?.ORDRE_INCIDENT
                } else if (types == 'autre') {
                        return 'Autre'
                }
                return "Cliquer pour choisir l'ordre"
        }

        const getSelectedTypesByOrdrerLabel = () => {
                if (typesOrdres?.TYPE_INCIDENT) {
                        return typesOrdres?.TYPE_INCIDENT
                } else if (typesOrdres == 'autre') {
                        return 'Autre'
                }
                return 'Cliquer pour choisir le type'
        }

        const submitIncidentData = async () => {
                try {
                        setLoadingData(true)
                        const form = new FormData()
                        if (types?.ID_ORDRE_INCIDENT) {
                                form.append('ID_ORDRE_INCIDENT', types.ID_ORDRE_INCIDENT)
                        }
                        if (typesOrdres?.ID_TYPE_INCIDENT) {
                                form.append('ID_TYPE_INCIDENT', typesOrdres.ID_TYPE_INCIDENT)
                        }
                        if (data.description) {
                                form.append('DESCRIPTION', data.description)
                        }
                        if (typesLogiciels) {
                                form.append('NOM_LOGICIEL', typesLogiciels.ID_INCIDENT_LOGICIEL)
                        }
                        if (types == 'autre') {
                                form.append('Autres', data.newTypes)
                        }
                        if (typesOrdres == 'autre') {
                                form.append('AutresIncident', data.newTypesIncident)
                        }
                        const incide = await fetchApi(`/types/incident/allTypesIncidents/declarer`, {
                                method: "POST",
                                body: form
                        })
                        navigation.goBack()
                }
                catch (error) {
                        console.log(error)
                } finally {
                        setLoadingData(false)
                }
        }

        //fonction pour recuperer les types incidents par raport a l'ordres selectionner
        useFocusEffect(useCallback(() => {
                (async () => {
                        try {
                                if (types) {
                                        setLoading(true)
                                        const res = await fetchApi(`/types/incident/allTypesIncidents/parOrder/${types.ID_ORDRE_INCIDENT}`)
                                        setTypeIncident(res.result)
                                }
                        } catch (error) {
                                console.log(error)
                        } finally {
                                setLoading(false)
                        }
                })()
        }, [types]))




        return (
                <>
                        {loadingData && <Loading />}
                        <View style={styles.container}>
                                <View style={styles.header}>
                                        <TouchableNativeFeedback
                                                onPress={() => navigation.goBack()}
                                                background={TouchableNativeFeedback.Ripple('#c9c5c5', true)}>
                                                <View style={styles.headerBtn}>
                                                        <Ionicons name="chevron-back-outline" size={24} color="black" />
                                                </View>
                                        </TouchableNativeFeedback>
                                        <View style={styles.cardTitle}>
                                                <Text style={styles.title} numberOfLines={2}>Déclarer une incident</Text>
                                        </View>
                                </View>
                                <ScrollView style={styles.inputs}>
                                        <TouchableOpacity style={styles.selectContainer} onPress={openTypeIncidentModalize}>
                                                <View style={styles.labelContainer}>
                                                        <View style={styles.icon}>
                                                                {/* <FontAwesome5 name="typo3" size={20} color="#777" /> */}
                                                        </View>
                                                        <Text style={styles.selectLabel}>
                                                                Type d'incident
                                                        </Text>
                                                </View>
                                                <Text style={styles.selectedValue}>
                                                        {getSelectedTypesLabel()}
                                                </Text>
                                        </TouchableOpacity>
                                        {types == 'autre' && <View style={{ marginVertical: 8 }}>
                                                <OutlinedTextField
                                                        label="Nouveau type d'incident"
                                                        fontSize={14}
                                                        baseColor={COLORS.smallBrown}
                                                        tintColor={COLORS.primary}
                                                        containerStyle={{ borderRadius: 20 }}
                                                        lineWidth={0.25}
                                                        activeLineWidth={0.25}
                                                        errorColor={COLORS.error}
                                                        value={data.newTypes}
                                                        onChangeText={(newValue) => handleChange('newTypes', newValue)}
                                                        onBlur={() => checkFieldData('newTypes')}
                                                        error={hasError('newTypes') ? getError('newTypes') : ''}
                                                        autoCompleteType='off'
                                                        blurOnSubmit={false}
                                                        multiline
                                                />
                                        </View>}
                                        {(types && types?.ID_ORDRE_INCIDENT) ? <TouchableOpacity style={styles.selectContainer} onPress={openTypeIncidentByOrdreModalize}>
                                                <View style={styles.labelContainer}>
                                                        <View style={styles.icon}>
                                                                {/* <FontAwesome5 name="typo3" size={20} color="#777" /> */}
                                                        </View>
                                                        <Text style={styles.selectLabel}>
                                                                Precisez l'incident
                                                        </Text>
                                                </View>
                                                <Text style={styles.selectedValue}>
                                                        {getSelectedTypesByOrdrerLabel()}
                                                </Text>
                                        </TouchableOpacity> : null}
                                        {typesOrdres == 'autre' && <View style={{ marginVertical: 8 }}>
                                                <OutlinedTextField
                                                        label="Nouveau incident"
                                                        fontSize={14}
                                                        baseColor={COLORS.smallBrown}
                                                        tintColor={COLORS.primary}
                                                        containerStyle={{ borderRadius: 20 }}
                                                        lineWidth={0.25}
                                                        activeLineWidth={0.25}
                                                        errorColor={COLORS.error}
                                                        value={data.newTypesIncident}
                                                        onChangeText={(newValue) => handleChange('newTypesIncident', newValue)}
                                                        onBlur={() => checkFieldData('newTypesIncident')}
                                                        error={hasError('newTypesIncident') ? getError('newTypesIncident') : ''}
                                                        autoCompleteType='off'
                                                        blurOnSubmit={false}
                                                        multiline
                                                />
                                        </View>}
                                        {(typesOrdres?.ID_TYPE_INCIDENT == 3) ? <TouchableOpacity style={styles.selectContainer} onPress={openTypeLogicielsModalize}>
                                                <View style={styles.labelContainer}>
                                                        <View style={styles.icon}>
                                                                {/* <FontAwesome5 name="typo3" size={20} color="#777" /> */}
                                                        </View>
                                                        <Text style={styles.selectLabel}>
                                                                Type de logiciel
                                                        </Text>
                                                </View>
                                                <Text style={styles.selectedValue}>
                                                        {typesLogiciels ? `${typesLogiciels.NOM_LOGICIEL}` : "Cliquer pour choisir logiciel"}
                                                </Text>
                                        </TouchableOpacity> : null}
                                        <View style={{ marginVertical: 8 }}>
                                                <OutlinedTextField
                                                        label="Description"
                                                        fontSize={14}
                                                        baseColor={COLORS.smallBrown}
                                                        tintColor={COLORS.primary}
                                                        containerStyle={{ borderRadius: 20 }}
                                                        lineWidth={0.25}
                                                        activeLineWidth={0.25}
                                                        errorColor={COLORS.error}
                                                        value={data.description}
                                                        onChangeText={(newValue) => handleChange('description', newValue)}
                                                        onBlur={() => checkFieldData('description')}
                                                        error={hasError('description') ? getError('description') : ''}
                                                        autoCompleteType='off'
                                                        blurOnSubmit={false}
                                                        multiline
                                                />
                                        </View>
                                </ScrollView>
                                <TouchableWithoutFeedback
                                        disabled={!isValidAdd()}
                                        onPress={submitIncidentData}
                                >
                                        <View style={[styles.button, !isValidAdd() && { opacity: 0.5 }]}>
                                                <Text style={styles.buttonText}>Enregistrer</Text>
                                        </View>
                                </TouchableWithoutFeedback>
                        </View>
                        <Modalize ref={typeIncidentModalizeRef}  >
                                <TypeIncidentList />
                        </Modalize>
                        <Modalize ref={typeByOrderModalizeRef}  >
                                <TypeIncidentByOrdreList />
                        </Modalize>
                        <Modalize ref={typeLogicielModalizeRef}  >
                                <TypeLogicielsList />
                        </Modalize>
                </>
        )
}

const styles = StyleSheet.create({
        container: {
                flex: 1,
                backgroundColor: '#fff'
        },
        inputs: {
                marginHorizontal: 10
        },
        cardTitle: {
                paddingVertical: 8
        },
        titleName: {
                fontWeight: "bold",
                fontSize: 16
        },
        selectContainer: {
                backgroundColor: "#fff",
                padding: 13,
                borderRadius: 5,
                borderWidth: 0.5,
                borderColor: "#ddd",
                marginVertical: 10
        },
        selectedValue: {
                color: '#777',
                marginTop: 2
        },
        labelContainer: {
                flexDirection: 'row',
                alignItems: 'center'
        },
        selectLabel: {
                // marginLeft: 5
        },
        modalHeader: {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 10,
                paddingVertical: 5
        },
        modalTitle: {
                fontWeight: "bold",
                textAlign: "center",
                marginTop: 10,
                fontSize: 16
        },
        listItem: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 10,
                paddingHorizontal: 10
        },
        listItemImageContainer: {
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: '#ddd',
                justifyContent: 'center',
                alignItems: 'center'
        },
        listItemImage: {
                width: '90%',
                height: '90%',
                borderRadius: 10
        },
        listItemDesc: {
                flexDirection: 'row',
                alignItems: 'center'
        },
        listNames: {
                // marginLeft: 10
        },
        listItemTitle: {
                fontWeight: 'bold'
        },
        listItemSubTitle: {
                color: '#777',
                fontSize: 12,
                marginTop: 5
        },
        button: {
                marginTop: 10,
                borderRadius: 8,
                paddingVertical: 14,
                paddingHorizontal: 10,
                backgroundColor: COLORS.primary,
                marginHorizontal: 10,
                marginBottom:5
        },
        buttonText: {
                color: "#fff",
                fontWeight: "bold",
                fontSize: 16,
                textAlign: "center"
        },
        modalItem: {
                paddingVertical: 10,
                paddingHorizontal: 10,
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
        header: {
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10
        },
        headerBtn: {
                padding: 10
        },
        title: {
                paddingHorizontal: 5,
                fontSize: 17,
                fontWeight: 'bold',
                color: '#777',
        },
        cardTitle: {
                maxWidth: "85%"
        },
})
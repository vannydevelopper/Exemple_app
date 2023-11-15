import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TouchableNativeFeedback, ActivityIndicator } from "react-native";
import { Button, Icon, Input, useToast } from 'native-base'
import { primaryColor } from "../styles";
import { useNavigation } from "@react-navigation/native";
import { Portal } from 'react-native-portalize';
import { Modalize } from 'react-native-modalize';
import { AntDesign, MaterialIcons, MaterialCommunityIcons, Feather, EvilIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment'
import { useState } from "react";
import { useRef } from "react";
import useFetch from "../hooks/useFetch";
import Skeletons from "../components/Skeletons";
import fetchApi from "../helpers/fetchApi";
import * as Location from 'expo-location';
import AppHeader from "../components/app/AppHeader";

export default function HomeScreen() {
       const navigation = useNavigation()
       const toast = useToast()
       const typeRef = useRef(null)
       const [typesSelect, setTypesSelect] = useState(null);
       const onTypeSelect = (type) => {
              typeRef.current?.close();
              setTypesSelect(type)
       }


       const circonstanceRef = useRef(null)
       const [circonstanceSelect, setCirconstanceSelect] = useState(null);
       const onCIrconstanceSelect = (circo) => {
              circonstanceRef.current?.close();
              setCirconstanceSelect(circo)
       }

       const paysRef = useRef(null)
       const [paysSelect, setPaysSelect] = useState(null);
       const onPaysSelect = (pay) => {
              paysRef.current?.close();
              setPaysSelect(pay)
       }

       const provinceRef = useRef(null)
       const [provSelect, setProvSelect] = useState(null);
       const onProvSelect = (prov) => {
              provinceRef.current?.close();
              setProvSelect(prov)
              setCommSelect(null)
              setLocaliteSelect(null)
       }

       const communeRef = useRef(null)
       const [commSelect, setCommSelect] = useState(null);
       const onCommSelect = (comm) => {
              communeRef.current?.close();
              setCommSelect(comm)
              setLocaliteSelect(null)
       }

       const localiteRef = useRef(null)
       const [localiteSelect, setLocaliteSelect] = useState(null);
       const onLocaliteSelect = (loc) => {
              localiteRef.current?.close();
              setLocaliteSelect(loc)
       }

       const [autreAdresse, setAutreAdresse] = useState('')
       const [nom, setNom] = useState('')
       const [telephone, setTelephone] = useState('')
       const [search, setSearch] = useState('')
       const [searchProv, setSearchProv] = useState('')
       const [searchTypes, setSearchTypes] = useState('')
       const [description, setDescription] = useState('')
       const [loading, setLoading] = useState(false)
       const [location, setLocation] = useState(null)

       const [loadingCommune, setLoadingCommune] = useState(true)
       const [communes, setCommunes] = useState([])

       const [loadingLocalite, setLoadingLocalite] = useState(true)
       const [localites, setLocalites] = useState([])

       const [loadingPays, setLoadingPays] = useState(true)
       const [pays, setPays] = useState([])

       const [loadingTypes, setLoadingTypes] = useState(true)
       const [types, setTypes] = useState([])

       const [loadingProvinces, setLoadingProvinces] = useState(true)
       const [provinces, setProvinces] = useState([])

       const [loadingCirco, setLoadingCirco] = useState(true)
       const [typeCorconstances, setTypeCorconstances] = useState([])

       useEffect(() => {
              (async () => {
                     try {
                            const comms = await fetchApi(`/declarations/users/typecirconstance`)
                            setTypeCorconstances(comms)
                            setLoadingCirco(false)
                     }
                     catch (error) {
                            console.log(error)
                     }

              })()
       }, [])

       useEffect(() => {
              (async () => {
                     try {
                            var url = `/declarations/users/provinces?`
                            if (searchProv) {
                                   url += `q=${searchProv}`
                            }
                            const res = await fetchApi(url)
                            setProvinces(res)
                            setLoadingProvinces(false)
                     }
                     catch (error) {
                            console.log(error)
                     }

              })()
       }, [searchProv])

       useEffect(() => {
              (async () => {
                     try {
                            var url = `/declarations/users/types?`
                            if (searchTypes) {
                                   url += `q=${searchTypes}`
                            }
                            const res = await fetchApi(url)
                            setTypes(res)
                            setLoadingTypes(false)
                     }
                     catch (error) {
                            console.log(error)
                     }

              })()
       }, [searchTypes])

       useEffect(() => {
              (async () => {
                     try {
                            var url = `/declarations/users/pays?`
                            if (search) {
                                   url += `q=${search}`
                            }
                            const res = await fetchApi(url)
                            setPays(res)
                            setLoadingPays(false)
                     }
                     catch (error) {
                            console.log(error)
                     }

              })()
       }, [search])


       useEffect(() => {
              (async () => {
                     try {
                            if (provSelect) {
                                   const comms = await fetchApi(`/declarations/users/communes/${provSelect.ID_PROVINCE_PAYS}`)
                                   setCommunes(comms.result)
                                   setLoadingCommune(false)
                            }
                     }
                     catch (error) {
                            console.log(error)
                     }

              })()
       }, [provSelect])

       useEffect(() => {
              (async () => {
                     try {
                            if (commSelect) {
                                   const locali = await fetchApi(`/declarations/users/localites/${commSelect.ID_TERRITOIRE}`)
                                   setLocalites(locali.result)
                                   setLoadingLocalite(false)
                            }
                     }
                     catch (error) {
                            console.log(error)
                     }

              })()
       }, [commSelect])

       const isValid = typesSelect && typesSelect != '' && nom != '' && telephone != '' && provSelect && provSelect != '' && commSelect && commSelect != '' && description != '' && autreAdresse != '' && paysSelect && paysSelect != '' && circonstanceSelect && circonstanceSelect != '' && localiteSelect && localiteSelect != null

       useEffect(() => {
              (async () => {
                     let { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
                     if (locationStatus !== 'granted') {
                            console.log('Permission to access location was denied');
                            setLocation(false)
                            return;
                     }
                     var location = await Location.getCurrentPositionAsync({});
                     setLocation(location)
              })()
       }, [])

       const submitData = async () => {
              setLoading(true)
              try {
                     const form = new FormData()
                     if (typesSelect.TYPE_ALERTE_ID) {
                            form.append("TYPE_ALERTE", typesSelect.TYPE_ALERTE_ID)
                     }
                     if (location?.coords?.latitude) {
                            form.append("LALTITUDE", location?.coords?.latitude)
                     }
                     if (location?.coords?.longitude) {
                            form.append("LONGITUDE", location?.coords?.longitude)
                     }
                     if (provSelect.ID_PROVINCE_PAYS) {
                            form.append("PROVINCE_ID", provSelect.ID_PROVINCE_PAYS)
                     }
                     if (commSelect.ID_TERRITOIRE) {
                            form.append("TERITOIRE_OU_VILLE", commSelect.ID_TERRITOIRE)
                     }
                     if (autreAdresse) {
                            form.append("COMMUNE", autreAdresse)
                     }
                     if (localiteSelect.LOCALITE_ID) {
                            form.append("LOCALITE", localiteSelect.LOCALITE_ID)
                     }
                     if (nom) {
                            form.append("NOM_DECLARANT", nom)
                     }
                     if (telephone) {
                            form.append("TELEPHONE", telephone)
                     }
                     if (description) {
                            form.append("DESCRIPTION", description)
                     }
                     if (circonstanceSelect.ID_POSTE_CIRCONSTANCE) {
                            form.append("ID_POSTE_CIRCONSTANCE", circonstanceSelect.ID_POSTE_CIRCONSTANCE)
                     }
                     if (paysSelect.COUNTRY_ID) {
                            form.append("COUNTRY_ID", paysSelect.COUNTRY_ID)
                     }
                     // return console.log(form)

                     const newDeclaration = await fetchApi('/declarations/users/create', {
                            method: 'POST',
                            body: form
                     });
                     setLoading(false)
                     toast.show({
                            title: "Opération effectué avec succès",
                            placement: "bottom",
                            status: 'success',
                            duration: 4000
                     })
                     setNom('')
                     setTelephone('')
                     setDescription('')
                     setAutreAdresse('')
                     setProvSelect(null)
                     setCommSelect(null)
                     setTypesSelect(null)
                     setPaysSelect(null)
                     setLocaliteSelect(null)
                     setCirconstanceSelect(null)
              }
              catch (error) {
                     console.log(error)
                     setLoading(false)
                     toast.show({
                            title: "La déclaration a échoué. réessayer plus tard",
                            placement: "bottom",
                            status: 'error',
                            duration: 4000
                     })
              }
       }

       const CirconstanceModalize = () => {
              return (
                     <View style={styles.modalContent}>
                            <View style={styles.modalList}>
                                   {loadingCirco ?
                                          <View style={{ flex: 1, alignContent: 'center', alignItems: 'center', justifyContent: 'center' }} >
                                                 <ActivityIndicator animating size={'large'} color={'#777'} />
                                          </View > :
                                          <>
                                                 {typeCorconstances?.result?.length == 0 ? <View style={styles.modalHeader}><Text>Aucun resultat</Text></View> : null}
                                                 {typeCorconstances?.result?.map(circo => <TouchableNativeFeedback key={circo.ID_POSTE_CIRCONSTANCE.toString()}>
                                                        <>
                                                               <TouchableNativeFeedback onPress={() => onCIrconstanceSelect(circo)} >
                                                                      <View style={styles.modalItem}>
                                                                             {circonstanceSelect?.ID_POSTE_CIRCONSTANCE == circo?.ID_POSTE_CIRCONSTANCE ? <MaterialCommunityIcons name="radiobox-marked" size={24} color="#007bff" /> :
                                                                                    <MaterialCommunityIcons name="radiobox-blank" size={24} color="#777" />}
                                                                             <Text numberOfLines={1} style={styles.modalText}>{circo.CIRCONSTANCE}</Text>
                                                                      </View>
                                                               </TouchableNativeFeedback>
                                                        </>
                                                 </TouchableNativeFeedback>)}
                                          </>
                                   }
                            </View>
                     </View>
              )
       }

       const CommunesModalize = () => {
              return (
                     <View style={styles.modalContent}>
                            <View style={styles.modalList}>
                                   {loadingCommune ?
                                          <View style={{ flex: 1, alignContent: 'center', alignItems: 'center', justifyContent: 'center' }} >
                                                 <ActivityIndicator animating size={'large'} color={'#777'} />
                                          </View > :
                                          <>
                                                 {communes?.length == 0 ? <View style={styles.modalHeader}><Text>Aucun resultat</Text></View> : null}
                                                 {communes?.map((comm, index) => {
                                                        return (
                                                               <ScrollView key={index}>
                                                                      <TouchableNativeFeedback onPress={() => onCommSelect(comm)} >
                                                                             <View style={styles.modalItem}>
                                                                                    {commSelect?.ID_TERRITOIRE == comm?.ID_TERRITOIRE ? <MaterialCommunityIcons name="radiobox-marked" size={24} color="#007bff" /> :
                                                                                           <MaterialCommunityIcons name="radiobox-blank" size={24} color="#777" />}
                                                                                    <Text numberOfLines={1} style={styles.modalText}>{comm.NOM_TERRITOIRE}</Text>
                                                                             </View>
                                                                      </TouchableNativeFeedback>
                                                               </ScrollView>
                                                        )
                                                 })}
                                          </>
                                   }
                            </View>
                     </View >
              )
       }
       const LocaliteModalize = () => {
              return (
                     <View style={styles.modalContent}>
                            <View style={styles.modalList}>
                                   {loadingLocalite ? <View style={{ flex: 1, alignContent: 'center', alignItems: 'center', justifyContent: 'center' }} >
                                          <ActivityIndicator animating size={'large'} color={'#777'} />
                                   </View > :
                                          <>
                                                 {localites?.length == 0 ? <View style={styles.modalHeader}><Text>Aucun resultat</Text></View> : null}
                                                 {localites?.map((loc, index) => {
                                                        return (
                                                               <ScrollView key={index}>
                                                                      <TouchableNativeFeedback onPress={() => onLocaliteSelect(loc)} >
                                                                             <View style={styles.modalItem}>
                                                                                    {commSelect?.LOCALITE_ID == loc?.LOCALITE_ID ? <MaterialCommunityIcons name="radiobox-marked" size={24} color="#007bff" /> :
                                                                                           <MaterialCommunityIcons name="radiobox-blank" size={24} color="#777" />}
                                                                                    <Text numberOfLines={1} style={styles.modalText}>{loc.LOCALITE_NOM}</Text>
                                                                             </View>
                                                                      </TouchableNativeFeedback>
                                                               </ScrollView>
                                                        )
                                                 })}
                                          </>
                                   }
                            </View>
                     </View >
              )
       }

       return (
              <>
                     <AppHeader title={'Formulaire de déclaration'} />
                     <View style={styles.container}>
                            <ScrollView keyboardShouldPersistTaps="always" style={{ paddingHorizontal: 20 }}>
                                   <View style={styles.cardInput}>
                                          <Input value={nom} onChangeText={(value) => setNom(value)} mt={2} placeholder="Déclarant" size='lg' py={2}
                                          />
                                   </View>
                                   <View style={styles.cardInput}>
                                          <Input value={telephone} onChangeText={(value) => setTelephone(value)} mt={2} placeholder="Téléphone" size='lg' py={2}
                                          />
                                   </View>
                                   <View style={styles.formGroup}>
                                          <Text style={styles.title}>
                                                 Type d'alerte
                                          </Text>
                                          <TouchableOpacity style={styles.openModalize} onPress={() => typeRef.current.open()}>
                                                 <Text style={styles.openModalizeLabel} numberOfLines={1}>
                                                        {typesSelect ? typesSelect?.DESCRIPTION : 'Sélectionner le type'}
                                                 </Text>
                                                 <AntDesign name="caretdown" size={16} color="#777" />
                                          </TouchableOpacity>
                                   </View>
                                   <View style={styles.formGroup}>
                                          <Text style={styles.title}>
                                                 Type circonstance
                                          </Text>
                                          <TouchableOpacity style={styles.openModalize} onPress={() => circonstanceRef.current.open()}>
                                                 <Text style={styles.openModalizeLabel} numberOfLines={1}>
                                                        {circonstanceSelect ? circonstanceSelect?.CIRCONSTANCE : 'Sélectionner le type circonstance'}
                                                 </Text>
                                                 <AntDesign name="caretdown" size={16} color="#777" />
                                          </TouchableOpacity>
                                   </View>
                                   <View style={styles.formGroup}>
                                          <Text style={styles.title}>
                                                 Pays
                                          </Text>
                                          <TouchableOpacity onPress={() => paysRef.current.open()} style={styles.openModalize} >
                                                 <Text style={styles.openModalizeLabel} numberOfLines={1}>
                                                        {paysSelect ? paysSelect?.CommonName : 'Sélectionner un pays'}
                                                 </Text>
                                                 <AntDesign name="caretdown" size={16} color="#777" />
                                          </TouchableOpacity>
                                   </View>
                                   <View style={styles.formGroup}>
                                          <Text style={styles.title}>
                                                 Province
                                          </Text>
                                          <TouchableOpacity onPress={() => provinceRef.current.open()} style={styles.openModalize} >
                                                 <Text style={styles.openModalizeLabel} numberOfLines={1}>
                                                        {provSelect ? provSelect?.PROVINCE_NAME : 'Sélectionner une province'}
                                                 </Text>
                                                 <AntDesign name="caretdown" size={16} color="#777" />
                                          </TouchableOpacity>
                                   </View>
                                   {provSelect ? <View style={styles.formGroup}>
                                          <Text style={styles.title}>
                                                 Ville / Territoire
                                          </Text>
                                          <TouchableOpacity onPress={() => communeRef.current.open()} style={styles.openModalize} >
                                                 <Text style={styles.openModalizeLabel} numberOfLines={1}>
                                                        {commSelect ? commSelect?.NOM_TERRITOIRE : 'Sélectionner une ville'}
                                                 </Text>
                                                 <AntDesign name="caretdown" size={16} color="#777" />
                                          </TouchableOpacity>
                                   </View> : null}
                                   {commSelect ? <View style={styles.formGroup}>
                                          <Text style={styles.title}>
                                                 Localite
                                          </Text>
                                          <TouchableOpacity onPress={() => localiteRef.current.open()} style={styles.openModalize} >
                                                 <Text style={styles.openModalizeLabel} numberOfLines={1}>
                                                        {localiteSelect ? localiteSelect?.LOCALITE_NOM : 'Sélectionner la localite'}
                                                 </Text>
                                                 <AntDesign name="caretdown" size={16} color="#777" />
                                          </TouchableOpacity>
                                   </View> : null}
                                   <View style={styles.cardInput}>
                                          <Input value={autreAdresse} onChangeText={(value) => setAutreAdresse(value)} mt={2} placeholder="Autre adresse" size='lg' py={2}
                                          />
                                   </View>

                                   <Input multiline value={description} onChangeText={(value) => setDescription(value)} mt={2} placeholder="Description" size='lg' py={7}
                                   />
                            </ScrollView>
                            <View style={{ marginHorizontal: 20 }}>
                                   <Button
                                          borderRadius={15}
                                          isDisabled={!isValid}
                                          isLoading={loading}
                                          onPress={submitData}
                                          mt={5}
                                          backgroundColor={primaryColor}
                                          py={3.5}
                                          _text={{ color: '#fff', fontWeight: 'bold' }}
                                   >
                                          Enregistrer
                                   </Button>
                            </View>
                     </View>
                     <Modalize ref={typeRef} adjustToContentHeight handleStyle={{ display: 'none' }} modalStyle={{ borderTopRightRadius: 20, borderTopLeftRadius: 20 }}>
                            <View style={styles.modalContent}>
                                   <View style={styles.modalList}>
                                          {loadingTypes ?
                                                 <View style={{ flex: 1, alignContent: 'center', alignItems: 'center', justifyContent: 'center' }} >
                                                        <ActivityIndicator animating size={'large'} color={'#777'} />
                                                 </View >
                                                 :
                                                 <>
                                                        <View style={{ marginHorizontal: 10, marginBottom: 10 }}>
                                                               <Input value={searchTypes} onChangeText={(value) => setSearchTypes(value)} mt={2} placeholder="Recherche" size='lg' py={2} InputLeftElement={
                                                                      <Icon
                                                                             as={<EvilIcons name="search" size={24} color="black" />}
                                                                             size={5}
                                                                             ml="2"
                                                                             color="muted.400"
                                                                      />}
                                                               />
                                                        </View>
                                                        {types?.result?.length == 0 ? <View style={styles.modalHeader}><Text>Aucun resultat</Text></View> : null}
                                                        {types?.result?.map(type => <TouchableNativeFeedback key={type.TYPE_ALERTE_ID.toString()}>
                                                               <>
                                                                      <TouchableNativeFeedback onPress={() => onTypeSelect(type)} >
                                                                             <View style={styles.modalItem}>
                                                                                    {typesSelect?.TYPE_ALERTE_ID == type?.TYPE_ALERTE_ID ? <MaterialCommunityIcons name="radiobox-marked" size={24} color="#007bff" /> :
                                                                                           <MaterialCommunityIcons name="radiobox-blank" size={24} color="#777" />}
                                                                                    <Text numberOfLines={1} style={styles.modalText}>{type.DESCRIPTION}</Text>
                                                                             </View>
                                                                      </TouchableNativeFeedback>
                                                               </>
                                                        </TouchableNativeFeedback>)}
                                                 </>
                                          }
                                   </View>
                            </View>
                     </Modalize>
                     <Modalize ref={circonstanceRef} adjustToContentHeight handleStyle={{ display: 'none' }} modalStyle={{ borderTopRightRadius: 20, borderTopLeftRadius: 20 }}>
                            <CirconstanceModalize />
                     </Modalize>
                     <Modalize ref={paysRef} >
                            <View style={styles.modalContent}>
                                   <View style={styles.modalList}>
                                          {loadingPays ?
                                                 <View style={{ flex: 1, alignContent: 'center', alignItems: 'center', justifyContent: 'center' }} >
                                                        <ActivityIndicator animating size={'large'} color={'#777'} />
                                                 </View >
                                                 :
                                                 <>
                                                        <View style={{ marginHorizontal: 10, marginBottom: 10 }}>
                                                               <Input value={search} onChangeText={(value) => setSearch(value)} mt={2} placeholder="Recherche" size='lg' py={2} InputLeftElement={
                                                                      <Icon
                                                                             as={<EvilIcons name="search" size={24} color="black" />}
                                                                             size={5}
                                                                             ml="2"
                                                                             color="muted.400"
                                                                      />}
                                                               />
                                                        </View>
                                                        {pays?.result?.length == 0 ? <View style={styles.modalHeader}><Text>Aucun resultat</Text></View> : null}
                                                        {pays?.result?.map(pay => <TouchableNativeFeedback key={pay.COUNTRY_ID.toString()}>
                                                               <>
                                                                      <TouchableNativeFeedback onPress={() => onPaysSelect(pay)} >
                                                                             <View style={styles.modalItem}>
                                                                                    {paysSelect?.COUNTRY_ID == pay?.COUNTRY_ID ? <MaterialCommunityIcons name="radiobox-marked" size={24} color="#007bff" /> :
                                                                                           <MaterialCommunityIcons name="radiobox-blank" size={24} color="#777" />}
                                                                                    <Text numberOfLines={1} style={styles.modalText}>{pay.CommonName}</Text>
                                                                             </View>
                                                                      </TouchableNativeFeedback>
                                                               </>
                                                        </TouchableNativeFeedback>)}
                                                 </>
                                          }
                                   </View>
                            </View>

                     </Modalize>
                     <Modalize ref={provinceRef} >
                            <View style={styles.modalContent}>
                                   <View style={styles.modalList}>
                                          {loadingProvinces ?
                                                 <View style={{ flex: 1, alignContent: 'center', alignItems: 'center', justifyContent: 'center' }} >
                                                        <ActivityIndicator animating size={'large'} color={'#777'} />
                                                 </View > :
                                                 <>
                                                        <View style={{ marginHorizontal: 10, marginBottom: 10 }}>
                                                               <Input value={searchProv} onChangeText={(value) => setSearchProv(value)} mt={2} placeholder="Recherche" size='lg' py={2} InputLeftElement={
                                                                      <Icon
                                                                             as={<EvilIcons name="search" size={24} color="black" />}
                                                                             size={5}
                                                                             ml="2"
                                                                             color="muted.400"
                                                                      />}
                                                               />
                                                        </View>
                                                        {provinces?.result?.length == 0 ? <View style={styles.modalHeader}><Text>Aucun resultat</Text></View> : null}
                                                        {provinces?.result?.map((prov, index) => {
                                                               return (
                                                                      <ScrollView key={index}>
                                                                             <TouchableNativeFeedback onPress={() => onProvSelect(prov)} >
                                                                                    <View style={styles.modalItem}>
                                                                                           {provSelect?.ID_PROVINCE_PAYS == prov?.ID_PROVINCE_PAYS ? <MaterialCommunityIcons name="radiobox-marked" size={24} color="#007bff" /> :
                                                                                                  <MaterialCommunityIcons name="radiobox-blank" size={24} color="#777" />}
                                                                                           <Text numberOfLines={1} style={styles.modalText}>{prov.PROVINCE_NAME}</Text>
                                                                                    </View>
                                                                             </TouchableNativeFeedback>
                                                                      </ScrollView>
                                                               )
                                                        })}
                                                 </>
                                          }
                                   </View>
                            </View >
                     </Modalize>
                     <Modalize ref={communeRef} adjustToContentHeight handleStyle={{ display: 'none' }} modalStyle={{ borderTopRightRadius: 20, borderTopLeftRadius: 20 }}>
                            <CommunesModalize />
                     </Modalize>
                     <Modalize ref={localiteRef} adjustToContentHeight handleStyle={{ display: 'none' }} modalStyle={{ borderTopRightRadius: 20, borderTopLeftRadius: 20 }}>
                            <LocaliteModalize />
                     </Modalize>
              </>
       )
}

const styles = StyleSheet.create({
       container: {
              flex: 1,
              backgroundColor: '#fff',
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
       title: {
              color: '#777',
              fontWeight: 'bold',
              fontSize: 16,
              marginVertical: 10,
              marginTop: 30
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
       cardInput: {
              marginTop: 10
       },
       modalHeader: {
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 10,
              paddingVertical: 5
       },

})
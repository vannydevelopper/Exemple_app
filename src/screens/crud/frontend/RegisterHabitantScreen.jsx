import { useNavigation, useRoute } from '@react-navigation/native'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Animated, BackHandler, Image, ScrollView, StyleSheet, Text, TextInput, TouchableNativeFeedback, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import Header from '../../components/Header'
import { OutlinedTextField } from 'rn-material-ui-textfield'
import { useForm } from '../../hooks/useForm'
import { useFormErrorsHandle } from '../../hooks/useFormErrorsHandle'
import { useIntl } from 'react-intl'
import * as ImagePicker from 'expo-image-picker';
import { launchCamera } from 'react-native-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator'
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment'
import { Ionicons, MaterialCommunityIcons, MaterialIcons, Feather, AntDesign, FontAwesome5, EvilIcons } from '@expo/vector-icons';
import { Portal } from 'react-native-portalize'
import useFetch from '../../hooks/useFetch'
import fetchApi from '../../helpers/fetchApi'
import { Modalize } from 'react-native-modalize'
import Loading from '../../components/app/Loading'
import { useToast } from 'native-base'

const ProvinceModal = ({ selectedProvince, onProvinceSelect, onClose }) => {
          const [scale] = useState(new Animated.Value(1.1))
          const intl = useIntl()
          const [loading, provinces] = useFetch('/syst/provinces')

          useEffect(() => {
                    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
                              onClose()
                              return true
                    })
                    Animated.spring(scale, {
                              toValue: 1,
                              useNativeDriver: true
                    }).start()
                    return () => {
                              backHandler.remove()
                    }
          }, [])
          return (
                    <Portal>
                              <TouchableWithoutFeedback onPress={onClose}>
                                        <View style={styles.modalContainer}>
                                                  {loading ? <ActivityIndicator animating size="large" color={"#fff"} /> :
                                                            <TouchableWithoutFeedback>
                                                                      <Animated.View style={{ ...styles.modalContent, transform: [{ scale }] }}>
                                                                                <View style={{ borderBottomWidth: 0, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#071E43' }}>
                                                                                          <Text style={{ fontWeight: 'bold', color: '#fff', opacity: 0.8, textAlign: 'center' }}>
                                                                                                    {intl.formatMessage({id: "NewAffectationScreen.selectProvince"})}
                                                                                          </Text>
                                                                                </View>
                                                                                <ScrollView keyboardShouldPersistTaps='always'>
                                                                                          <View style={styles.modalList}>
                                                                                                    {provinces.map((province, index) => {
                                                                                                              return <TouchableNativeFeedback onPress={() => onProvinceSelect(province)} key={index}>
                                                                                                                        <View style={styles.modalItem}>
                                                                                                                                  {selectedProvince?.PROVINCE_ID == province.PROVINCE_ID ? <MaterialCommunityIcons name="radiobox-marked" size={24} color="#007bff" /> :
                                                                                                                                            <MaterialCommunityIcons name="radiobox-blank" size={24} color="#777" />}
                                                                                                                                  <Text numberOfLines={1} style={styles.modalText}>{province.PROVINCE_NAME}</Text>
                                                                                                                        </View>
                                                                                                              </TouchableNativeFeedback>
                                                                                                    })}
                                                                                          </View>
                                                                                </ScrollView>
                                                                      </Animated.View>
                                                            </TouchableWithoutFeedback>}
                                        </View>
                              </TouchableWithoutFeedback>
                    </Portal>
          )
}

const CommunesModal = ({ selectedCommune, selectedProvince, onCommuneSelect, onClose }) => {
          const [scale] = useState(new Animated.Value(1.1))
          const intl = useIntl()
          const [loading, setLoading] = useState(true)
          const [communes, setCommunes] = useState([])

          useEffect(() => {
                    (async () => {
                              const comms = await fetchApi(`/syst/communes/${selectedProvince.PROVINCE_ID}`)
                              setCommunes(comms)
                              setLoading(false)
                    })()
          }, [selectedProvince])

          useEffect(() => {
                    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
                              onClose()
                              return true
                    })
                    Animated.spring(scale, {
                              toValue: 1,
                              useNativeDriver: true
                    }).start()
                    return () => {
                              backHandler.remove()
                    }
          }, [])
          return (
                    <Portal>
                              <TouchableWithoutFeedback onPress={onClose}>
                                        <View style={styles.modalContainer}>
                                                  {loading ? <ActivityIndicator animating size="large" color={"#fff"} /> :
                                                            <TouchableWithoutFeedback>
                                                                      <Animated.View style={{ ...styles.modalContent, transform: [{ scale }] }}>
                                                                                <View style={{ borderBottomWidth: 0, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#071E43' }}>
                                                                                          <Text style={{ fontWeight: 'bold', color: '#fff', opacity: 0.8, textAlign: 'center' }}>
                                                                                                    { intl.formatMessage({id: "NewAffectationScreen.selectCommune"}) }
                                                                                          </Text>
                                                                                </View>
                                                                                <ScrollView keyboardShouldPersistTaps='always'>
                                                                                          <View style={styles.modalList}>
                                                                                                    {communes.map((commune, index) => {
                                                                                                              return <TouchableNativeFeedback onPress={() => onCommuneSelect(commune)} key={index}>
                                                                                                                        <View style={styles.modalItem}>
                                                                                                                                  {selectedCommune?.COMMUNE_ID == commune.COMMUNE_ID ? <MaterialCommunityIcons name="radiobox-marked" size={24} color="#007bff" /> :
                                                                                                                                            <MaterialCommunityIcons name="radiobox-blank" size={24} color="#777" />}
                                                                                                                                  <Text numberOfLines={1} style={styles.modalText}>{commune.COMMUNE_NAME}</Text>
                                                                                                                        </View>
                                                                                                              </TouchableNativeFeedback>
                                                                                                    })}
                                                                                          </View>
                                                                                </ScrollView>
                                                                      </Animated.View>
                                                            </TouchableWithoutFeedback>}
                                        </View>
                              </TouchableWithoutFeedback>
                    </Portal>
          )
}

const ZonesModal = ({ selectedZone, selectedCommune, onZoneSelect, onClose }) => {
          const [scale] = useState(new Animated.Value(1.1))
          const intl = useIntl()
          const [loading, setLoading] = useState(true)
          const [zones, setZones] = useState([])
          useEffect(() => {
                    (async () => {
                              const zones = await fetchApi(`/syst/zones/${selectedCommune.COMMUNE_ID}`)
                              setZones(zones)
                              setLoading(false)
                    })()
          }, [selectedCommune])

          useEffect(() => {
                    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
                              onClose()
                              return true
                    })
                    Animated.spring(scale, {
                              toValue: 1,
                              useNativeDriver: true
                    }).start()
                    return () => {
                              backHandler.remove()
                    }
          }, [])
          return (
                    <Portal>
                              <TouchableWithoutFeedback onPress={onClose}>
                                        <View style={styles.modalContainer}>
                                                  {loading ? <ActivityIndicator animating size="large" color={"#fff"} /> :
                                                            <TouchableWithoutFeedback>
                                                                      <Animated.View style={{ ...styles.modalContent, transform: [{ scale }] }}>
                                                                                <View style={{ borderBottomWidth: 0, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#071E43' }}>
                                                                                          <Text style={{ fontWeight: 'bold', color: '#fff', opacity: 0.8, textAlign: 'center' }}>
                                                                                                   { intl.formatMessage({id: "NewAffectationScreen.selectZone"}) }
                                                                                          </Text>
                                                                                </View>
                                                                                <ScrollView keyboardShouldPersistTaps='always'>
                                                                                          <View style={styles.modalList}>
                                                                                                    {zones.map((zone, index) => {
                                                                                                              return <TouchableNativeFeedback onPress={() => onZoneSelect(zone)} key={index}>
                                                                                                                        <View style={styles.modalItem}>
                                                                                                                                  {selectedZone?.ZONE_ID == zone.ZONE_ID ? <MaterialCommunityIcons name="radiobox-marked" size={24} color="#007bff" /> :
                                                                                                                                            <MaterialCommunityIcons name="radiobox-blank" size={24} color="#777" />}
                                                                                                                                  <Text numberOfLines={1} style={styles.modalText}>{zone.ZONE_NAME}</Text>
                                                                                                                        </View>
                                                                                                              </TouchableNativeFeedback>
                                                                                                    })}
                                                                                          </View>
                                                                                </ScrollView>
                                                                      </Animated.View>
                                                            </TouchableWithoutFeedback>}
                                        </View>
                              </TouchableWithoutFeedback>
                    </Portal>
          )
}

const CollinesModal = ({ selectedZone, selectedColline, onCollineSelect, onClose }) => {
          const [scale] = useState(new Animated.Value(1.1))
          const intl = useIntl()
          const [loading, setLoading] = useState(true)
          const [collines, setCollines] = useState([])
          useEffect(() => {
                    (async () => {
                              const colls = await fetchApi(`/syst/collines/${selectedZone.ZONE_ID}`)
                              setCollines(colls)
                              setLoading(false)
                    })()
          }, [selectedZone])

          useEffect(() => {
                    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
                              onClose()
                              return true
                    })
                    Animated.spring(scale, {
                              toValue: 1,
                              useNativeDriver: true
                    }).start()
                    return () => {
                              backHandler.remove()
                    }
          }, [])
          return (
                    <Portal>
                              <TouchableWithoutFeedback onPress={onClose}>
                                        <View style={styles.modalContainer}>
                                                  {loading ? <ActivityIndicator animating size="large" color={"#fff"} /> :
                                                            <TouchableWithoutFeedback>
                                                                      <Animated.View style={{ ...styles.modalContent, transform: [{ scale }] }}>
                                                                                <View style={{ borderBottomWidth: 0, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#071E43' }}>
                                                                                          <Text style={{ fontWeight: 'bold', color: '#fff', opacity: 0.8, textAlign: 'center' }}>
                                                                                                    { intl.formatMessage({id: "NewAffectationScreen.selectColline"}) }
                                                                                          </Text>
                                                                                </View>
                                                                                <ScrollView keyboardShouldPersistTaps='always'>
                                                                                          <View style={styles.modalList}>
                                                                                                    {collines.map((colline, index) => {
                                                                                                              return <TouchableNativeFeedback onPress={() => onCollineSelect(colline)} key={index}>
                                                                                                                        <View style={styles.modalItem}>
                                                                                                                                  {selectedColline?.COLLINE_ID == colline.COLLINE_ID ? <MaterialCommunityIcons name="radiobox-marked" size={24} color="#007bff" /> :
                                                                                                                                            <MaterialCommunityIcons name="radiobox-blank" size={24} color="#777" />}
                                                                                                                                  <Text numberOfLines={1} style={styles.modalText}>{colline.COLLINE_NAME}</Text>
                                                                                                                        </View>
                                                                                                              </TouchableNativeFeedback>
                                                                                                    })}
                                                                                          </View>
                                                                                </ScrollView>
                                                                      </Animated.View>
                                                            </TouchableWithoutFeedback>}
                                        </View>
                              </TouchableWithoutFeedback>
                    </Portal>
          )
}

// const CivilModalize = ({ civilModalizeRef, civils, onCivilSelect, selectedCivil }) => {
//           return (
//                     <Modalize ref={civilModalizeRef} adjustToContentHeight handlePosition='inside' handleStyle={{ marginVertical: 10}}>
//                               <View style={{ marginTop: 20 }}>
//                                         {civils.map((civil, index) => {
//                                                   return <TouchableNativeFeedback onPress={() => onCivilSelect(civil)} key={index}>
//                                                             <View style={styles.modalItem}>
//                                                                       {selectedCivil?.ID_ETAT_CIVIL == civil.ID_ETAT_CIVIL ? <MaterialCommunityIcons name="radiobox-marked" size={24} color="#007bff" /> :
//                                                                                 <MaterialCommunityIcons name="radiobox-blank" size={24} color="#777" />}
//                                                                                 <View style={{ marginLeft: 10 }}>
//                                                                                           <View>
//                                                                                                     <View style={{ flexDirection: 'row', alignItems: 'center'}}>
//                                                                                                               <Text numberOfLines={1} style={[styles.modalText, { marginLeft: 0}]}>{civil.DESCRIPTION}</Text>
//                                                                                                     </View>
//                                                                                           </View>
//                                                                                 </View>
//                                                             </View>
//                                                   </TouchableNativeFeedback>
//                                         })}
//                               </View>
//                     </Modalize>
//           )
// }

const EtatCivilModal = ({ selectedEtatCivil, onEtatCivilSelect, onClose }) => {
    const [scale] = useState(new Animated.Value(1.1))
    const intl = useIntl()
    const [loadingCivils, civils] = useFetch('/menage/menage_habitant_etat_civils')

    useEffect(() => {
              const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
                        onClose()
                        return true
              })
              Animated.spring(scale, {
                        toValue: 1,
                        useNativeDriver: true
              }).start()
              return () => {
                        backHandler.remove()
              }
    }, [])
    return (
              <Portal>
                        <TouchableWithoutFeedback onPress={onClose}>
                                  <View style={styles.modalContainer}>
                                            {loadingCivils ? <ActivityIndicator animating size="large" color={"#fff"} /> :
                                                      <TouchableWithoutFeedback>
                                                                <Animated.View style={{ ...styles.modalContent, transform: [{ scale }] }}>
                                                                          <View style={{ borderBottomWidth: 0, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#071E43' }}>
                                                                                    <Text style={{ fontWeight: 'bold', color: '#fff', opacity: 0.8, textAlign: 'center' }}>
                                                                                            { intl.formatMessage({id: "NewAffectationScreen.civils"}) }
                                                                                    </Text>
                                                                          </View>
                                                                          <ScrollView keyboardShouldPersistTaps='always'>
                                                                                    <View style={styles.modalList}>
                                                                                            {civils.map((civil, index) => {
                                                                                                        return <TouchableNativeFeedback onPress={() => onEtatCivilSelect(civil)} key={index}>
                                                                                                                  <View style={styles.modalItem}>
                                                                                                                            {selectedEtatCivil?.ID_ETAT_CIVIL == civil.ID_ETAT_CIVIL ? <MaterialCommunityIcons name="radiobox-marked" size={24} color="#007bff" /> :
                                                                                                                                      <MaterialCommunityIcons name="radiobox-blank" size={24} color="#777" />}
                                                                                                                            <Text numberOfLines={1} style={styles.modalText}>{civil.DESCRIPTION}</Text>
                                                                                                                  </View>
                                                                                                        </TouchableNativeFeedback>
                                                                                              })}
                                                                                    </View>
                                                                          </ScrollView>
                                                                </Animated.View>
                                                      </TouchableWithoutFeedback>}
                                  </View>
                        </TouchableWithoutFeedback>
              </Portal>
    )
}
// const FonctionsModalize = ({ fonctionModalizeRef, fonctions, onFonctionSelect, selectedFonction }) => {
//           return (
//                     <Modalize ref={fonctionModalizeRef} adjustToContentHeight handlePosition='inside' handleStyle={{ marginVertical: 10}}>
//                               <View style={{ marginTop: 20 }}>
//                                         {fonctions.map((fonction, index) => {
//                                                   return <TouchableNativeFeedback onPress={() => onFonctionSelect(fonction)} key={index}>
//                                                             <View style={styles.modalItem}>
//                                                                       {selectedFonction?.ID_FONCTION  == fonction.ID_FONCTION  ? <MaterialCommunityIcons name="radiobox-marked" size={24} color="#007bff" /> :
//                                                                                 <MaterialCommunityIcons name="radiobox-blank" size={24} color="#777" />}
//                                                                                 <View style={{ marginLeft: 10 }}>
//                                                                                           <View>
//                                                                                                     <View style={{ flexDirection: 'row', alignItems: 'center'}}>
//                                                                                                               <Text numberOfLines={1} style={[styles.modalText, { marginLeft: 0}]}>{fonction.FONCTION_NAME}</Text>
//                                                                                                     </View>
//                                                                                           </View>
//                                                                                 </View>
//                                                             </View>
//                                                   </TouchableNativeFeedback>
//                                         })}
//                               </View>
//                     </Modalize>
//           )
// }

const FonctionsModal = ({ selectedFonctions, onFonctionsSelect, onClose }) => {
    const [scale] = useState(new Animated.Value(1.1))
    const intl = useIntl()
    const [loadingFonctions, fonctions] = useFetch('/menage/menage_habitant_fonctions')

    useEffect(() => {
              const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
                        onClose()
                        return true
              })
              Animated.spring(scale, {
                        toValue: 1,
                        useNativeDriver: true
              }).start()
              return () => {
                        backHandler.remove()
              }
    }, [])
    return (
              <Portal>
                        <TouchableWithoutFeedback onPress={onClose}>
                                  <View style={styles.modalContainer}>
                                            {loadingFonctions ? <ActivityIndicator animating size="large" color={"#fff"} /> :
                                                      <TouchableWithoutFeedback>
                                                                <Animated.View style={{ ...styles.modalContent, transform: [{ scale }] }}>
                                                                          <View style={{ borderBottomWidth: 0, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#071E43' }}>
                                                                                    <Text style={{ fontWeight: 'bold', color: '#fff', opacity: 0.8, textAlign: 'center' }}>
                                                                                              { intl.formatMessage({id: "NewAffectationScreen.fonctions"}) }
                                                                                    </Text>
                                                                          </View>
                                                                          <ScrollView keyboardShouldPersistTaps='always'>
                                                                                    <View style={styles.modalList}>
                                                                                            {fonctions.map((fonction, index) => {
                                                                                                        return <TouchableNativeFeedback onPress={() => onFonctionsSelect(fonction)} key={index}>
                                                                                                                  <View style={styles.modalItem}>
                                                                                                                            {selectedFonctions?.ID_FONCTION == fonction.ID_FONCTION ? <MaterialCommunityIcons name="radiobox-marked" size={24} color="#007bff" /> :
                                                                                                                                      <MaterialCommunityIcons name="radiobox-blank" size={24} color="#777" />}
                                                                                                                            <Text numberOfLines={1} style={styles.modalText}>{fonction.FONCTION_NAME}</Text>
                                                                                                                  </View>
                                                                                                        </TouchableNativeFeedback>
                                                                                              })}
                                                                                    </View>
                                                                          </ScrollView>
                                                                </Animated.View>
                                                      </TouchableWithoutFeedback>}
                                  </View>
                        </TouchableWithoutFeedback>
              </Portal>
    )
}

const RolesModal = ({ID_APPARTEMENT, onRolesSelect, selectedRole, onClose}) =>{
  const [scale] = useState(new Animated.Value(1.1))
    const intl = useIntl()
    const [loadingRoles, roles] = useFetch(`/menage/roles?ID_APPARTEMENT=${ID_APPARTEMENT}`)

    useEffect(() => {
              const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
                        onClose()
                        return true
              })
              Animated.spring(scale, {
                        toValue: 1,
                        useNativeDriver: true
              }).start()
              return () => {
                        backHandler.remove()
              }
  }, [])
  return(
                <Portal>
                        <TouchableWithoutFeedback onPress={onClose}>
                                  <View style={styles.modalContainer}>
                                            {loadingRoles ? <ActivityIndicator animating size="large" color={"#fff"} /> :
                                                      <TouchableWithoutFeedback>
                                                                <Animated.View style={{ ...styles.modalContent, transform: [{ scale }] }}>
                                                                          <View style={{ borderBottomWidth: 0, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#071E43' }}>
                                                                                    <Text style={{ fontWeight: 'bold', color: '#fff', opacity: 0.8, textAlign: 'center' }}>
                                                                                               { intl.formatMessage({id: "NewAffectationScreen.roles"}) }
                                                                                    </Text>
                                                                          </View>
                                                                          <ScrollView keyboardShouldPersistTaps='always'>
                                                                                    <View style={styles.modalList}>
                                                                                            {roles.newRoles.map((role, index) => {
                                                                                                        return <TouchableNativeFeedback onPress={() => onRolesSelect(role)} key={index}>
                                                                                                                  <View style={styles.modalItem}>
                                                                                                                            {selectedRole?.ID_HABITANT_ROLE == role.ID_HABITANT_ROLE ? <MaterialCommunityIcons name="radiobox-marked" size={24} color="#007bff" /> :
                                                                                                                                      <MaterialCommunityIcons name="radiobox-blank" size={24} color="#777" />}
                                                                                                                            <Text numberOfLines={1} style={styles.modalText}>{role.NOM_ROLE}</Text>
                                                                                                                  </View>
                                                                                                        </TouchableNativeFeedback>
                                                                                              })}
                                                                                    </View>
                                                                          </ScrollView>
                                                                </Animated.View>
                                                      </TouchableWithoutFeedback>}
                                  </View>
                        </TouchableWithoutFeedback>
              </Portal>
  )
}

export default function RegisterHabitantScreen() {
          const route = useRoute()
          const navigation = useNavigation()
          const { ID_APPARTEMENT, ID_HABITANT_ROLE } = route.params
          const intl = useIntl()
          const [photo, setPhoto] = useState(null)
          const [cniFrontPhoto, setCniFrontPhoto] = useState(null)
          const [cniBackPhoto, setCniBackPhoto] = useState(null)
          const [compressedPhoto, setCompressedPhoto] = useState(null)
          const [cniFrontPhotoCompressedPhoto, setCniFrontPhotoCompressedPhoto] = useState(null)
          const [cniBackPhotoCompressedPhoto, setCniBackPhotoCompressedPhoto] = useState(null)
          const [loadingCompress, setLoadingCompress] = useState(null)
          const civilModalizeRef = useRef(null)
          const fonctionModalizeRef = useRef(null)
          const [loading, setLoading] = useState(false)

          const prenomRef = useRef(null)
          const cniRef= useRef(null)
          const delivranceRef = useRef(null)
          const pereRef = useRef(null)
          const mereRef = useRef(null)
          const telRef= useRef(null)

          const toast = useToast()

         
          

          const [showDelivranceCalendar, setShowDelivranceCalendar] = useState(false)
          const [showNaissanceCalendar, setShowNaissanceCalendar] = useState(false)

          const [showEtatCivil, setShowEtatCivil] = useState(false)
          const [selectedEtatCivil, setSelectedEtatCivil] = useState(null)

          const [showFonctions, setShowFonctions] = useState(false)
          const [selectedFonctions, setSelectedFonctions] = useState(null)
          
          const [showProvinces, setShowProvinces] = useState(false)
          const [selectedProvince, setSelectedProvince] = useState(null)

          const [showCommunes, setShowCommunes] = useState(false)
          const [selectedCommune, setSelectedCommune] = useState(null)

          const onProvinceSelect = (province) => {
                    setSelectedProvince(province)
                    setShowProvinces(false)
                    setSelectedCommune(null)
                    setSelectedZone(null)
                    setSelectedColline(null)
          }
          const onCommuneSelect = (commune) => {
                    setSelectedCommune(commune)
                    setShowCommunes(false)
                    setSelectedZone(null)
                    setSelectedColline(null)
          }

          const onEtatCivilSelect = (civil) => {
                    setSelectedEtatCivil(civil)
                    setShowEtatCivil(null)
            }

            const onFonctionsSelect = (fonction) => {
                setSelectedFonctions(fonction)
                setShowFonctions(null)
        }

          const [showZones, setShowZones] = useState(false)
          const [selectedZone, setSelectedZone] = useState(null)
          const onZoneSelect = (zone) => {
                    setSelectedZone(zone)
                    setShowZones(false)
                    setSelectedColline(null)
          }

          const [showCollines, setShowCollines] = useState(false)
          const [selectedColline, setSelectedColline] = useState(null)
          const onCollineSelect = (colline) => {
                    setSelectedColline(colline)
                    setShowCollines(false)
                    handleChange('colline', colline)
          }

          const [showRoles, setShowRoles] = useState(false)
          const [selectedRole, setSelectedRole] = useState(null)

          const onRolesSelect = (role) => {
            setSelectedRole(role)
            setShowRoles(null)
    }

          const [data, handleChange, setValue] = useForm({
                    nom: "",
                    prenom: "",
                    sexe: null,
                    etatCivil: null,
                    fonction: null,
                    cni: "",
                    delivrance: "",
                    dateDelivrance: new Date(),
                    dateNaissance: new Date(),
                    pere: "",
                    mere: "",
                    tel: "",
                    colline: null
          })

          const onCivilSelect = newEtatCivil => {
                    civilModalizeRef.current.close()
                    handleChange('etatCivil', newEtatCivil)
          }

          const onFonctionSelect = newFonction => {
                    fonctionModalizeRef.current.close()
                    handleChange('fonction', newFonction)
          }
          
          const changeDelivranceDate = (event, selectedDate) => {
                    setShowDelivranceCalendar(Platform.OS === "ios");
                    const currentDate = selectedDate;
                    handleChange("dateDelivrance", currentDate)
          };
          const changeNaissanceDate = (event, selectedDate) => {
                    setShowNaissanceCalendar(Platform.OS === "ios");
                    const currentDate = selectedDate;
                    handleChange("dateNaissance", currentDate)
          };
          const { checkFieldData, isValidate, getError, hasError, setErrors } = useFormErrorsHandle(data, {
                    nom: {
                              alpha: true,
                              required: true,
                              length: [1, 45]
                    },
                    prenom: {
                              alpha: true,
                              required: true,
                              length: [1, 45]
                    },
                    sexe: {
                              required: true
                    },
                    cni: {
                              alpha: true,
                              required: true,
                              length: [1, 30]
                    },
                    delivrance: {
                              alpha: true,
                              required: true,
                              length: [1, 15]
                    },
                    pere: {
                              alpha: true,
                              required: true,
                              length: [1, 50]
                    },
                    mere: {
                              alpha: true,
                              required: true,
                              length: [1, 50]
                    },
                    tel: {
                              number: true,
                              required: true,
                              length: [8, 8]
                    },
                    colline: {
                              required: true
                    }
          }, {
                    nom: {
                              required: intl.formatMessage({ id: "VehicleRegisterScreen.required" }),
                              alpha: intl.formatMessage({ id: "SignalementRequestPlateScreen.invalidDescAlpha" }),
                              length: intl.formatMessage({ id: 'RegisterScreen.invalidNom' })
                    },
                    prenom: {
                              required: intl.formatMessage({ id: "VehicleRegisterScreen.required" }),
                              alpha: intl.formatMessage({ id: "SignalementRequestPlateScreen.invalidDescAlpha" }),
                              length: intl.formatMessage({ id: 'RegisterScreen.invalidNom' })
                    },
                    sexe: {
                              required: intl.formatMessage({ id: "VehicleRegisterScreen.required" }),
                    },
                    etatCivil: {
                              required: intl.formatMessage({ id: "VehicleRegisterScreen.required" }),
                    },
                    fonction: {
                              required: intl.formatMessage({ id: "VehicleRegisterScreen.required" }),
                    },
                    cni: {
                              required: intl.formatMessage({ id: "VehicleRegisterScreen.required" }),
                              alpha: intl.formatMessage({ id: "SignalementRequestPlateScreen.invalidDescAlpha" }),
                              length: intl.formatMessage({ id: "RegisterHabitantScreen.invalidCni" }),
                    },
                    delivrance: {
                              required: intl.formatMessage({ id: "VehicleRegisterScreen.required" }),
                              alpha: intl.formatMessage({ id: "SignalementRequestPlateScreen.invalidDescAlpha" }),
                              length: intl.formatMessage({ id: "RegisterHabitantScreen.invalidDelivrance" }),
                    },
                    pere: {
                              required: intl.formatMessage({ id: "VehicleRegisterScreen.required" }),
                              alpha: intl.formatMessage({ id: "SignalementRequestPlateScreen.invalidDescAlpha" }),
                              length: intl.formatMessage({ id: "RegisterScreen.invalidNom" }),
                    },
                    mere: {
                              required: intl.formatMessage({ id: "VehicleRegisterScreen.required" }),
                              alpha: intl.formatMessage({ id: "SignalementRequestPlateScreen.invalidDescAlpha" }),
                              length: intl.formatMessage({ id: "RegisterScreen.invalidNom" }),
                    },
                    tel: {
                              required: intl.formatMessage({ id: 'RegisterScreen.required' }),
                              number: intl.formatMessage({ id: 'RegisterScreen.invalidNumber' }),
                              length: intl.formatMessage({ id: 'RegisterScreen.invalidNumber' })
                    },
                    colline: {
                              required: intl.formatMessage({ id: 'RegisterScreen.required' }),
                    }
          })
          const onTakePictureSelect = async () => {
                    const permission = await ImagePicker.requestCameraPermissionsAsync()
                    if(!permission.granted) return false
                    const image = await launchCamera()
                    if (!image.didCancel) {
                              setLoadingCompress(true)
                              const photo = image.assets[0]
                              const photoId = Date.now()
                              setPhoto({...photo, id: photoId})
                              const manipResult = await manipulateAsync(
                                        photo.uri,
                                        [
                                                  { resize: { width: 500 } }
                                        ],
                                        { compress: 0.7, format: SaveFormat.JPEG }
                              );
                              setCompressedPhoto({...manipResult, id: photoId})
                              setLoadingCompress(false)
                    }
          }
          const onFrontCNISelect = async () => {
                    const permission = await ImagePicker.requestCameraPermissionsAsync()
                    if(!permission.granted) return false
                    const image = await launchCamera()
                    if (!image.didCancel) {
                              setLoadingCompress(true)
                              const photo = image.assets[0]
                              const photoId = Date.now()
                              setCniFrontPhoto({...photo, id: photoId})
                              const manipResult = await manipulateAsync(
                                        photo.uri,
                                        [
                                                  { resize: { width: 500 } }
                                        ],
                                        { compress: 0.7, format: SaveFormat.JPEG }
                              );
                              setCniFrontPhotoCompressedPhoto({...manipResult, id: photoId})
                              setLoadingCompress(false)
                    }
          }
          const onBackCNISelect = async () => {
                    const permission = await ImagePicker.requestCameraPermissionsAsync()
                    if(!permission.granted) return false
                    const image = await launchCamera()
                    if (!image.didCancel) {
                              setLoadingCompress(true)
                              const photo = image.assets[0]
                              const photoId = Date.now()
                              setCniBackPhoto({...photo, id: photoId})
                              const manipResult = await manipulateAsync(
                                        photo.uri,
                                        [
                                                  { resize: { width: 500 } }
                                        ],
                                        { compress: 0.7, format: SaveFormat.JPEG }
                              );
                              setCniBackPhotoCompressedPhoto({...manipResult, id: photoId})
                              setLoadingCompress(false)
                    }
          }
          const onSubmit = async () => {
                    try {
                              setLoading(true)
                              const form = new FormData()
                              form.append('NOM', data.nom)
                              form.append('PRENOM', data.prenom)
                              form.append('NUMERO_IDENTITE', data.cni)
                              form.append('LIEU_DELIVRANCE', data.delivrance)
                              form.append('DATE_DELIVRANCE', data.dateDelivrance.toString())
                              form.append('PERE', data.pere)
                              form.append('MERE', data.mere)
                              form.append('NUMERO_TELEPHONE', data.tel)
                              form.append('COLLINE_ID', data.colline.COLLINE_ID)
                              form.append('DATE_NAISSANCE', data.dateNaissance.toString())
                              form.append('ID_SEXE', data.sexe)
                            //   form.append('ID_ETAT_CIVIL', data.etatCivil.ID_ETAT_CIVIL)
                            //   form.append('ID_FONCTION', data.fonction.ID_FONCTION)
                            form.append('ID_ETAT_CIVIL', selectedEtatCivil.ID_ETAT_CIVIL)
                            form.append('ID_FONCTION', selectedFonctions.ID_FONCTION)
                              form.append('ID_HABITANT_ROLE', ID_HABITANT_ROLE ? ID_HABITANT_ROLE : selectedRole.ID_HABITANT_ROLE)

                              let localUri = compressedPhoto.uri;
                              let filename = localUri.split('/').pop();
                              let match = /\.(\w+)$/.exec(filename);
                              let type = match ? `image/${match[1]}` : `image`;
                              form.append('PHOTO', {
                                        uri: localUri, name: filename, type
                              })
                              
                              let localUriCNI1 = cniFrontPhotoCompressedPhoto.uri;
                              let filenameCNI1 = localUriCNI1.split('/').pop();
                              let matchCNI1 = /\.(\w+)$/.exec(filenameCNI1);
                              let typeCNI1 = matchCNI1 ? `image/${match[1]}` : `image`;
                              form.append('PHOTO_CNI1', {
                                        uri: localUriCNI1, name: filenameCNI1, type: typeCNI1
                              })
                              
                              let localUriCNI2 = cniFrontPhotoCompressedPhoto.uri;
                              let filenameCNI2 = localUriCNI2.split('/').pop();
                              let matchCNI2 = /\.(\w+)$/.exec(filenameCNI2);
                              let typeCNI2 = matchCNI2 ? `image/${match[1]}` : `image`;
                              form.append('PHOTO_CNI2', {
                                        uri: localUriCNI2, name: filenameCNI2, type: typeCNI2
                              })
                              const ms = await fetchApi(`/menage/menage_habitants/${ID_APPARTEMENT}`, {
                                        method: "POST",
                                        body: form
                              })
                              navigation.goBack()
                              toast.show({
                                        title: "Habitant enregistré avec succès",
                                        placement: "bottom",
                                        status: 'error',
                                        duration: 2000,
                                        width: '90%',
                                        minWidth: 300
                              })
                    } catch (error) {
                              console.log(error)
                    } finally {
                              setLoading(false)
                    }
          }
          return (
                    <>
                              { loading && <Loading />}
                              {/* <CivilModalize civilModalizeRef={civilModalizeRef} loadingCivils={loadingCivils} civils={civils} onCivilSelect={onCivilSelect} selectedCivil={data.etatCivil} /> */}
                              {/* <FonctionsModalize fonctionModalizeRef={fonctionModalizeRef} loadingFonctions={loadingFonctions} fonctions={fonctions} onFonctionSelect={onFonctionSelect} selectedFonction={data.fonction} /> */}
                              <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} keyboardShouldPersistTaps="handled">
                                        <Header withRadius={false} />
                                        <View style={styles.container}>
                                                  <View style={styles.userPhoto}>
                                                            <TouchableWithoutFeedback onPress={onTakePictureSelect}>
                                                                      <View style={styles.photoContainer}>
                                                                                {photo ? <Image source={{ uri: photo.uri }} style={[styles.photo, { width: "100%", height: "100%" }]} /> :
                                                                                <Image source={require('../../../assets/images/photo.png')} style={styles.photo} />}
                                                                      </View>
                                                            </TouchableWithoutFeedback>
                                                            <Text style={styles.photoTitle}>{ intl.formatMessage({id: "NewAffectationScreen.photos"})}</Text>
                                                  </View>
                                                  {ID_HABITANT_ROLE==null ? 
                                                    <View style={styles.inputs}>
                                                          <TouchableOpacity style={styles.modalCard} onPress={() => setShowRoles(true)}>
                                                                <View style={{}}>
                                                                      <Text style={[styles.inputText, { fontSize: 13 }]}>
                                                                            { intl.formatMessage({id: "NewAffectationScreen.roles"})}
                                                                      </Text>
                                                                      <Text style={[styles.inputText, { color: '#444' }]}>
                                                                          {selectedRole != null ? selectedRole.NOM_ROLE : "Sélectionner le roles"}
                                                                      </Text>
                                                                </View>
                                                                <EvilIcons name="chevron-down" size={30} color="#777" />
                                                            </TouchableOpacity>
                                                    </View>  : null
                                                  }
                                                  
                                                  <View style={styles.inputs}>
                                                            <OutlinedTextField
                                                                      label={ intl.formatMessage({id: "ProfileDetailScreen.Nom"})}
                                                                      fontSize={13}
                                                                      baseColor={'#a2a2a2'}
                                                                      tintColor={"#071E43"}
                                                                      containerStyle={{ borderRadius: 20, marginTop: 15 }}
                                                                      inputContainerStyle={{ borderRadius: 10 }}
                                                                      lineWidth={0.5}
                                                                      activeLineWidth={0.5}
                                                                      errorColor={"red"}
                                                                      value={data.nom}
                                                                      onChangeText={(newValue) => handleChange('nom', newValue)}
                                                                      onBlur={() => checkFieldData('nom')}
                                                                      error={hasError('nom') ? getError('nom') : ''}
                                                                      autoCompleteType='off'
                                                                      blurOnSubmit={false}
                                                                      returnKeyType="next"
                                                                      onSubmitEditing={() => prenomRef.current.focus()}
                                                            />
                                                            <OutlinedTextField
                                                                      label={ intl.formatMessage({id: "ProfileDetailScreen.Prenom"})}
                                                                      fontSize={13}
                                                                      baseColor={'#a2a2a2'}
                                                                      tintColor={"#071E43"}
                                                                      containerStyle={{ borderRadius: 20, marginTop: 15 }}
                                                                      inputContainerStyle={{ borderRadius: 10 }}
                                                                      lineWidth={0.5}
                                                                      activeLineWidth={0.5}
                                                                      errorColor={"red"}
                                                                      value={data.prenom}
                                                                      onChangeText={(newValue) => handleChange('prenom', newValue)}
                                                                      onBlur={() => checkFieldData('prenom')}
                                                                      error={hasError('prenom') ? getError('prenom') : ''}
                                                                      autoCompleteType='off'
                                                                      blurOnSubmit={false}
                                                                      ref={prenomRef}
                                                                      // onSubmitEditing={() => cniRef.current.focus()}
                                                            />
                                                            <View style={styles.modalCard}>
                                                                      <View style={{}}>
                                                                                <Text style={[styles.inputText, { fontSize: 13 }]}>
                                                                                        { intl.formatMessage({id: "RegistreScreen.Sexe"})}
                                                                                </Text>
                                                                                <TouchableOpacity style={styles.radioContainer} onPress={() => handleChange('sexe', 1)}>
                                                                                          {data.sexe == 1 ? <MaterialCommunityIcons name="radiobox-marked" size={20} color="#071E43" /> :
                                                                                          <MaterialCommunityIcons name="radiobox-blank" size={20} color="#777" />}
                                                                                          <Text style={[styles.inputText, { color: '#444', marginLeft: 5 }]}>
                                                                                                  { intl.formatMessage({id: "RegistreScreen.Masculin"})}
                                                                                          </Text>
                                                                                </TouchableOpacity>
                                                                                <TouchableOpacity style={styles.radioContainer} onPress={() => handleChange('sexe', 0)}>
                                                                                          {data.sexe == 0 ? <MaterialCommunityIcons name="radiobox-marked" size={20} color="#071E43" /> :
                                                                                          <MaterialCommunityIcons name="radiobox-blank" size={20} color="#777" />}
                                                                                          <Text style={[styles.inputText, { color: '#444', marginLeft: 5 }]}>
                                                                                                    { intl.formatMessage({id: "RegistreScreen.Féminin"})}
                                                                                          </Text>
                                                                                </TouchableOpacity>
                                                                      </View>
                                                            </View>
                                                            <TouchableOpacity style={styles.modalCard} onPress={() => setShowNaissanceCalendar(true)}>
                                                                      <View style={{}}>
                                                                                <Text style={[styles.inputText, { fontSize: 13 }]}>
                                                                                          { intl.formatMessage({id: "registerHabitantscreen.dateNaissance"})}
                                                                                </Text>
                                                                                <Text style={[styles.inputText, { color: '#444' }]}>
                                                                                          { moment(data.dateNaissance).format('DD/MM/YYYY')}
                                                                                </Text>
                                                                      </View>
                                                                      <EvilIcons name="chevron-down" size={30} color="#777" />
                                                            </TouchableOpacity>
                                                            {showNaissanceCalendar && (
                                                                      <DateTimePicker
                                                                                testID="dateTimePicker"
                                                                                value={data.dateNaissance}
                                                                                mode={"date"}
                                                                                is24Hour={true}
                                                                                display="default"
                                                                                onChange={changeNaissanceDate}
                                                                                maximumDate={new Date()}
                                                                      />
                                                            )}

                                                            <TouchableOpacity style={styles.modalCard} onPress={() => setShowEtatCivil(true)}>
                                                                      <View style={{}}>
                                                                                <Text style={[styles.inputText, { fontSize: 13 }]}>
                                                                                          { intl.formatMessage({id: "NewAffectationScreen.civils"})}
                                                                                </Text>
                                                                                <Text style={[styles.inputText, { color: '#444' }]}>
                                                                                          {/* { data.etatCivil ? data.etatCivil.DESCRIPTION : "Sélectionner l'état civil" } */}
                                                                                          {selectedEtatCivil != null ? selectedEtatCivil.DESCRIPTION : "Sélectionner l'état civil"}
                                                                                </Text>
                                                                      </View>
                                                                      <EvilIcons name="chevron-down" size={30} color="#777" />
                                                            </TouchableOpacity>

                                                            <TouchableOpacity style={styles.modalCard} onPress={() => setShowFonctions(true)}>
                                                                      <View style={{}}>
                                                                                <Text style={[styles.inputText, { fontSize: 13 }]}>
                                                                                          { intl.formatMessage({id: "NewAffectationScreen.fonctions"})}
                                                                                </Text>
                                                                                <Text style={[styles.inputText, { color: '#444' }]}>
                                                                                          {/* { data.fonction ? data.fonction.FONCTION_NAME : "Sélectionner la fonction" } */}
                                                                                          {selectedFonctions != null ? selectedFonctions.FONCTION_NAME : "Sélectionner la fonction"}
                                                                                </Text>
                                                                      </View>
                                                                      <EvilIcons name="chevron-down" size={30} color="#777" />
                                                            </TouchableOpacity>

                                                            <OutlinedTextField
                                                                      label={ intl.formatMessage({id: "registerHabitantscreen.identite"})}
                                                                      fontSize={13}
                                                                      baseColor={'#a2a2a2'}
                                                                      tintColor={"#071E43"}
                                                                      containerStyle={{ borderRadius: 20, marginTop: 15 }}
                                                                      inputContainerStyle={{ borderRadius: 10 }}
                                                                      lineWidth={0.5}
                                                                      activeLineWidth={0.5}
                                                                      errorColor={"red"}
                                                                      value={data.cni}
                                                                      onChangeText={(newValue) => handleChange('cni', newValue)}
                                                                      onBlur={() => checkFieldData('cni')}
                                                                      error={hasError('cni') ? getError('cni') : ''}
                                                                      autoCompleteType='off'
                                                                      blurOnSubmit={false}
                                                                      ref={cniRef}
                                                                      returnKeyType="next"
                                                                      onSubmitEditing={() => delivranceRef.current.focus()}
                                                            />
                                                            <OutlinedTextField
                                                                      label={ intl.formatMessage({id: "registerHabitantscreen.lieuDelivrance"})}
                                                                      fontSize={13}
                                                                      baseColor={'#a2a2a2'}
                                                                      tintColor={"#071E43"}
                                                                      containerStyle={{ borderRadius: 20, marginTop: 15 }}
                                                                      inputContainerStyle={{ borderRadius: 10 }}
                                                                      lineWidth={0.5}
                                                                      activeLineWidth={0.5}
                                                                      errorColor={"red"}
                                                                      value={data.delivrance}
                                                                      onChangeText={(newValue) => handleChange('delivrance', newValue)}
                                                                      onBlur={() => checkFieldData('delivrance')}
                                                                      error={hasError('delivrance') ? getError('delivrance') : ''}
                                                                      autoCompleteType='off'
                                                                      blurOnSubmit={false}
                                                                      ref={delivranceRef}
                                                                      // returnKeyType="next"
                                                                      // onSubmitEditing={() => mereRef.current.focus()}
                                                            />
                                                            <TouchableOpacity style={styles.modalCard} onPress={() => setShowDelivranceCalendar(true)}>
                                                                      <View style={{}}>
                                                                                <Text style={[styles.inputText, { fontSize: 13 }]}>
                                                                                        { intl.formatMessage({id: "registerHabitantscreen.dateDelivrance"})}
                                                                                </Text>
                                                                                <Text style={[styles.inputText, { color: '#444' }]}>
                                                                                          { moment(data.dateDelivrance).format('DD/MM/YYYY')}
                                                                                </Text>
                                                                      </View>
                                                                      <EvilIcons name="chevron-down" size={30} color="#777" />
                                                            </TouchableOpacity>
                                                            {showDelivranceCalendar && (
                                                                      <DateTimePicker
                                                                                testID="dateTimePicker"
                                                                                value={data.dateDelivrance}
                                                                                mode={"date"}
                                                                                is24Hour={true}
                                                                                display="default"
                                                                                onChange={changeDelivranceDate}
                                                                                maximumDate={new Date()}
                                                                      />
                                                            )}
                                                            <TouchableWithoutFeedback onPress={onFrontCNISelect}>
                                                                      <View style={[styles.addImageItem]}>
                                                                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                                                          <Feather name="image" size={24} color="#777" />
                                                                                          <Text style={styles.addImageLabel}>
                                                                                                  { intl.formatMessage({id: "registerHabitantscreen.photosDevant"})}
                                                                                          </Text>
                                                                                </View>
                                                                                {cniFrontPhoto && <Image source={{ uri: cniFrontPhoto.uri }} style={{ width: "100%", height: 200, marginTop: 10, borderRadius: 5 }} />}
                                                                      </View>
                                                            </TouchableWithoutFeedback>
                                                            <TouchableWithoutFeedback onPress={onBackCNISelect}>
                                                                      <View style={[styles.addImageItem]}>
                                                                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                                                          <Feather name="image" size={24} color="#777" />
                                                                                          <Text style={styles.addImageLabel}>
                                                                                                  { intl.formatMessage({id: "registerHabitantscreen.photosArriere"})}
                                                                                          </Text>
                                                                                </View>
                                                                                {cniBackPhoto && <Image source={{ uri: cniBackPhoto.uri }} style={{ width: "100%", height: 200, marginTop: 10, borderRadius: 5 }} />}
                                                                      </View>
                                                            </TouchableWithoutFeedback>
                                                            <OutlinedTextField
                                                                      label={ intl.formatMessage({id: "registerHabitantscreen.nomPere"})}
                                                                      fontSize={13}
                                                                      baseColor={'#a2a2a2'}
                                                                      tintColor={"#071E43"}
                                                                      containerStyle={{ borderRadius: 20, marginTop: 15 }}
                                                                      inputContainerStyle={{ borderRadius: 10 }}
                                                                      lineWidth={0.5}
                                                                      activeLineWidth={0.5}
                                                                      errorColor={"red"}
                                                                      value={data.pere}
                                                                      onChangeText={(newValue) => handleChange('pere', newValue)}
                                                                      onBlur={() => checkFieldData('pere')}
                                                                      error={hasError('pere') ? getError('pere') : ''}
                                                                      autoCompleteType='off'
                                                                      blurOnSubmit={false}
                                                                      ref={pereRef}
                                                                      returnKeyType="next"
                                                                      onSubmitEditing={() => mereRef.current.focus()}
                                                            />
                                                            <OutlinedTextField
                                                                      label={ intl.formatMessage({id: "registerHabitantscreen.nomMere"})}
                                                                      fontSize={13}
                                                                      baseColor={'#a2a2a2'}
                                                                      tintColor={"#071E43"}
                                                                      containerStyle={{ borderRadius: 20, marginTop: 15 }}
                                                                      inputContainerStyle={{ borderRadius: 10 }}
                                                                      lineWidth={0.5}
                                                                      activeLineWidth={0.5}
                                                                      errorColor={"red"}
                                                                      value={data.mere}
                                                                      onChangeText={(newValue) => handleChange('mere', newValue)}
                                                                      onBlur={() => checkFieldData('mere')}
                                                                      error={hasError('mere') ? getError('mere') : ''}
                                                                      autoCompleteType='off'
                                                                      blurOnSubmit={false}
                                                                      ref={mereRef}
                                                                      returnKeyType="next"
                                                                      onSubmitEditing={() => telRef.current.focus()}
                                                            />
                                                            <OutlinedTextField
                                                                      label={ intl.formatMessage({id: "newInstitutionScreen.numeroTelephone"})}
                                                                      fontSize={13}
                                                                      baseColor={'#a2a2a2'}
                                                                      tintColor={"#071E43"}
                                                                      containerStyle={{ borderRadius: 20, marginTop: 15 }}
                                                                      inputContainerStyle={{ borderRadius: 10 }}
                                                                      lineWidth={0.5}
                                                                      activeLineWidth={0.5}
                                                                      errorColor={"red"}
                                                                      value={data.tel}
                                                                      onChangeText={(newValue) => handleChange('tel', newValue)}
                                                                      onBlur={() => checkFieldData('tel')}
                                                                      error={hasError('tel') ? getError('tel') : ''}
                                                                      autoCompleteType='off'
                                                                      blurOnSubmit={false}
                                                                      prefix="+257"
                                                                      ref={telRef}
                                                                      keyboardType='number-pad'
                                                            />
                                                            <View style={{ marginBottom: 10 }}>
                                                                      <TouchableOpacity style={styles.formGroup} onPress={() => setShowProvinces(true)}>
                                                                                <View>
                                                                                          <Text style={styles.title}>
                                                                                                    {intl.formatMessage({id: "NewAffectationScreen.province"})}
                                                                                          </Text>
                                                                                          <Text style={styles.openModalizeLabel} numberOfLines={1}>
                                                                                                    {selectedProvince != null ? selectedProvince.PROVINCE_NAME : intl.formatMessage({id: "NewAffectationScreen.selectProvince"})}
                                                                                          </Text>
                                                                                </View>
                                                                                <AntDesign name="caretdown" size={16} color="#777" />
                                                                      </TouchableOpacity>
                                                                      {selectedProvince && <TouchableOpacity style={styles.formGroup} onPress={() => setShowCommunes(true)}>
                                                                                <View>
                                                                                          <Text style={styles.title}>
                                                                                                    {intl.formatMessage({id: "NewAffectationScreen.commune"})}
                                                                                          </Text>
                                                                                          <Text style={styles.openModalizeLabel} numberOfLines={1}>
                                                                                                    {selectedCommune != null ? selectedCommune.COMMUNE_NAME : intl.formatMessage({id: "NewAffectationScreen.selectCommune"})}
                                                                                          </Text>
                                                                                </View>
                                                                                <AntDesign name="caretdown" size={16} color="#777" />
                                                                      </TouchableOpacity>}
                                                                      {selectedCommune && <TouchableOpacity style={styles.formGroup} onPress={() => setShowZones(true)}>
                                                                                <View>
                                                                                          <Text style={styles.title}>
                                                                                                    {intl.formatMessage({id: "NewAffectationScreen.zone"})}
                                                                                          </Text>
                                                                                          <Text style={styles.openModalizeLabel} numberOfLines={1}>
                                                                                                    {selectedZone != null ? selectedZone.ZONE_NAME : intl.formatMessage({id: "NewAffectationScreen.selectZone"})}
                                                                                          </Text>
                                                                                </View>
                                                                                <AntDesign name="caretdown" size={16} color="#777" />
                                                                      </TouchableOpacity>}
                                                                      {selectedZone && <TouchableOpacity style={styles.formGroup} onPress={() => setShowCollines(true)}>
                                                                                <View>
                                                                                <Text style={styles.title}>
                                                                                          { intl.formatMessage({id: "NewAffectationScreen.colline"}) }
                                                                                </Text>
                                                                                <Text style={styles.openModalizeLabel} numberOfLines={1}>
                                                                                          {selectedColline != null ? selectedColline.COLLINE_NAME : intl.formatMessage({id: "NewAffectationScreen.selectColline"})}
                                                                                </Text>
                                                                                </View>
                                                                                <AntDesign name="caretdown" size={16} color="#777" />
                                                                      </TouchableOpacity>}
                                                            </View>
                                                  </View>
                                        </View>
                              </ScrollView>
                              <View style={{ paddingVertical: 10, backgroundColor: '#FFF' }}>
                                        <TouchableNativeFeedback disabled={!isValidate() || loadingCompress || !compressedPhoto || !cniFrontPhotoCompressedPhoto || !cniBackPhotoCompressedPhoto} background={TouchableNativeFeedback.Ripple('#c4c4c4')} useForeground={true} onPress={onSubmit}>
                                                  <View style={{ ...styles.otherAction, backgroundColor: '#071E43', opacity: !isValidate() || loadingCompress || !compressedPhoto || !cniFrontPhotoCompressedPhoto || !cniBackPhotoCompressedPhoto ? 0.5 : 1 }}>
                                                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
                                                                      <Text style={styles.otherActionText}>
                                                                                {intl.formatMessage({id: "auth.signalementScreen.titleButton"})}
                                                                      </Text>
                                                            </View>
                                                  </View>
                                        </TouchableNativeFeedback>
                              </View>
                              {showProvinces && <ProvinceModal selectedProvince={selectedProvince} onProvinceSelect={onProvinceSelect} onClose={() => setShowProvinces(false)} />}
                              {showCommunes && <CommunesModal selectedProvince={selectedProvince} selectedCommune={selectedCommune} onCommuneSelect={onCommuneSelect} onClose={() => setShowCommunes(false)} />}
                              {showZones && <ZonesModal selectedCommune={selectedCommune} selectedZone={selectedZone} onZoneSelect={onZoneSelect} onClose={() => setShowZones(false)} />}
                              {showCollines && <CollinesModal selectedZone={selectedZone} selectedColline={selectedColline} onCollineSelect={onCollineSelect} onClose={() => setShowCollines(false)} />}
                              {showEtatCivil && <EtatCivilModal selectedEtatCivil={selectedEtatCivil} onEtatCivilSelect={onEtatCivilSelect} onClose={() => setShowEtatCivil(false)}/>}
                              {showFonctions && <FonctionsModal selectedFonctions={selectedFonctions} onFonctionsSelect={onFonctionsSelect} onClose={() => setShowFonctions(false)}/>}
                              {showRoles && <RolesModal ID_APPARTEMENT={ID_APPARTEMENT} selectedRole={selectedRole} onRolesSelect={onRolesSelect} onClose={() => setShowRoles(false)}/>}
                    </>
          )
}

const styles = StyleSheet.create({
          container: {
                    flex: 1,
                    backgroundColor: '#fff',
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                    marginTop: -15
          },
          userPhoto: {
                    alignSelf: "center",
                    marginVertical: 20
          },
          photoContainer: {
                    width: 80,
                    height: 80,
                    borderRadius: 80,
                    borderWidth: 1,
                    borderColor: '#DDD',
                    justifyContent: "center",
                    alignItems: "center",
                    alignSelf: "center"
          },
          photo: {
                    width: "80%",
                    height: "80%",
                    borderRadius: 100,
          },
          photoTitle: {
                    color: '#777',
                    textAlign: "center",
                    marginTop: 5
          },
          inputs: {
                    paddingHorizontal: 10
          },
          otherAction: {
                    backgroundColor: '#fff',
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 15,
                    paddingHorizontal: 5,
                    borderRadius: 8,
                    justifyContent: 'space-between',
                    overflow: 'hidden',
                    marginHorizontal: 10
          },
          otherActionText: {
                    fontSize: 15,
                    color: '#fff',
          },
          modalCard: {
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    // marginHorizontal: 10,
                    backgroundColor: "#fff",
                    padding: 13,
                    borderRadius: 5,
                    borderWidth: 0.5,
                    borderColor: "#777",
                    marginVertical: 10
          },
          inputText: {
                    color: '#777'
          },
          radioContainer: {
                    flexDirection: 'row',
                    alignItems: "center",
                    marginVertical: 5
          },
          formGroup: {
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "#fff",
                    padding: 13,
                    borderRadius: 5,
                    borderWidth: 0.5,
                    borderColor: "#777",
                    marginTop: 10
          },
          title: {
                    color: '#777',
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
                    color: '#333',
          },
          modalContainer: {
                    position: 'absolute',
                    zIndex: 1,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    justifyContent: 'center',
                    alignItems: 'center'
          },
          modalContent: {
                    width: '90%',
                    maxWidth: 400,
                    backgroundColor: '#fff',
                    borderRadius: 10,
                    overflow: 'hidden',
                    maxHeight: '90%'
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
                    fontWeight: 'bold',
                    marginLeft: 10
          },
          
          addImageContainer: {
                    paddingHorizontal: 20
          },
          addImageItem: {
                    borderWidth: 0.5,
                    borderColor: '#777',
                    borderRadius: 5,
                    paddingHorizontal: 10,
                    paddingVertical: 15,
                    marginTop: 15
          },
          addImageLabel: {
                    fontWeight: "bold",
                    marginLeft: 5,
                    opacity: 0.8
          },
})
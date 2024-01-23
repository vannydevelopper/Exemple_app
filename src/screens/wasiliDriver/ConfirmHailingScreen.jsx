import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableNativeFeedback, View } from 'react-native'
import { FontAwesome, Fontisto, EvilIcons, AntDesign, Feather, Ionicons, Entypo } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/core';
import fetchApi from '../../helpers/fetchApi';
import { COLORS } from '../../styles/COLORS';
import { useRef } from 'react';
import { Modalize } from 'react-native-modalize';
import ConfirmModal from '../../components/modals/ConfirmModal';
import { getCurrentPositionAsync } from 'expo-location';
import IDS_COURSE_TYPES from '../../constants/IDS_COURSE_TYPES';
import Loading from '../../components/app/Loading';
import { useDispatch } from 'react-redux';
import { setCourseAction } from '../../store/actions/courseActions';
import wait from '../../helpers/wait';
import useFetch from '../../hooks/useFetch';
import { BeneficiairesRender } from './CorporatesScreen';
import { NewEmployeBeneficiairesRender } from './CorporatesScreen';
import { useIntl } from 'react-intl';

export default function ConfirmHailingScreen() {
          const navigation = useNavigation()
          const route = useRoute()
          const [loadingModes, setLoadingModes] = useState(true)
          const [modes, setModes] = useState([])
          const [selectedMode, setSelectedMode] = useState(null)
          const [selectedCorporate, setSelectedCorporate] = useState(null)
          const [selectedNewEmployee, setSelectedNewEmployee] = useState([])
          const [newDemandeur, setNewDemandeur] = useState(null)
          const [showConfirmModal, setShowConfirmModal] = useState(false)
          const [isSaving, setIsSaving] = useState(false)
          const [reverseGeocodingResult, setReverseGeocodingResult] = useState(null)
          const [loadingRerverse, setLoadingRerverse] = useState(true)
          const [location, setLocation] = useState(null)
          const intl = useIntl()

          const dispatch = useDispatch()

          const choixCorporate = () =>{
            setSelectedNewEmployee([])
            navigation.navigate("CorporatesScreen", { selectedCorporate, employee:selectedNewEmployee, selectNewDemandeur: newDemandeur })
          }
          useEffect(() => {
                    (async () => {
                              const res = await fetchApi(`/corporate/corporates/public`)
                              setModes(res.result)
                              setLoadingModes(false)
                              if(!selectedCorporate) {
                                        setSelectedMode(res.result[0])
                              }
                    })()
          }, [selectedCorporate])
          useFocusEffect(useCallback(() => {
                    (async () => {
                              try {
                                        const loc = await getCurrentPositionAsync()
                                        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${loc.coords.latitude}&lon=${loc.coords.longitude}&accept-language=fr`
                                        const response = await fetch(url)
                                        const result = await response.json()
                                        setLocation(loc)
                                        setReverseGeocodingResult(result)
                              } catch (error) {
                                        console.log(error)
                              } finally {
                                        setLoadingRerverse(false)
                              }
                    })()
          }, []))
          const startTriping = useCallback(async () => {
                    if (selectedMode) {
                              try {
                                        setShowConfirmModal(null)
                                        setIsSaving(true)
                                        const body = {
                                                  LATITUDE_PICKUP: location.coords.latitude,
                                                  LONGITUDE_PICKUP: location.coords.longitude,
                                                  ADDRESSE_PICKUP: reverseGeocodingResult ? reverseGeocodingResult.display_name : null,
                                                  ID_COURSE_TYPE: IDS_COURSE_TYPES.hele,
                                                  ID_CORPORATE: selectedMode?.ID_CORPORATE,
                                                  ID_CORP_CORPORATE: selectedCorporate ? selectedCorporate?.ID_CORP_CORPORATE : null,
                                                  ID_RIDER_DEMANDEUR: (selectedCorporate && selectedCorporate.selectedDemandeur) ? selectedCorporate.selectedDemandeur.ID_CORPORATE_CLIENT : null,
                                                  beneficiaires: selectedCorporate ? JSON.stringify(selectedCorporate.selectedBeneficiaires) : null,
                                                  newAmployee: selectedNewEmployee ? JSON.stringify(selectedNewEmployee) : null,
                                                  newDemandeur
                                        }
                                        const res = await fetchApi('/course/courses/hele', {
                                                  method: 'POST',
                                                  headers: { "Content-Type": "application/json" },
                                                  body: JSON.stringify(body)
                                        })
                                        await wait(100)
                                        dispatch(setCourseAction(res.result))
                                        navigation.navigate("Root")
                              } catch (error) {
                                        console.log(error)
                              } finally {
                                        setIsSaving(false)
                              }
                    }
          }, [selectedMode, reverseGeocodingResult, location])
          useEffect(() => {
                    const params = route.params || {}
                    const { mode, corporate, newEmployeCorp, newDemandeur: incNewDemandeur } = params
                    if(newEmployeCorp){
                        setSelectedNewEmployee(newEmployeCorp)
                    } else {
                              setSelectedNewEmployee([])
                    }
                    if(incNewDemandeur) {
                              setNewDemandeur(incNewDemandeur)
                    } else {
                              setNewDemandeur(null)
                    }
                    if(mode) {
                              setSelectedMode(mode)
                    }
                    if(corporate) {
                              setSelectedCorporate(corporate)
                              if(corporate && selectedMode) {
                                        const correpondMode = corporate.modes.find(mode => mode.ID_MODE == selectedMode.ID_CORPORATE)
                                        if(correpondMode) {
                                                  setSelectedMode(correpondMode)
                                        } else {
                                                  setSelectedMode(null)
                                        }
                              }
                    }
          }, [route])
          const displayAmount = selectedMode ?  selectedMode.IS_FIXED ? selectedMode.MONTANT_FIXED : selectedMode.MONTANT_BASE : null
          return (
                    <>
                    {isSaving && <Loading />}
                    {showConfirmModal && <ConfirmModal
                              handleClose={() => setShowConfirmModal(null)}
                              onClose={() => setShowConfirmModal(null)}
                              onDecline={() => setShowConfirmModal(null)}
                              title={intl.formatMessage({ id: 'ConfirmHailingScreen.rueprise' })}
                              body={`${intl.formatMessage({id:"ConfirmHailingScreen.body"})} ${selectedMode.NOM_CORPORATE} ?`}
                              exitLabel={intl.formatMessage({ id: 'DriverMapScreen.Non' })}
                              handleTitle={intl.formatMessage({ id: 'DriverMapScreen.oui' })}
                              onConfirm={startTriping}
                    />}
                    <View style={styles.container}>
                              <View style={styles.header}>
                                        <View style={styles.exiitSearch}>
                                                  <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple('#C4C4C4', true)} onPress={() => navigation.goBack()}>
                                                            <View style={styles.headerBtn}>
                                                                      <Ionicons name="arrow-back-outline" size={24} color="#777" />
                                                            </View>
                                                  </TouchableNativeFeedback>
                                                  <Text style={styles.selectIndicator}>
                                                            {intl.formatMessage({ id: 'ConfirmHailingScreen.rueprise' })}
                                                  </Text>
                                        </View>
                              </View>
                              {loadingModes ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                        <ActivityIndicator animating size={'large'} color={'#777'} />
                              </View> : 
                              <><ScrollView style={styles.corporates}>
                                        <TouchableNativeFeedback onPress={() => navigation.navigate("ModesScreen", { selectedMode, selectedCorporate })} background={TouchableNativeFeedback.Ripple('#C4C4C4')}>
                                                  <View style={styles.corporate}>
                                                            <View style={styles.corporateImageContainer}>
                                                                      <Image source={require("../../../assets/images/car_corporate.png")} style={styles.corporateImage} />
                                                            </View>
                                                            <View style={styles.corporateDetails}>
                                                                      <View style={styles.corporateTop}>
                                                                                <Text style={styles.corporateName} numberOfLines={1}>{intl.formatMessage({ id: 'ConfirmHailingScreen.modecourse' })}</Text>
                                                                                {selectedMode ? <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                                          <Text style={styles.corporateAmount} numberOfLines={1}>{displayAmount ? displayAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") : ''} FBU </Text>
                                                                                          <Entypo name="chevron-small-down" size={24} color="#777" />
                                                                                </View> : null}
                                                                      </View>
                                                                      <View style={styles.corporateBottom}>
                                                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                                          {/* <Ionicons name="ios-person-outline" size={13} color="#777" /> */}
                                                                                          <Text style={[styles.corporateMutedText]} numberOfLines={1}>
                                                                                                    { selectedMode?.NOM_CORPORATE ? selectedMode?.NOM_CORPORATE : intl.formatMessage({ id: 'ConfirmHailingScreen.modeselect' }) }
                                                                                          </Text>
                                                                                          {selectedCorporate ? <Text style={[styles.corporateMutedText, { marginLeft: 2 }]} numberOfLines={1}>
                                                                                                    ({ selectedCorporate.NOM})
                                                                                          </Text> : null}
                                                                                </View>
                                                                      </View>
                                                            </View>
                                                  </View>
                                        </TouchableNativeFeedback>
                                        <TouchableNativeFeedback 
                                        onPress={choixCorporate}
                                        // onPress={() => navigation.navigate("CorporatesScreen", { selectedCorporate, setSelectedNewEmployee:null })} 
                                        background={TouchableNativeFeedback.Ripple('#C4C4C4')}>
                                                  <View style={[styles.corporate, { marginTop: 15 }]}>
                                                            <View style={styles.corporateImageContainer}>
                                                                      <Image source={selectedCorporate?.ICON ? { uri: selectedCorporate?.ICON } : require("../../../assets/images/business.png")} style={[styles.corporateImage, { resizeMode: 'contain'}]} />
                                                            </View>
                                                            <View style={styles.corporateDetails}>
                                                                      <View style={styles.corporateTop}>
                                                                                <Text style={styles.corporateName} numberOfLines={1}> {intl.formatMessage({ id: 'ConfirmHailingScreen.Corporate' })}</Text>
                                                                                <Entypo name="chevron-small-down" size={24} color="#777" />
                                                                      </View>
                                                                      <View style={styles.corporateBottom}>
                                                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                                          {/* <Ionicons name="ios-person-outline" size={13} color="#777" /> */}
                                                                                          <Text style={[styles.corporateMutedText, { marginLeft: 2 }]} numberOfLines={1}>
                                                                                                    { selectedCorporate ? selectedCorporate.NOM : intl.formatMessage({ id: 'ConfirmHailingScreen.selectCorporate' })}
                                                                                          </Text>
                                                                                          <View style={{ marginLeft: 10 }}>
                                                                                                         {selectedCorporate ? <BeneficiairesRender beneficiaires={[...selectedCorporate?.selectedBeneficiaires, ...selectedNewEmployee.map(c => ({ NOM: c.nom, PRENOM: c.prenom }))]} />: null}
                                                                                          </View>
                                                                                </View>
                                                                      </View>
                                                            </View>
                                                  </View>
                                        </TouchableNativeFeedback>
                              </ScrollView>
                              <View style={{ padding: 10 }}>
                                        <TouchableNativeFeedback onPress={() => setShowConfirmModal(true)} disabled={!selectedMode || loadingRerverse}>
                                                  <View style={[styles.submitBtn, { opacity: (!selectedMode || loadingRerverse) ? 0.5 : 1}]}>
                                                            {loadingRerverse ? <ActivityIndicator animating={loadingRerverse} size={'small'} color={'#fff'} /> : null}
                                                            <Text style={styles.submitBtnText}>
                                                                {intl.formatMessage({ id: 'ConfirmHailingScreen.DemarCourse' })}
                                                            </Text>
                                                  </View>
                                        </TouchableNativeFeedback>
                              </View>
                              </>}
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
          corporate: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 10,
                    paddingLeft: 5,
                    paddingVertical: 15,
                    borderRadius: 5,
                    borderWidth: 1,
                    borderColor: '#ddd',
                    elevation: 10,
                    backgroundColor: '#fff',
                    shadowColor: '#c4c4c4'
          },
          corporateImageContainer: {
                    width: 100,
                    height: 50
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
                    fontWeight: 'bold',
                    maxWidth: '80%'
          },
          corporateMutedText: {
                    color: '#777',
                    fontSize: 11,
          },
          corporateAmount: {
                    fontWeight: 'bold'
          },
          submitBtn: {
                    backgroundColor: '#8aa9db',
                    borderRadius: 8,
                    paddingVertical: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center'
          },
          submitBtnText: {
                    textAlign: 'center',
                    color: '#fff',
                    fontWeight: 'bold',
                    marginLeft: 10
          },
})
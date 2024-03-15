import React, { useCallback, useEffect, useState } from "react";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { ActivityIndicator, findNodeHandle, FlatList, Image, StyleSheet, Text, TextInput, TouchableNativeFeedback, TouchableWithoutFeedback, View } from "react-native";
import { Ionicons, MaterialCommunityIcons, Feather, FontAwesome5, AntDesign, MaterialIcons, Entypo } from '@expo/vector-icons';
import debounce from "../../utils/debounce";
import { COLORS } from "../../styles/COLORS";
import { TextField, FilledTextField, InputAdornment, OutlinedTextField } from 'rn-material-ui-textfield'
import fetchApi from "../../helpers/fetchApi";
import { useIntl } from "react-intl";

const Location = ({ location, index, handleInstitutionPress }) => {
          const parts = location.display_name.split(', ')
          const title = parts[0]
          const description = parts.slice(1).join(", ");
          return (
                    <TouchableNativeFeedback onPress={() => handleInstitutionPress(location)}>
                              <View style={styles.institution}>
                                        <View style={styles.institutionLeftSide}>
                                                  <View style={styles.logoContainer}>
                                                            <MaterialCommunityIcons name="map-marker" size={24} color="#fff" />
                                                  </View>
                                                  <View style={styles.institutionDetails}>
                                                            <Text style={styles.institutionName} numberOfLines={1}>
                                                                      {title}
                                                            </Text>
                                                            <Text style={styles.institutionAddress} numberOfLines={1}>
                                                                      {description}
                                                            </Text>
                                                  </View>
                                        </View>
                              </View>
                    </TouchableNativeFeedback>
          )
}
export default function NewFavoriteAdressScreen() {
          const navigation = useNavigation()
          const route = useRoute()
          const [loading, setLoading] = useState(false)
          const [locations, setLocations] = useState([])
          const previousRouteName = navigation.getState().routes[navigation.getState().index - 1].name
          const [isInSearch, setIsInSearch] = useState(true)
          const [q, setQ] = useState('')
          const { Home, Work } = route.params
          const intl = useIntl()

          const handleLocationPress = (location) => {
                    navigation.navigate("AdresseFavorisMapScreen", { location, Home, Work })
          }

          const handleBackPress = useCallback(() => {
                    if (isInSearch) {
                              // setIsInSearch(false)
                              // return false
                    }
                    navigation.goBack()
          }, [isInSearch])
          const handleSearchPress = () => {
                    setIsInSearch(true)
          }
          const debouncedSearch = useCallback(debounce(async searchTerm => {
                    if (searchTerm && searchTerm.trim() != '') {
                              try {
                                        const url = `https://nominatim.openstreetmap.org/search?q=${searchTerm}&format=jsonv2&countrycodes=bi&accept-language=fr`
                                        const res = await fetch(url)
                                        const result = await res.json()
                                        setLocations(result)
                              } catch (error) {
                                        console.log(error)
                              } finally {
                                        setLoading(false)
                              }
                    } else {
                              setLocations([]);
                              setLoading(false);
                    }
          }, 500), [])

          const handleInputChange = (text) => {
                    setLoading(true);
                    setQ(text);
                    debouncedSearch(text);
          };

          useFocusEffect(useCallback(() => {
                    (async () => {
                              try {
                                        // const insts = await fetchApi('/institutions')
                                        // setLocations(insts)
                              } catch (error) {
                                        console.log(error)
                              } finally {
                                        // setLoading(false)
                              }
                    })()
          }, []))
          useEffect(() => {
                    if (!q || q.trim() == '') {
                              setLocations([])
                    }
          }, [q])
          return (
                    <View style={styles.container}>
                              <View style={styles.header}>
                                        <View style={styles.exiitSearch}>
                                                  <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple('#C4C4C4', true)} onPress={handleBackPress}>
                                                            <View style={styles.headerBtn}>
                                                                      <AntDesign name="close" size={24} color={COLORS.primary} />
                                                            </View>
                                                  </TouchableNativeFeedback>
                                                  <Text style={styles.title}>{intl.formatMessage({ id: "AdresseFavorisScreen.Nouvelleadresses" })}</Text>
                                        </View>
                              </View>
                              <View style={styles.inputs}>
                                        <View style={styles.inputContainer}>
                                                  <Feather name="search" size={24} color="#777" />
                                                  <TextInput
                                                            style={styles.searchInput}
                                                            value={q}
                                                            onChangeText={handleInputChange}
                                                            placeholder={intl.formatMessage({ id: "AdresseFavorisScreen.Saisiradresses" })}
                                                            placeholderTextColor={"#777"}
                                                  />
                                                  {q && q.trim() != "" ? <TouchableWithoutFeedback onPress={() => {
                                                            setQ("")
                                                  }}>
                                                            <View style={{}}>
                                                                      <AntDesign name="close" size={22} color={COLORS.primary} />
                                                            </View>
                                                  </TouchableWithoutFeedback> : null}
                                        </View>
                              </View>
                              {(!loading && (!q || q.trim() == "")) ? <View style={styles.adresses}>
                                        <TouchableNativeFeedback onPress={() => navigation.navigate('AdresseFavorisMapScreen', { Home, Work })}>
                                                  <View style={styles.addressBtn}>
                                                            <MaterialCommunityIcons name="target" size={24} color={COLORS.primary} />
                                                            <Text style={styles.adressText}>{intl.formatMessage({ id: "NewFavoriteAdressScreen.positionActuelle" })}</Text>
                                                  </View>
                                        </TouchableNativeFeedback>
                                        <TouchableNativeFeedback onPress={() => navigation.navigate("AdresseFavorisMapScreen", { Home, Work })}>
                                                  <View style={styles.addressBtn}>
                                                            <AntDesign name="pushpino" size={22} color={COLORS.primary} style={{ transform: [{ rotate: "90deg" }] }} />
                                                            <Text style={styles.adressText}>{intl.formatMessage({ id: "NewFavoriteAdressScreen.ChoisirPoint" })}</Text>
                                                  </View>
                                        </TouchableNativeFeedback>
                                        <View style={{ paddingHorizontal: 15 }}>
                                                  <View style={styles.separator} />
                                        </View>
                              </View> : null}
                              {loading ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                        <ActivityIndicator animating size={'large'} color='#000' />
                              </View> :
                                        <FlatList
                                                  data={locations}
                                                  keyExtractor={(item, index) => index}
                                                  renderItem={({ item, index }) => {
                                                            return (
                                                                      <Location location={item} index={index} handleInstitutionPress={handleLocationPress} />
                                                            )
                                                  }}
                                                  keyboardShouldPersistTaps='handled'
                                        />}
                    </View>
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
          title: {
                fontFamily: "Nunito-Bold",
                    marginLeft: 10
          },
          inputs: {
                    paddingHorizontal: 15,
          },
          inputContainer: {
                    width: '100%',
                    paddingHorizontal: 10,
                    borderRadius: 5,
                    borderWidth: 2,
                    borderColor: "#f1f1f1",
                    paddingVertical: 10,
                    flexDirection: 'row',
                    alignItems: 'center'
          },
          searchInput: {
                    flex: 1,
                    marginLeft: 5
          },
          institution: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 15,
                    paddingVertical: 10
          },
          institutionLeftSide: {
                    flexDirection: 'row',
                    alignItems: 'center',
          },
          logoContainer: {
                    width: 50,
                    height: 50,
                    borderRadius: 50,
                    backgroundColor: '#85969F',
                    justifyContent: 'center',
                    alignItems: 'center'
          },
          placeLogo: {
                    width: 30,
                    height: 30,
                    borderRadius: 50,
                    backgroundColor: '#85969F',
                    justifyContent: 'center',
                    alignItems: 'center'
          },
          logoInstitution: {
                    width: '95%',
                    height: '95%',
                    borderRadius: 100
          },
          institutionDetails: {
                    marginLeft: 10,
                    flex: 1
          },
          institutionName: {
                fontFamily: "Nunito-Bold",
                    opacity: 0.8
          },
          institutionAddress: {
                    color: '#777',
                    fontSize: 12,
                    maxWidth: "95%",
                    fontFamily: "Nunito"
          },
          listHeader: {
          },
          adresses: {
                    marginTop: 10
          },
          addressBtn: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 15,
                    paddingVertical: 15
          },
          adressText: {
                    marginLeft: 10,
                    fontFamily: "Nunito-Bold",
                    color: '#777'
          },
          adressSubText: {
                    marginLeft: 10,
                    fontSize: 12,
                    color: '#777'
          },
          separator: {
                    height: 1,
                    width: '100%',
                    backgroundColor: '#f1f1f1'
          }
})
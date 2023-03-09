import React, { useEffect, useState } from "react";
import { ScrollView, TouchableNativeFeedback, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { StyleSheet, Text, View, StatusBar } from "react-native";
import { Ionicons, Entypo, EvilIcons, MaterialIcons, FontAwesome, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { COLORS } from "../../styles/COLORS"
import { useSelector } from "react-redux";
import { userSelector } from "../../store/selectors/userSelector";
import fetchApi from "../../helpers/fetchApi";
import IDS_SERVICE_CATEGORIES from "../../constants/IDS_SERVICE_CATEGORIES"
import { ecommerceCartSelector } from "../../store/selectors/ecommerceCartSelectors";
import { useCallback } from "react";

/**
 * Screen pour faire le choix de votre destination livraison ou faire entre le nouveau livraison avec leurs details
 * @author Vanny Boy <vanny@mediabox.bi>
 * @date 7/03/2023
 * @returns 
 */

export default function ShoppingAdresseScreen() {
        const navigation = useNavigation()
        const user = useSelector(userSelector)
        const [livraisons, setLivraisons] = useState([])
        const [loadingLivraison, setLoadingLivraison] = useState(false)
        const [selectLivraison, setSelectLivraison] = useState(null)
        const route = useRoute()
        const { service, getElements, getAmount} = route.params

        const onSelectDestination = (livraison) => {
                setSelectLivraison(livraison.ID_DETAILS_LIVRAISON)
        }



        useFocusEffect(useCallback(() => {
                (async () => {
                        try {
                                setLoadingLivraison(true)
                                const res = await fetchApi(`/services/livraisons/${user.ID_USER}`)
                                setLivraisons(res.result)
                        } catch (error) {
                                console.log(error)
                        } finally {
                                setLoadingLivraison(false)
                        }
                })()
        }, [user]))

        useFocusEffect(useCallback(() => {
                (async () => {
                    const params = route.params || null
                    const {idLivraison } = params
                    if (idLivraison!=null) {
                        setSelectLivraison(idLivraison)
                    }
                })()
            }, [route]))

        return (
                <View style={styles.container}>
                        <View style={styles.cardHeader}>
                                <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple('#c9c5c5', true)} onPress={() => navigation.goBack()}>
                                        <View style={styles.headerBtn}>
                                                <Ionicons name="arrow-back-sharp" size={24} color="black" />
                                        </View>
                                </TouchableNativeFeedback>
                                <Text style={styles.titlePrincipal}>Choississez votre destination</Text>
                        </View>
                        <ScrollView  keyboardShouldPersistTap="handled" style={{marginBottom:"40%"}}>
                                <View style={styles.cardDestination}>

                                        {loadingLivraison ? <View style={{ flex: 1, justifyContent: 'center', left: 40 }}>
                                                <ActivityIndicator animating={true} size="large" color={"black"} />
                                        </View> :
                                                <>
                                                        {livraisons.map((livraison, index) => {
                                                                return (
                                                                        <TouchableOpacity style={{ ...styles.openSelect, marginTop: 10 }} key={index} onPress={() => onSelectDestination(livraison)}>
                                                                                <View style={{ marginTop: -35 }}>
                                                                                        <EvilIcons name="location" size={24} color="black" />
                                                                                </View>
                                                                                <View style={{ marginLeft: 10, flex: 1 }}>

                                                                                        <Text style={styles.descTitle}>{livraison.NOM} {livraison.PRENOM}</Text>
                                                                                        <View style={styles.activateSelect}>
                                                                                                <Text>{livraison.TELEPHONE}</Text>
                                                                                                <View>
                                                                                                        {selectLivraison == livraison.ID_DETAILS_LIVRAISON ? <MaterialCommunityIcons name="radiobox-marked" size={20} color="#007bff" /> :
                                                                                                                <MaterialCommunityIcons name="radiobox-blank" size={20} color="#777" />}
                                                                                                </View>

                                                                                        </View>
                                                                                        <Text>{livraison.ADRESSE}</Text>
                                                                                </View>
                                                                        </TouchableOpacity>
                                                                )
                                                        })}
                                                </>}



                                        <TouchableOpacity style={{ ...styles.openSelect, marginTop: 10 }}
                                                onPress={() => {
                                                        navigation.navigate("ShippingInfoScreen", {service:service, getElements:getElements, getAmount:getAmount})
                                                }}
                                        >
                                                <AntDesign name="plus" size={22} color="#242F68" />
                                                <View style={styles.cardDescrNouveau}>
                                                        <View style={{ marginLeft: 10 }}>
                                                                <Text style={styles.titeResumer}>Nouvelle destination</Text>
                                                        </View>
                                                        <MaterialIcons name="navigate-next" size={24} color="#242F68" />
                                                </View>

                                        </TouchableOpacity>
                                        <View style={{ ...styles.cardResumer, marginTop: 10 }}>
                                                <Text style={styles.titeResumer}>Resumer</Text>
                                                <View style={styles.cardResumerDescr}>
                                                        <Entypo name="shopping-bag" size={24} color="black" />
                                                        <View style={styles.cardDescrNouveau}>
                                                                <View style={{ marginLeft: 10 }}>
                                                                        <Text>Nombre de pieces achetes</Text>
                                                                </View>
                                                                <Text>{getElements} élément{getElements > 1 && 's'}</Text>
                                                        </View>
                                                </View>
                                                {/* <View style={styles.cardResumerDescr}>
                                                        <FontAwesome name="money" size={24} color="black" />
                                                        <View style={styles.cardDescrNouveau}>
                                                                <View style={{ marginLeft: 10 }}>
                                                                        <Text>Impot dur le TVA</Text>
                                                                </View>
                                                                <Text>1200</Text>
                                                        </View>
                                                </View> */}
                                                <View style={styles.cardResumerDescr}>
                                                        <MaterialIcons name="delivery-dining" size={24} color="black" />
                                                        <View style={styles.cardDescrNouveau}>
                                                                <View style={{ marginLeft: 10 }}>
                                                                        <Text>Livraison</Text>
                                                                </View>
                                                                <Text>0 FBU</Text>
                                                        </View>
                                                </View>
                                        </View>
                                </View>
                        </ScrollView>
                        <View style={styles.cartFooter}>
                                <View style={styles.cartFooterTotals}>
                                        <View style={styles.imageAmount}>
                                                <View style={styles.cartImage}>
                                                        <Image source={require('../../../assets/images/carts.png')} style={styles.image} />
                                                </View>
                                                <View style={styles.cartAmount}>
                                                        <Text style={styles.amountTitle}>Panier</Text>
                                                        <Text style={styles.amount}>{getElements} élément{getElements > 1 && 's'}</Text>
                                                </View>
                                        </View>
                                        <View style={styles.prices}>
                                                <Text style={styles.amountTitle}>{getAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FBU</Text>
                                                <Text style={[styles.amount, { textAlign: "right" }]}>Total</Text>
                                        </View>
                                </View>
                                <TouchableOpacity style={[styles.checkoutBtn, selectLivraison==null && { opacity: 0.5 }]} disabled={selectLivraison==null} onPress={() => navigation.navigate('PaymentScreen', {selectLivraison , service })}>
                                        <Text style={styles.checkoutBtnTitle}>CONTINUER</Text>
                                </TouchableOpacity>
                        </View>
                </View>
        )
}

const styles = StyleSheet.create({
        container: {
                flex: 1,
                backgroundColor: '#F1F1F1',
        },
        cardHeader: {
                flexDirection: 'row',
                paddingHorizontal: 10,
                marginTop: StatusBar.currentHeight,
                height: 60,
                alignContent: "center",
                alignItems: "center"
        },
        headerBtn: {
                padding: 10
        },
        cardDestination: {
                marginHorizontal: 10
        },
        titlePrincipal: {
                fontSize: 16,
                fontWeight: "bold",
                color: COLORS.ecommercePrimaryColor,
                // marginHorizontal: 10
        },
        openSelect: {
                backgroundColor: '#FFF',
                padding: 10,
                borderRadius: 5,
                flexDirection: 'row',
                alignContent: 'center',
                alignItems: 'center',
        },
        cardIcon: {
                justifyContent: "center",
                alignItems: "center",
                alignContent: "center"
        },
        descTitle: {
                fontWeight: "bold"
        },
        cardDescrNouveau: {
                justifyContent: "space-between",
                flexDirection: "row",
                flex: 1
        },
        cartFooter: {
                position: 'absolute',
                bottom: 0,
                backgroundColor: '#fff',
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
                width: "100%",
                padding: 20
        },
        cartFooterTotals: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
        },
        imageAmount: {
                flexDirection: 'row',
                alignItems: 'center',
        },
        cartImage: {
                width: 50,
                height: 50,
                borderRadius: 100,
                backgroundColor: '#F1F1F1',
                justifyContent: 'center',
                alignItems: 'center'
        },
        cartAmount: {
                marginLeft: 10
        },
        amountTitle: {
                fontWeight: 'bold'
        },
        amount: {
                color: '#777',
                fontSize: 15
        },
        checkoutBtn: {
                paddingVertical: 15,
                backgroundColor: COLORS.ecommerceOrange,
                borderRadius: 5,
                marginTop: 10
        },
        checkoutBtnTitle: {
                textAlign: "center",
                color: '#fff',
                fontWeight: "bold"
        },
        cardResumer: {
                backgroundColor: '#FFF',
                padding: 10,
                borderRadius: 5
        },
        cardResumerDescr: {
                flexDirection: "row",
                marginTop: 10
        },
        titeResumer: {
                fontWeight: "bold",
                color: COLORS.ecommercePrimaryColor,
        },
        image: {
                width: "60%",
                height: "60%"
        },
        activateSelect: {
                flexDirection: "row",
                justifyContent: "space-between",
        }

})
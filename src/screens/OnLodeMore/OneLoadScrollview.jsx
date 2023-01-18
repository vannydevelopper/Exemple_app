import React, { useCallback, useRef, useState, useEffect } from "react";
import { Text, View, useWindowDimensions, ImageBackground, StatusBar, StyleSheet, Image, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, TouchableNativeFeedback } from "react-native";
import { EvilIcons, MaterialIcons, AntDesign, Ionicons, MaterialCommunityIcons, FontAwesome, SimpleLineIcons } from '@expo/vector-icons';
import fetchApi from "../../helpers/fetchApi";
import { DrawerActions, useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { CategoriesSkeletons, HomeProductsSkeletons, SubCategoriesSkeletons } from "../../components/ecommerce/skeletons/Skeletons";
import * as Location from 'expo-location';

export default function OneLoadScrollview() {
        const [shops, setShops] = useState([])
        const [IsLoadingMore, setIsLoadingMore] = useState(false)
        const [offset, setOffset] = useState(0)
        const navigation = useNavigation()
        const LIMIT = 10

        const isCloseToBottom = useCallback(({ layoutMeasurement, contentOffset, contentSize }) => {
                const paddingToBottom = 20;
                return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
        }, []);

        const onLoadMore = async () => {
                try {
                        setIsLoadingMore(true)
                        const newOffset = offset + LIMIT
                        const pts = await getProducts(newOffset)
                        setOffset(newOffset)
                        setProducts(p => [...p, ...pts.result])
                } catch (error) {
                        console.log(error)
                } finally {
                        setIsLoadingMore(false)
                }
        }

        const getProducts = useCallback(async (offset = 0) => {
                try {
                        if (firstLoadingProducts == false) {
                                setLoadingProducts(true)
                        }
                        var url = `/products?limit=${LIMIT}&offset=${offset}&`
                        if (selectedCategorie) {
                                url = `/products?category=${selectedCategorie?.ID_CATEGORIE_PRODUIT}&limit=${LIMIT}&offset=${offset}&`
                        }
                        if (selectedsousCategories) {
                                url = `/products?category=${selectedCategorie?.ID_CATEGORIE_PRODUIT}&subCategory=${selectedsousCategories?.ID_PRODUIT_SOUS_CATEGORIE}`
                        }
                        return await fetchApi(url)
                }
                catch (error) {
                        console.log(error)
                }

        }, [selectedCategorie, selectedsousCategories])

        useFocusEffect(useCallback(() => {
                (async () => {
                        try {
                                setOffset(0)
                                const produts = await getProducts(0)
                                setProducts(produts.result)
                        } catch (error) {
                                console.log(error)
                        }
                })()
        }, []))

        useEffect(() => {
                const fecthShops = async (lat, long) => {
                        try {
                                if (firstLoadingProducts == false) {
                                        setLoadingProducts(true)
                                }
                                if (lat && long) {
                                        return await fetchApi(`/partenaire/ecommerce?lat=${lat}&long=${long}`)
                                }
                                else {
                                        return await fetchApi('/partenaire/ecommerce')
                                }
                        }
                        catch (error) {
                                console.log(error)
                        } finally {
                                setFirstLoadingProducts(false)
                                setLoadingProducts(false)
                        }
                }
                const askLocationFetchShops = async () => {
                        let { status } = await Location.requestForegroundPermissionsAsync();
                        if (status !== 'granted') {
                                console.log('Permission to access location was denied');
                                const shops = await fecthShops()
                                setShops(shops.result)
                                setFirstLoadingProducts(false)
                                setLoadingProducts(false)
                                return;
                        }
                        var location = await Location.getCurrentPositionAsync({});
                        const shops = await fecthShops(location.coords.latitude, location.coords.longitude)
                        setShops(shops.result)
                        setFirstLoadingProducts(false)
                        setLoadingProducts(false)
                }
                askLocationFetchShops()

        }, [])
        return (
                <ScrollView
                        onScroll={({ nativeEvent }) => {
                                if (isCloseToBottom(nativeEvent) && !IsLoadingMore && offset <= 40) {
                                        onLoadMore()
                                }
                        }}
                >

                        {/* <TouchableOpacity onPress={() => onCategoryPress(categorie)} style={[styles.category, index == 0 && { marginLeft: 0 }]} key={index}> */}
                        {/* <View style={[styles.categoryPhoto]}> */}
                        {/* <Image source={{ uri: categorie.IMAGE }} style={[styles.DataImageCategorie, { opacity: categorie.ID_CATEGORIE_PRODUIT == selectedCategorie?.ID_CATEGORIE_PRODUIT ? 0.2 : 1 }]} /> */}
                        {/* </View> */}
                        {/* <Text style={[{ fontSize: 8, fontWeight: "bold" }, { color: COLORS.ecommercePrimaryColor }]}>{categorie.NOM}</Text> */}
                        {/* {categorie.ID_CATEGORIE_PRODUIT == selectedCategorie?.ID_CATEGORIE_PRODUIT && <View style={[styles.categoryChecked, { backgroundColor: categorie.ID_CATEGORIE_PRODUIT == selectedCategorie?.ID_CATEGORIE_PRODUIT }]}> */}
                        {/* <AntDesign style={{ marginTop: 20, marginLeft: 20, color: COLORS.ecommercePrimaryColor }} name="check" size={40} color='#000' /> */}
                        {/* </View>} */}
                        {/* </TouchableOpacity> */}

                        <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 10, opacity: IsLoadingMore ? 1 : 0 }}>
                                <ActivityIndicator animating={true} size="large" color={"#000"} />
                        </View>
                </ScrollView>
        )
}
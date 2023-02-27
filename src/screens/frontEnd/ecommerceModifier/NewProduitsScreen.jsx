import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, Keyboard, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableNativeFeedback, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Modalize } from "react-native-modalize";
import { Portal } from "react-native-portalize";
import fetchApi from "../../helpers/fetchApi";
import useFetch from "../../hooks/useFetch";
import { useForm } from "../../hooks/useForm";
import { COLORS } from "../../styles/COLORS";
import { SimpleLineIcons, AntDesign, Ionicons, EvilIcons, Entypo } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFormErrorsHandle } from "../../hooks/useFormErrorsHandle";
import Loading from "../../components/app/Loading";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { useNavigation, useRoute } from "@react-navigation/native";
import { OutlinedTextField } from 'rn-material-ui-textfield'
import NewVariantModalize from "../../components/ecommerce/newProduct/NewVariantModalize";
import cartesian from "../../helpers/cartesian";
import Variant from "../../components/ecommerce/newProduct/Variant";
import { useCallback } from "react";
import InventoryItem from "../../components/ecommerce/newProduct/InventoryItem";
import ShopHeader from "../../components/ecommerce/home/ShopHeader";

const VARIANT_LIMIT = 5
export default function NewProductScreen() {
        const navigation = useNavigation()
        const route = useRoute()
        const [isOpen, setIsOpen] = useState(false)
        const [isSubCategoriesOpen, setIsSubCategoriesOpen] = useState(false)
        const [isNewVariantOpen, setIsNewVariantOpen] = useState(false)
        const [loadingForm, setLoadingForm] = useState(true)
        const [isLoading, setIsLoading] = useState(false)
        const categoriesModalizeRef = useRef(null)
        const subCategoriesModalizeRef = useRef()
        const variantModalizeRef = useRef()
        const [variants, setVariants] = useState([])
        const [inventories, setInventories] = useState([])

        const [openCategorie, setOpenCategorie] = useState(false)
        const [openSousCategorie, setOpenSousCategorie] = useState(false)

        const [category, setCategory] = useState(null)
        const [subCategory, setSubCategory] = useState(null)

        const { shop } = route.params

        const [data, handleChange] = useForm({
                // category: null,
                // subCategory: null,
                nom: "",
                description: "",
                montant: "",
                autresCategorie: null,
                autreSousCategorie: null
        })


        const { errors, setError, getErrors, setErrors, checkFieldData, isValidate, getError, hasError } = useFormErrorsHandle(data, {
                category: {
                        required: true,
                },
                nom: {
                        required: true,
                        length: [2, 100],
                        alpha: true
                },
                description: {
                        length: [1, 3000],
                        alpha: true
                },
                montant: {
                        required: true,
                        length: [1, 11],
                        number: true
                }
        }, {
                produit: {
                        required: "Veuillez choisir le produit",
                },
                category: {
                        required: "Veuillez choisir la catégorie",
                },
                subCategory: {
                        required: "Veuillez choisir le sous-catégorie",
                },
                nom: {
                        required: "Le nom du produit est obligatoire",
                        length: "Le nom du produit est invalide",
                        alpha: "Le nom du produit est invalide"
                },
                description: {
                        length: "La description du produit est invalide",
                        alpha: "Caractères non acceptable"
                },
                quantite: {
                        required: "La quantité est obligatoire",
                        length: "Quantité invalide"
                },
                montant: {
                        required: "Le prix est obligatoire",
                        length: "Prix invalide",
                        number: 'Prix invalide'
                }
        })

        const [categories, setCategories] = useState([])
        const [loadingCategories, setLoadingCategories] = useState(true)

        const [subCategories, setSubCategories] = useState([])
        const [loadingSubCategories, setLoadingSubCategories] = useState(true)

        /**
         * Fonction pour activer le bouton autres categories
         */

        const selectCategorie = (produit) => {
                console.log(produit)
                setCategory(produit)
                setOpenCategorie(false)
                categoriesModalizeRef.current.close()
        }

        const checkAutres = (Autres) => {
                setOpenCategorie(true)
                categoriesModalizeRef.current.close()
                var category = category
                
        }
        const autreCaregorieInput = (autresCategorie) => {
                var category = category
                if (openCategorie) {
                        category = {
                                ID_CATEGORIE_PRODUIT: 'autre',
                                ID_PARTENAIRE_SERVICE: null,
                                IMAGE: null,
                                IS_AUTRE: 1,
                                NOM: autresCategorie
                        }
                }
                setCategory(category)
                categoriesModalizeRef.current.close()
        }

        /**
         * Fonction pour activer le bouton autres sous categories
         */

        const selectSousCategorie = (produit) => {
                setSubCategory(produit)
                setOpenSousCategorie(false)
                subCategoriesModalizeRef.current.close()
        }
        const checkAutresSousCategorie = () => {
                setOpenSousCategorie(true)
                subCategoriesModalizeRef.current.close()
        }
        const autreSousCaregorieInput = (autreSousCategorie) => {
                var subCategory = subCategory
                if (openSousCategorie) {
                        subCategory = {
                                ID_PRODUIT_SOUS_CATEGORIE: 'autre',
                                ID_CATEGORIE_PRODUIT: null,
                                ID_PARTENAIRE_SERVICE: null,
                                IMAGE: null,
                                IS_AUTRE: 1,
                                NOM: autreSousCategorie
                        }
                }
                setSubCategory(subCategory)
                subCategoriesModalizeRef.current.close()
        }


        /**
         * Fonction qui sera déclanchée quand on appui sur le bouton de modifier la variante
         */
        const handleVariantEdit = useCallback((id, variantName, options) => {
                const newVariants = variants.map(variant => {
                        if (variant.id == id) {
                                return {
                                        id, variantName, options
                                }
                        }
                        return variant
                })
                setVariants(newVariants)
        }, [variants])

        /**
         * Fonction qui sera déclanchée quand on appui sur le bouton de supprimer la variante
         */
        const handleVariantDelete = useCallback((id) => {
                const newVariants = variants.filter(variant => variant.id != id)
                setVariants(newVariants)
        }, [variants])

        const handleInventoryEdit = useCallback((id, price, quantity) => {
                const newInventory = inventories.map(env => {
                        if (env.id == id) {
                                return {
                                        id,
                                        price,
                                        quantity,
                                        items: env.items
                                }
                        }
                        return env
                })
                setInventories(newInventory)
        }, [inventories])

        const handleInventoryDelete = useCallback((id) => {
                const newinventory = inventories.filter(inv => inv.id != id)
                setInventories(newinventory)
        }, [inventories])

        const [images, setImages] = useState([])
        const fetchCategories = async () => {
                try {
                        const pdts = await fetchApi('/ecommerce/ecommerce_produits/ecommerce_produit_categorie')
                        setCategories(pdts)
                } catch (error) {
                        console.log(error)
                } finally {
                        setLoadingCategories(false)
                }
        }

        const fetchSubCategories = async () => {
                try {
                        const pdts = await fetchApi(`/ecommerce/ecommerce_produits/ecommerce_produit_sous_categorie/${category.ID_CATEGORIE_PRODUIT}`)
                        setSubCategories(pdts)
                } catch (error) {
                        console.log(error)
                } finally {
                        setLoadingSubCategories(false)
                }
        }

        const onImageSelect = async () => {
                const image = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        quality: 0.6
                });
                if (!image.canceled) {
                        setImages(t => [...t, image.assets[0]])
                }
        }

        const onRemoveImage = index => {
                const newImages = images.filter((_, i) => i != index)
                setImages(newImages)
        }

        const onSubmit = async () => {
                try {
                        setIsLoading(true)
                        Keyboard.dismiss()
                        if (!isValidate()) throw { errors: getErrors() }
                        const form = new FormData()
                        // form.append("ID_PRODUIT", data.produit.ID_PRODUIT)
                        form.append('ID_PARTENAIRE_SERVICE', shop.ID_PARTENAIRE_SERVICE)
                        if (category) {
                                form.append("CATEGORY", JSON.stringify(category))
                        }
                        if (subCategory) {
                                form.append("SUB_CATEGORY", JSON.stringify(subCategory))
                        }
                        form.append("NOM", data.nom)
                        // form.append("QUANTITE_STOCKE", data.quantite)
                        form.append("MONTANT", data.montant)
                        // form.append("DETAIL", JSON.stringify(taille))
                        if (data.DESCRIPTION != "") {
                                form.append("DESCRIPTION", data.description)
                        }
                        if (variants.length > 0) {
                                form.append('variants', JSON.stringify(variants))
                        }
                        if (inventories.length > 0) {
                                form.append('inventories', JSON.stringify(inventories))
                        }
                        // if (ajoutCategorie) {
                        //         form.append("NEW_CATEGORIE", ajoutCategorie)
                        // }
                        // if (ajoutSousCategorie) {
                        //         form.append("NEW_SOUS_CATEGORIE", ajoutSousCategorie)
                        // }
                        if (images.length > 0) {
                                await Promise.all(images.map(async (image, index) => {
                                        const key = `IMAGE_${index + 1}`
                                        const manipResult = image
                                        let localUri = manipResult.uri;
                                        let filename = localUri.split('/').pop();
                                        let match = /\.(\w+)$/.exec(filename);
                                        let type = match ? `image/${match[1]}` : `image`;
                                        form.append(key, {
                                                uri: localUri, name: filename, type
                                        })
                                }))
                        }
                        const newProduct = await fetchApi('/ecommerce/ecommerce_produits', {
                                method: "POST",
                                body: form
                        })
                        navigation.goBack()
                } catch (error) {
                        console.log(error)
                } finally {
                        setIsLoading(false)
                }
        }

        useEffect(() => {
                fetchCategories()
        }, [])

        useEffect(() => {
                if (category) {
                        fetchSubCategories()
                }
        }, [category])

        useEffect(() => {
                if (isOpen) {
                        const timer = setTimeout(() => {
                                setLoadingForm(false)
                        })
                        return () => {
                                clearTimeout(timer)
                        }
                }
                if (isSubCategoriesOpen) {
                        const timer = setTimeout(() => {
                                setLoadingForm(false)
                        })
                        return () => {
                                clearTimeout(timer)
                        }
                }
        }, [isOpen, isSubCategoriesOpen])

        useEffect(() => {
                if (variants.length > 0) {
                        const options = variants.map(variant => {
                                const variantOptions = variant.options.map(option => ({ ...option, variantId: variant.id }))
                                return variantOptions
                        })
                        const result = cartesian(options)
                        const newinventory = result.map((inv, index) => ({
                                id: `${index}_${Date.now()}`,
                                price: data.montant, quantity: 1,
                                items: inv,
                        }))
                        setInventories(newinventory)
                } else {
                        setInventories([])
                }
        }, [variants, data.montant])

        const CategoriesModalize = () => {
                return (
                        (loadingForm || loadingCategories) ? <ActivityIndicator
                                animating
                                size={"small"}
                                color='#777'
                                style={{ alignSelf: 'center', marginBottom: 15, marginTop: 20 }}
                        /> :
                                <View style={styles.modalContainer}>
                                        <View style={styles.modalHeader}>
                                                <Text style={styles.modalTitle}>Les catégories</Text>
                                                {false && <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                        <TouchableOpacity style={{ paddingHorizontal: 5 }}>
                                                                <AntDesign name="search1" size={24} color={COLORS.ecommercePrimaryColor} />
                                                        </TouchableOpacity>
                                                        <TouchableOpacity style={{ paddingHorizontal: 5 }}>
                                                                <SimpleLineIcons name="grid" size={24} color={COLORS.ecommercePrimaryColor} />
                                                        </TouchableOpacity>
                                                </View>}
                                        </View>
                                        {categories.result?.map((produit, index) => {
                                                return (
                                                        <TouchableNativeFeedback
                                                                onPress={() => selectCategorie(produit)}
                                                        >
                                                                <View key={index} style={[styles.modalItem, produit.ID_CATEGORIE_PRODUIT == data.category?.ID_CATEGORIE_PRODUIT && { backgroundColor: '#ddd' }]} >
                                                                        <View style={styles.modalImageContainer}>
                                                                                <Image style={styles.modalImage} source={{ uri: produit.IMAGE }} />
                                                                        </View>
                                                                        <Text style={styles.itemTitle}>{produit.NOM}</Text>
                                                                </View>
                                                        </TouchableNativeFeedback>
                                                )
                                        })}

                                        <TouchableNativeFeedback onPress={()=>checkAutres(Autres)}>
                                                <View style={styles.modalItem}>
                                                        <View style={styles.modalImageContainer}>
                                                        </View>
                                                        <Text style={styles.itemTitle}>Autres</Text>
                                                </View>
                                        </TouchableNativeFeedback>
                                        {/* {openCategorie ? <>
                                                <View style={styles.selectControl}>
                                                        <OutlinedTextField
                                                                label={"Autres Categories"}
                                                                fontSize={13}
                                                                value={data.autresCategorie}
                                                                onChangeText={e => handleChange("autresCategorie", e)}
                                                                // onBlur={() => checkFieldData('nom')}
                                                                // error={hasError('nom') ? getError('nom') : ''}
                                                                lineWidth={0.5}
                                                                activeLineWidth={0.5}
                                                                baseColor={COLORS.smallBrown}
                                                                tintColor={COLORS.primary}
                                                                containerStyle={{ flex: 1, marginTop: 15 }}
                                                                inputContainerStyle={{ borderRadius: 10 }}
                                                        />
                                                </View>
                                                <View style={styles.actionContainer}>
                                                        <TouchableOpacity style={[styles.addBtn]}
                                                                onPress={() => autreCaregorieInput(data.autresCategorie)}
                                                        >
                                                                <Text style={[styles.addBtnText]}>Ajouter</Text>
                                                        </TouchableOpacity>
                                                </View>
                                        </> : null} */}
                                </View>
                )
        }
        const SubCategoriesModalize = () => {
                return (
                        (loadingForm || loadingSubCategories) ?
                                <ActivityIndicator
                                        animating
                                        size={"small"}
                                        color='#777'
                                        style={{ alignSelf: 'center', marginBottom: 15, marginTop: 20 }}
                                />
                                :
                                <View style={styles.modalContainer}>
                                        <View style={styles.modalHeader}>
                                                <Text style={styles.modalTitle}>
                                                        Plus de précision
                                                </Text>
                                                {false && <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                        <TouchableOpacity style={{ paddingHorizontal: 5 }}>
                                                                <AntDesign name="search1" size={24} color={COLORS.ecommercePrimaryColor} />
                                                        </TouchableOpacity>
                                                        <TouchableOpacity style={{ paddingHorizontal: 5 }}>
                                                                <SimpleLineIcons name="grid" size={24} color={COLORS.ecommercePrimaryColor} />
                                                        </TouchableOpacity>
                                                </View>}
                                        </View>
                                        {subCategories.result?.map((produit, index) => {
                                                return (
                                                        <TouchableNativeFeedback key={produit.ID_PRODUIT_SOUS_CATEGORIE}
                                                                onPress={() => selectSousCategorie(produit)}
                                                        // onPress={() => {
                                                        //         handleChange("subCategory", produit)
                                                        //         subCategoriesModalizeRef.current.close()
                                                        // }}
                                                        >
                                                                <View style={[styles.modalItem, produit.ID_PRODUIT_SOUS_CATEGORIE == data.subCategory?.ID_PRODUIT_SOUS_CATEGORIE && { backgroundColor: '#ddd' }]}>
                                                                        <Text style={[styles.itemTitle, { marginLeft: 0, fontWeight: "normal" }]}>{produit.NOM}</Text>
                                                                </View>
                                                        </TouchableNativeFeedback>
                                                )
                                        })}
                                        <TouchableNativeFeedback onPress={checkAutresSousCategorie}>
                                                <View style={styles.modalItem}>
                                                        <Text style={[styles.itemTitle, { marginLeft: 0, fontWeight: "normal" }]}>Autres</Text>
                                                </View>
                                        </TouchableNativeFeedback>
{/* 
                                        {openSousCategorie ? <>
                                                <View style={styles.selectControl}>
                                                        <OutlinedTextField
                                                                label={"Autres Categories"}
                                                                fontSize={13}
                                                                value={data.autreSousCategorie}
                                                                onChangeText={e => handleChange("autreSousCategorie", e)}
                                                                // onBlur={() => checkFieldData('nom')}
                                                                // error={hasError('nom') ? getError('nom') : ''}
                                                                lineWidth={0.5}
                                                                activeLineWidth={0.5}
                                                                baseColor={COLORS.smallBrown}
                                                                tintColor={COLORS.primary}
                                                                containerStyle={{ flex: 1, marginTop: 15 }}
                                                                inputContainerStyle={{ borderRadius: 10 }}
                                                        />
                                                </View>
                                                <View style={styles.actionContainer}>
                                                        <TouchableOpacity style={[styles.addBtn]}
                                                                onPress={() => autreSousCaregorieInput(data.autreSousCategorie)}
                                                        >
                                                                <Text style={[styles.addBtnText]}>Ajouter</Text>
                                                        </TouchableOpacity>
                                                </View>
                                        </> : null} */}
                                </View>
                )
        }
        return (
                <>
                        <ShopHeader options={{ title: shop.NOM_ORGANISATION }} />
                        <ScrollView style={styles.container} keyboardShouldPersistTaps='always'>
                                {isLoading && <Loading />}
                                <View style={styles.selectControl}>
                                        <OutlinedTextField
                                                label={"Nom du produit"}
                                                fontSize={13}
                                                value={data.nom}
                                                onChangeText={e => handleChange("nom", e)}
                                                onBlur={() => checkFieldData('nom')}
                                                error={hasError('nom') ? getError('nom') : ''}
                                                lineWidth={0.5}
                                                activeLineWidth={0.5}
                                                baseColor={COLORS.smallBrown}
                                                tintColor={COLORS.primary}
                                                containerStyle={{ flex: 1, marginTop: 15 }}
                                                inputContainerStyle={{ borderRadius: 10 }}
                                        />
                                </View>
                                <View style={styles.selectControl}>
                                        <TouchableOpacity style={styles.selectContainer} onPress={() => {
                                                setIsOpen(true)
                                                categoriesModalizeRef.current?.open()
                                                Keyboard.dismiss()
                                        }}>
                                                <View style={{}}>
                                                        <Text style={[styles.selectLabel]}>
                                                                Catégorie
                                                        </Text>
                                                        {category ? <Text style={[styles.selectedValue, { color: '#333' }]}>
                                                                {category.NOM}
                                                        </Text> : null}
                                                </View>
                                                <EvilIcons name="chevron-down" size={30} color="#777" />
                                        </TouchableOpacity>
                                </View>
                                {openCategorie ? <View style={styles.selectControl}>
                                        <OutlinedTextField
                                                label={"Autres Categories"}
                                                fontSize={13}
                                                value={data.autresCategorie}
                                                onChangeText={e => handleChange("autresCategorie", e)}
                                                // onBlur={() => checkFieldData('nom')}
                                                // error={hasError('nom') ? getError('nom') : ''}
                                                lineWidth={0.5}
                                                activeLineWidth={0.5}
                                                baseColor={COLORS.smallBrown}
                                                tintColor={COLORS.primary}
                                                containerStyle={{ flex: 1, marginTop: 15 }}
                                                inputContainerStyle={{ borderRadius: 10 }}
                                        />
                                </View> : null}
                                {category ? <View style={styles.selectControl}>
                                        <TouchableOpacity style={styles.selectContainer} onPress={() => {
                                                setIsSubCategoriesOpen(true)
                                                subCategoriesModalizeRef.current?.open()
                                                Keyboard.dismiss()
                                        }}>
                                                <View style={{}}>
                                                        <Text style={[styles.selectLabel]}>
                                                                Plus de précision
                                                        </Text>
                                                        {subCategory ? <Text style={[styles.selectedValue, { color: '#333' }]}>
                                                                {subCategory.NOM}
                                                        </Text> : null}
                                                </View>
                                                <EvilIcons name="chevron-down" size={30} color="#777" />
                                        </TouchableOpacity>
                                </View> : null}
                                {openSousCategorie ? <View style={styles.selectControl}>
                                        <OutlinedTextField
                                                label={"Autres Categories"}
                                                fontSize={13}
                                                value={data.autreSousCategorie}
                                                onChangeText={e => handleChange("autreSousCategorie", e)}
                                                // onBlur={() => checkFieldData('nom')}
                                                // error={hasError('nom') ? getError('nom') : ''}
                                                lineWidth={0.5}
                                                activeLineWidth={0.5}
                                                baseColor={COLORS.smallBrown}
                                                tintColor={COLORS.primary}
                                                containerStyle={{ flex: 1, marginTop: 15 }}
                                                inputContainerStyle={{ borderRadius: 10 }}
                                        />
                                </View> : null}
                                <View style={styles.selectControl}>
                                        <OutlinedTextField
                                                label={"Prix du produit"}
                                                fontSize={13}
                                                value={data.montant}
                                                onChangeText={e => handleChange("montant", e)}
                                                onBlur={() => {
                                                        checkFieldData('montant')
                                                }}
                                                error={hasError('montant') ? getError('montant') : ''}
                                                lineWidth={0.5}
                                                activeLineWidth={0.5}
                                                baseColor={COLORS.smallBrown}
                                                tintColor={COLORS.primary}
                                                containerStyle={{ flex: 1, marginTop: 15, }}
                                                inputContainerStyle={{ borderRadius: 10 }}
                                                keyboardType="decimal-pad"
                                                suffix="FBU"
                                        />
                                </View>
                                <View style={styles.selectControl}>
                                        <OutlinedTextField
                                                label={"Description du produit"}
                                                fontSize={13}
                                                value={data.description}
                                                onChangeText={e => handleChange("description", e)}
                                                onBlur={() => checkFieldData('description')}
                                                error={hasError('description') ? getError('description') : ''}
                                                lineWidth={0.5}
                                                activeLineWidth={0.5}
                                                baseColor={COLORS.smallBrown}
                                                tintColor={COLORS.primary}
                                                containerStyle={{ flex: 1, marginTop: 15, }}
                                                inputContainerStyle={{ borderRadius: 10 }}
                                                multiline
                                        />
                                </View>
                                <View style={[styles.selectControl, { marginTop: 10 }]}>
                                        <Text style={styles.sectionTitle}>Images du produit</Text>
                                        <View style={styles.images}>
                                                {images.map((image, index) => {
                                                        return (
                                                                <TouchableWithoutFeedback onPress={() => onRemoveImage(index)} key={index}>
                                                                        <Image style={[styles.addImager, index > 0 && { marginLeft: 10 }]} source={{ uri: image.uri }} />
                                                                </TouchableWithoutFeedback>
                                                        )
                                                })}
                                                {images.length < 3 ? <TouchableWithoutFeedback onPress={onImageSelect}>
                                                        <View style={[styles.addImager, images.length > 0 && { marginLeft: 10 }]}>
                                                                <Feather name="image" size={30} color="#777" />
                                                        </View>
                                                </TouchableWithoutFeedback> : null}
                                        </View>
                                </View>
                                {(data.montant != '' && parseInt(data.montant) > 0) ? <View style={styles.variantsSection}>
                                        <Text style={styles.sectionTitle}>Les variantes</Text>
                                        {variants.length > 0 ? <View style={styles.variants}>
                                                {variants.map((variant, index) => {
                                                        return (
                                                                <Variant variant={variant} key={index} index={index} handleVariantEdit={handleVariantEdit} handleVariantDelete={handleVariantDelete} />
                                                        )
                                                })}
                                        </View> : null}
                                        {variants.length < VARIANT_LIMIT ? <View>
                                                <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple('#C4C4C4')} useForeground onPress={() => {
                                                        setIsNewVariantOpen(true)
                                                        variantModalizeRef.current.open()
                                                }}>
                                                        <View style={styles.addVariantBtn}>
                                                                <AntDesign name="pluscircleo" size={22} color="#777" style={{ fontWeight: "bold" }} />
                                                                <Text style={styles.addVariantText}>Ajouter une variante</Text>
                                                        </View>
                                                </TouchableNativeFeedback>
                                        </View> : null}
                                </View> : null}
                                {inventories.length > 0 ? <View style={[styles.variantsSection, { marginTop: 10 }]}>
                                        <Text style={styles.sectionTitle}>Votre inventaire</Text>
                                        <View style={styles.inventories}>
                                                {inventories.map((inventory, index) => {
                                                        return <InventoryItem inventory={inventory} SERVICE={shop.ID_SERVICE} key={index} index={index} handleInventoryDelete={handleInventoryDelete} handleInventoryEdit={handleInventoryEdit} />
                                                })}
                                        </View>
                                </View> : null}
                        </ScrollView>
                        <View style={styles.actionContainer}>
                                <TouchableOpacity style={[styles.addBtn, (!isValidate() || images.length == 0) && { opacity: 0.5 }]} onPress={onSubmit} disabled={!isValidate() || images.length == 0}>
                                        <Text style={[styles.addBtnText]}>Publier le produit</Text>
                                </TouchableOpacity>
                        </View>
                        <Portal>
                                <GestureHandlerRootView style={{ height: isOpen ? '100%' : 0, opacity: isOpen ? 1 : 0, backgroundColor: 'rgba(0, 0, 0, 0)', position: 'absolute', width: '100%', zIndex: 1 }}>
                                        <Modalize
                                                ref={categoriesModalizeRef}
                                                adjustToContentHeight
                                                handlePosition='inside'
                                                modalStyle={{
                                                        borderTopRightRadius: 10,
                                                        borderTopLeftRadius: 10,
                                                        paddingVertical: 20
                                                }}
                                                handleStyle={{ marginTop: 10 }}
                                                scrollViewProps={{
                                                        keyboardShouldPersistTaps: "handled"
                                                }}
                                                onClosed={() => {
                                                        setIsOpen(false)
                                                        setLoadingForm(true)
                                                }}
                                        >
                                                <CategoriesModalize />
                                        </Modalize>
                                </GestureHandlerRootView>
                        </Portal>
                        <Portal>
                                <GestureHandlerRootView style={{ height: isSubCategoriesOpen ? '100%' : 0, opacity: isSubCategoriesOpen ? 1 : 0, backgroundColor: 'rgba(0, 0, 0, 0)', position: 'absolute', width: '100%', zIndex: 1 }}>
                                        <Modalize
                                                ref={subCategoriesModalizeRef}
                                                adjustToContentHeight
                                                handlePosition='inside'
                                                modalStyle={{
                                                        borderTopRightRadius: 15,
                                                        borderTopLeftRadius: 15,
                                                        paddingVertical: 20
                                                }}
                                                handleStyle={{ marginTop: 10 }}
                                                scrollViewProps={{
                                                        keyboardShouldPersistTaps: "handled"
                                                }}
                                                onClosed={() => {
                                                        setIsSubCategoriesOpen(false)
                                                        setLoadingForm(true)
                                                }}
                                        >
                                                <SubCategoriesModalize />
                                        </Modalize>
                                </GestureHandlerRootView>
                        </Portal>
                        <NewVariantModalize
                                variantModalizeRef={variantModalizeRef}
                                onVariantSubmit={(variantName, options) => {
                                        setVariants(t => [...t, {
                                                id: `${variantName[0]}_${Date.now()}`,
                                                variantName,
                                                options
                                        }])
                                }}
                                isNewVariantOpen={isNewVariantOpen}
                                setIsNewVariantOpen={setIsNewVariantOpen}
                                serviceCategory={shop.ID_SERVICE}
                        />
                </>
        )
}
const styles = StyleSheet.create({
        container: {
                flex: 1
        },
        header: {
                paddingHorizontal: 10,
                paddingVertical: 10
        },
        title: {
                fontWeight: "bold",
                fontSize: 18
        },
        selectControl: {
                paddingHorizontal: 10
        },
        product: {
                maxWidth: 900,
                maxHeight: 80,
                backgroundColor: '#F1F1F1',
                borderRadius: 10,
                marginVertical: 10,
                marginHorizontal: 10,
        },
        quantite: {
                color: '#777',
                fontSize: 12,
                lineHeight: 22,
                fontWeight: "bold"
        },
        valeur: {
                color: '#777',
                fontSize: 30,
                lineHeight: 40,
                fontWeight: 'bold',
                textAlign: "center"
        },
        selectContainer: {
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
        selectLabel: {
                color: '#777',
                fontSize: 13
        },
        selectedLabelContainer: {
                borderWidth: 1,
                borderColor: '#ddd',
                padding: 10,
                borderRadius: 5,
                marginTop: 2,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between"
        },
        modalTitle: {
                fontWeight: "bold",
                textAlign: "center",
                marginTop: 10,
                fontSize: 16
        },
        modalHeader: {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 10,
                paddingVertical: 5
        },
        searchInput: {
                borderRadius: 5,
                borderWidth: 1,
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderColor: COLORS.smallBrown
        },
        newProductBtn: {
                backgroundColor: COLORS.ecommerceOrange,
                paddingVertical: 8,
                paddingHorizontal: 15,
                flexDirection: "row",
                alignItems: "center",
                borderRadius: 5
        },
        newProductText: {
                textAlign: 'center',
                color: '#fff',
                fontWeight: 'bold'
        },
        modalItem: {
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 10,
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: '#F1F1F1'
        },
        modalImageContainer: {
                width: 60,
                height: 60,
                backgroundColor: '#F1F1F1',
                borderRadius: 60,
                justifyContent: "center",
                alignItems: "center"
        },
        modalImage: {
                width: "85%",
                height: "85%",
                resizeMode: "center",
                borderRadius: 100,
        },
        itemTitle: {
                fontWeight: "bold",
                marginLeft: 10
        },
        input: {
                borderRadius: 5,
                borderWidth: 0.5,
                borderColor: '#777',
                height: 50,
                color: '#333',
                paddingHorizontal: 10
        },
        actionContainer: {
                paddingHorizontal: 10
        },
        addBtn: {
                paddingVertical: 10,
                width: "100%",
                alignSelf: "center",
                backgroundColor: COLORS.ecommercePrimaryColor,
                borderRadius: 10,
                paddingVertical: 15,
                marginBottom: 10,
                marginTop: 10
        },
        addBtnText: {
                color: '#FFF',
                fontWeight: "bold",
                textAlign: "center",
        },
        addImager: {
                width: 100,
                height: 100,
                backgroundColor: '#F1F1F1',
                borderRadius: 8,
                justifyContent: "center",
                alignItems: "center",
                marginTop: 5,
        },
        images: {
                flexDirection: "row"
        },
        variantsSection: {
                paddingHorizontal: 10,
                marginTop: 10
        },
        variants: {
                borderWidth: 0.5,
                borderColor: '#777',
                borderBottomWidth: 0,
                borderRadius: 5,
                marginTop: 5
        },
        sectionTitle: {
                fontSize: 16
        },
        addVariantBtn: {
                borderColor: '#777',
                borderWidth: 0.5,
                borderRadius: 5,
                padding: 10,
                marginTop: 5,
                overflow: "hidden",
                flexDirection: 'row',
                alignItems: "center",
        },
        addVariantText: {
                color: '#777',
                marginLeft: 5,
                fontWeight: "bold"
        },
        variantBtn: {
                borderColor: '#777',
                borderBottomWidth: 0.5,
                padding: 10,
                overflow: "hidden",
                flexDirection: 'row',
                alignItems: "center",
                justifyContent: "space-between",
                borderRadius: 5
        },
        variantText: {
                color: '#777'
        },
        inventories: {
                borderWidth: 0.5,
                borderColor: '#777',
                borderBottomWidth: 0,
                borderRadius: 5,
                marginTop: 5
        },
})
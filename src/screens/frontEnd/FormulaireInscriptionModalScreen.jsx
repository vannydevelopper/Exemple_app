import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableNativeFeedback, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { TextField, FilledTextField, InputAdornment, OutlinedTextField } from 'rn-material-ui-textfield'
import { Modalize } from "react-native-modalize";
import { Portal } from "react-native-portalize";
import useFetch from "../../hooks/useFetch";
import { useForm } from "../../hooks/useForm";
import { COLORS } from "../../styles/COLORS";
import { SimpleLineIcons, AntDesign, Ionicons, Octicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFormErrorsHandle } from "../../hooks/useFormErrorsHandle";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import fetchApi from "../../helpers/fetchApi";
import Loading from "../../components/app/Loading"



export default function FormulaireInscriptionModalScreen() {
        const navigation = useNavigation()
        const route = useRoute()
        const { product, partenaire } = route.params
        // console.log(product)

        const couleurModalizeRef = useRef(null)
        const tailleModalizeRef = useRef(null)
        const ajoutDetailsModalizeRef = useRef(null)
        const categoriesModalizeRef = useRef(null)
        const SousCategoriesModalizeRef = useRef(null)

        const [logoImage, setLogoImage] = useState(null)
        const [logoImage2, setLogoImage2] = useState(null)
        const [logoImage3, setLogoImage3] = useState(null)

        const [TailleSelect, setTailleSelect] = useState(null)
        const [selectedCouleur, setselectedCouleur] = useState(null)
        const [CategorieSelect, setCategorieSelect] = useState(null)
        const [selectedSousCategorie, setselectedSousCategorie] = useState(null)

        const [showAUtresTaille, setShowAUtresTaille] = useState(false)
        const [showAUtresCouleur, setShowAUtresCouleur] = useState(false)

        const [categories, setCategories] = useState([])
        const [souscategories, setSouscategories] = useState([])
        const [couleurs, setCouleur] = useState([])
        const [tailles, setTaille] = useState([])

        const [detailData, setDetailData] = useState([])
        const [autreTailles, setAutreTailles] = useState("")
        const [autreCouleurs, setAutreCouleurs] = useState("")

        const [loading, setLoading] = useState(false);

        // console.log(detailData)

        const [data, handleChange, setValue] = useForm({
                TailleSelect: null,
                selectedCouleur: null,
                CategorieSelect: null,
                selectedSousCategorie: null,
                produit: "",
                prix:"",
                prixNouveau:"",
                quantite: "",
                logoImage: "",
                autresTaille: "",
                autresCouleur: ""
        })

        // console.log(detailData)

        const { checkFieldData, isValidate, getError, hasError } = useFormErrorsHandle(data, {
                quantite: {
                        required: true,

                },
        }, {
                quantite: {
                        required: "Quantite est obligatoire"
                },
        })

        useEffect(() => {
                (async () => {
                        try {
                                const catego = await fetchApi("/produit/categorie")
                                setCategories(catego.result)
                                //  console.log(catego.result)
                        } catch (error) {
                                console.log(error)
                        } finally {

                        }
                })()
        }, [])

        useEffect(() => {
                (async () => {
                        try {
                                if (CategorieSelect != null) {
                                        var sousCatego = await fetchApi(`/produit/sous_categorie/${CategorieSelect.ID_CATEGORIE_PRODUIT}`)
                                        setSouscategories(sousCatego.result)
                                }
                                console.log(sousCatego.result)

                        }
                        catch (error) {
                                console.log(error)
                        } finally {

                        }
                })()
        }, [CategorieSelect])

        useEffect(() => {
                (async () => {
                        try {
                                var taille = await fetchApi(`/produit/taille?ID_CATEGORIE_PRODUIT=${CategorieSelect.ID_CATEGORIE_PRODUIT}`)
                                if (selectedSousCategorie != null) {
                                        var taille = await fetchApi(`/produit/taille?ID_CATEGORIE_PRODUIT=${CategorieSelect.ID_CATEGORIE_PRODUIT}&ID_PRODUIT_SOUS_CATEGORIE=${selectedSousCategorie.ID_PRODUIT_SOUS_CATEGORIE}`)
                                        setTaille(taille.result)
                                }
                                // console.log(taille.result)
                        }
                        catch (error) {
                                console.log(error)
                        } finally {

                        }
                })()
        }, [CategorieSelect, selectedSousCategorie])

        useEffect(() => {
                (async () => {
                        try {
                                var couleur = await fetchApi(`/produit/couleur?ID_CATEGORIE_PRODUIT=${CategorieSelect.ID_CATEGORIE_PRODUIT}`)
                                if (selectedSousCategorie != null) {
                                        var couleur = await fetchApi(`/produit/couleur?ID_CATEGORIE_PRODUIT=${CategorieSelect.ID_CATEGORIE_PRODUIT}&ID_PRODUIT_SOUS_CATEGORIE=${selectedSousCategorie.ID_PRODUIT_SOUS_CATEGORIE}`)
                                        setCouleur(couleur.result)
                                }

                                // console.log(couleur.result)
                        }
                        catch (error) {
                                console.log(error)
                        } finally {

                        }

                })()
        }, [CategorieSelect, selectedSousCategorie])

        const onCouleurSelect = (couleur) => {
                setselectedCouleur(couleur)
                setShowAUtresCouleur(false)
                couleurModalizeRef.current.close()
        }

        const onTaillesSelect = (taille) => {
                setTailleSelect(taille)
                setShowAUtresTaille(false)
                tailleModalizeRef.current.close()
        }

        const onCategorieSelect = (categorie) => {
                setCategorieSelect(categorie)
                categoriesModalizeRef.current.close()
        }

        const onSousCategorieSelect = (souscategorie) => {
                setselectedSousCategorie(souscategorie)
                SousCategoriesModalizeRef.current.close()
        }

        const AutresTypesTaille = () => {
                setShowAUtresTaille(true)
                setTailleSelect(null)
        }

        const AutresTypesCouleurs = () => {
                setShowAUtresCouleur(true)
                setselectedCouleur(false)

        }

        const onImagesSelect = async () => {
                const photo = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        allowsMultipleSelection: true
                })
                if (photo.cancelled) {
                        return false
                }
                setLogoImage(photo)
        }

        const onImages2Select = async () => {
                const photo = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        allowsMultipleSelection: true
                })
                if (photo.cancelled) {
                        return false
                }
                setLogoImage2(photo)
        }

        const onImages3Select = async () => {
                const photo = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        allowsMultipleSelection: true
                })
                if (photo.cancelled) {
                        return false
                }
                setLogoImage3(photo)
        }

        const Ajouter_detail = () => {
                var taille = TailleSelect
                var coul = selectedCouleur
                if (showAUtresTaille) {
                        taille = {
                                ID_TAILLE: 'autre',
                                TAILLE: autreTailles
                        }
                }
                if (showAUtresCouleur) {
                        coul = {
                                ID_COULEUR: 'autre',
                                COULEUR: autreCouleurs
                        }
                }
                setDetailData(t => [...t, {
                        quantite: data.quantite,
                        TailleSelect: taille,
                        selectedCouleur: coul
                }])
                ajoutDetailsModalizeRef.current.close()
        }

        const ajoutTailleInput = (autresTaille) => {
                setAutreTailles(autresTaille)
                tailleModalizeRef.current.close()
        }

        const autreCouleurInput = (autresCouleur) => {
                setAutreCouleurs(autresCouleur)
                couleurModalizeRef.current.close()
        }
        const SendData = async () => {
                setLoading(true)
                try {
                        const form = new FormData()
                        if (product) {
                                form.append('PRODUIT', JSON.stringify(product))
                                form.append('ID_PARTENAIRE_SERVICE', partenaire)
                                form.append('PRIXNOUVEAU', data.prixNouveau)

                        } else {
                                form.append('ID_CATEGORIE_PRODUIT', CategorieSelect.ID_CATEGORIE_PRODUIT)
                                form.append('ID_PRODUIT_SOUS_CATEGORIE', selectedSousCategorie.ID_PRODUIT_SOUS_CATEGORIE)
                                form.append('NOM', data.produit)
                                form.append('PRIX', data.prix)
                                form.append('ID_PARTENAIRE_SERVICE', partenaire)
                                if (logoImage) {
                                        const manipResult = await manipulateAsync(
                                                logoImage.uri,
                                                [
                                                        { resize: { width: 500 } }
                                                ],
                                                { compress: 0.8, format: SaveFormat.JPEG }
                                        );
                                        let localUri = manipResult.uri;
                                        let filename = localUri.split('/').pop();
                                        let match = /\.(\w+)$/.exec(filename);
                                        let type = match ? `image/${match[1]}` : `image`;
                                        form.append('IMAGE_1', {
                                                uri: localUri, name: filename, type
                                        })

                                }
                                if (logoImage2) {
                                        const manipResult = await manipulateAsync(
                                                logoImage2.uri,
                                                [
                                                        { resize: { width: 500 } }
                                                ],
                                                { compress: 0.8, format: SaveFormat.JPEG }
                                        );
                                        let localUri = manipResult.uri;
                                        let filename = localUri.split('/').pop();
                                        let match = /\.(\w+)$/.exec(filename);
                                        let type = match ? `image/${match[1]}` : `image`;
                                        form.append('IMAGE_2', {
                                                uri: localUri, name: filename, type
                                        })

                                }
                                if (logoImage3) {
                                        const manipResult = await manipulateAsync(
                                                logoImage3.uri,
                                                [
                                                        { resize: { width: 500 } }
                                                ],
                                                { compress: 0.8, format: SaveFormat.JPEG }
                                        );
                                        let localUri = manipResult.uri;
                                        let filename = localUri.split('/').pop();
                                        let match = /\.(\w+)$/.exec(filename);
                                        let type = match ? `image/${match[1]}` : `image`;
                                        form.append('IMAGE_3', {
                                                uri: localUri, name: filename, type
                                        })

                                }
                        }
                        form.append('DETAIL', JSON.stringify(detailData))

                        // console.log(form)
                        const res = await fetchApi("/produit/stock/create", {
                                method: "POST",
                                body: form
                        })
                        navigation.navigate("EcommerceHomeScreen", { partenaire: false })
                }

                catch (error) {
                        console.log(error)
                }
                finally {
                        setLoading(false);
                }

        }


        return (
                <>
                        {loading && <Loading />}
                        <View style={styles.container}>
                                <View style={styles.cardHeader}>
                                        <TouchableOpacity style={styles.menuOpener} onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}>
                                                <View style={styles.menuOpenerLine} />
                                                <View style={[styles.menuOpenerLine, { width: 15 }]} />
                                                <View style={[styles.menuOpenerLine, { width: 25 }]} />
                                        </TouchableOpacity>
                                        <View style={styles.imageContainer}>
                                                <Image source={require('../../../assets/images/chapchap.png')} style={styles.logo} />
                                        </View>
                                        <View style={{ marginTop: 25 }}>
                                                <Octicons name="bell" size={24} color={COLORS.primary} />
                                        </View>
                                        {/* <TouchableOpacity style={{ marginTop: 25 }} onPress={() => navigation.goBack()}>
                                                <Octicons name="bell" size={24} color={COLORS.primary} />
                                        </TouchableOpacity> */}
                                </View>
                                <Text style={styles.title}>Nouveau produit</Text>
                                <ScrollView keyboardShouldPersistTaps="handled" style={{ marginBottom: 20 }}>
                                        <View>

                                                {product == false ?
                                                        <View>
                                                                <View style={styles.inputCard}>
                                                                        <OutlinedTextField
                                                                                label={"Nom du produit"}
                                                                                fontSize={14}
                                                                                value={data.produit}
                                                                                onChangeText={(newValue) => handleChange('produit', newValue)}
                                                                                onBlur={() => checkFieldData('produit')}
                                                                                error={hasError('produit') ? getError('produit') : ''}
                                                                                lineWidth={0.5}
                                                                                activeLineWidth={0.5}
                                                                                baseColor={COLORS.smallBrown}
                                                                                tintColor={COLORS.primary}
                                                                        />
                                                                </View>
                                                                <View>
                                                                        <TouchableOpacity style={{ ...styles.modalCard, marginHorizontal: 20 }}
                                                                                onPress={() => categoriesModalizeRef.current.open()}
                                                                        // disabled={service.id_service == 2}
                                                                        >
                                                                                <View >
                                                                                        <Text style={[styles.inputText, { fontSize: 13 }]}>
                                                                                                Categorie
                                                                                        </Text>
                                                                                        {CategorieSelect && <Text style={[styles.inputText, { color: '#000' }]}>
                                                                                                {CategorieSelect.NOM}
                                                                                        </Text>}
                                                                                </View>
                                                                                <AntDesign name="caretdown" size={20} color="#777" />
                                                                        </TouchableOpacity>
                                                                </View>
                                                                <View>
                                                                        <TouchableOpacity style={{ ...styles.modalCard, marginHorizontal: 20, marginTop: 10 }}
                                                                                onPress={() => SousCategoriesModalizeRef.current.open()}
                                                                        // disabled={service.id_service == 2}
                                                                        >
                                                                                <View >
                                                                                        <Text style={[styles.inputText, { fontSize: 13 }]}>
                                                                                                Sous Categorie
                                                                                        </Text>
                                                                                        {selectedSousCategorie && <Text style={[styles.inputText, { color: '#000' }]}>
                                                                                                {selectedSousCategorie.NOM}
                                                                                        </Text>}
                                                                                </View>
                                                                                <AntDesign name="caretdown" size={20} color="#777" />
                                                                        </TouchableOpacity>
                                                                </View>
                                                                <View style={styles.inputCard}>
                                                                        <OutlinedTextField
                                                                                label={"Entrez votre prix"}
                                                                                fontSize={14}
                                                                                value={data.prix}
                                                                                onChangeText={(newValue) => handleChange('prix', newValue)}
                                                                                onBlur={() => checkFieldData('prix')}
                                                                                error={hasError('prix') ? getError('prix') : ''}
                                                                                lineWidth={0.5}
                                                                                activeLineWidth={0.5}
                                                                                baseColor={COLORS.smallBrown}
                                                                                tintColor={COLORS.primary}
                                                                        />
                                                                </View>
                                                        </View>
                                                        :
                                                        <View>
                                                                <View style={{ marginBottom: 10 }}>
                                                                        <View style={{ ...styles.modalCard, marginHorizontal: 20 }}>
                                                                                <View >
                                                                                        <Text style={[styles.inputText, { fontSize: 13 }]}>
                                                                                                Produit
                                                                                        </Text>
                                                                                        <Text style={[styles.inputText, { color: '#000' }]}>
                                                                                                {product.produit.NOM}
                                                                                        </Text>
                                                                                </View>
                                                                        </View>
                                                                </View>
                                                                <View style={{ marginBottom: 10 }}>
                                                                        <View style={{ ...styles.modalCard, marginHorizontal: 20 }}>
                                                                                <View >
                                                                                        <Text style={[styles.inputText, { fontSize: 13 }]}>
                                                                                                Categorie
                                                                                        </Text>
                                                                                        <Text style={[styles.inputText, { color: '#000' }]}>
                                                                                                {product.produit.NOM_CATEGORIE}
                                                                                        </Text>
                                                                                </View>
                                                                                {/* <AntDesign name="caretdown" size={20} color="#777" /> */}
                                                                        </View>
                                                                </View>
                                                                <View>
                                                                        <View style={{ ...styles.modalCard, marginHorizontal: 20 }}>
                                                                                <View >
                                                                                        <Text style={[styles.inputText, { fontSize: 13 }]}>
                                                                                                Sous Categorie
                                                                                        </Text>
                                                                                        <Text style={[styles.inputText, { color: '#000' }]}>
                                                                                                {product.produit.NOM_SOUS_CATEGORIE}
                                                                                        </Text>
                                                                                </View>
                                                                                {/* <AntDesign name="caretdown" size={20} color="#777" /> */}
                                                                        </View>
                                                                </View>
                                                                <View style={styles.inputCard}>
                                                                        <OutlinedTextField
                                                                                label={"Entrez votre prix"}
                                                                                fontSize={14}
                                                                                value={data.prixNouveau}
                                                                                onChangeText={(newValue) => handleChange('prixNouveau', newValue)}
                                                                                onBlur={() => checkFieldData('prixNouveau')}
                                                                                error={hasError('prixNouveau') ? getError('prixNouveau') : ''}
                                                                                lineWidth={0.5}
                                                                                activeLineWidth={0.5}
                                                                                baseColor={COLORS.smallBrown}
                                                                                tintColor={COLORS.primary}
                                                                        />
                                                                </View>

                                                        </View>
                                                }


                                                <TouchableOpacity
                                                        onPress={() => ajoutDetailsModalizeRef.current.open()}
                                                >
                                                        <View style={styles.button1}>
                                                                <Text style={styles.buttonText} >Ajout de details </Text>
                                                        </View>
                                                </TouchableOpacity>
                                                {detailData.map((detail, index) => {
                                                        return (
                                                                <View key={index} style={{ marginHorizontal: 20, marginTop: 10, borderBottomWidth: 1, borderBottomColor: "#ddd" }}>
                                                                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                                                                <Text style={{ fontSize: 13, fontWeight: "bold" }}>Quantite {detail.quantite}</Text>
                                                                                <Text style={{ fontSize: 13, fontWeight: "bold" }}>Taille {detail.TailleSelect.TAILLE}</Text>
                                                                                <Text style={{ fontSize: 13, fontWeight: "bold" }}>Couleur {detail.selectedCouleur.COULEUR}</Text>
                                                                        </View>
                                                                </View>
                                                        )
                                                })}

                                                {product == false ? 
                                                <>
                                                <View style={[styles.addImageContainer, { marginVertical: 10 }]}>
                                                        <TouchableWithoutFeedback onPress={onImagesSelect}>
                                                                <View style={styles.addImageItem}>
                                                                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                                                <Feather name="image" size={24} color="#777" />
                                                                                <Text style={styles.addImageLabel}>
                                                                                        Images
                                                                                </Text>
                                                                        </View>
                                                                        {logoImage && <Image source={{ uri: logoImage.uri }} style={{ width: "100%", height: 200, marginTop: 10, borderRadius: 5 }} />}
                                                                </View>
                                                        </TouchableWithoutFeedback>
                                                </View> 
                                                <View style={[styles.addImageContainer]}>
                                                        <TouchableWithoutFeedback onPress={onImages2Select}>
                                                                <View style={styles.addImageItem}>
                                                                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                                                <Feather name="image" size={24} color="#777" />
                                                                                <Text style={styles.addImageLabel}>
                                                                                        Images
                                                                                </Text>
                                                                        </View>
                                                                        {logoImage2 && <Image source={{ uri: logoImage2.uri }} style={{ width: "100%", height: 200, marginTop: 10, borderRadius: 5 }} />}
                                                                </View>
                                                        </TouchableWithoutFeedback>
                                                </View> 
                                                <View style={[styles.addImageContainer,{ marginTop:10}]}>
                                                        <TouchableWithoutFeedback onPress={onImages3Select}>
                                                                <View style={styles.addImageItem}>
                                                                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                                                <Feather name="image" size={24} color="#777" />
                                                                                <Text style={styles.addImageLabel}>
                                                                                        Images
                                                                                </Text>
                                                                        </View>
                                                                        {logoImage3 && <Image source={{ uri: logoImage3.uri }} style={{ width: "100%", height: 200, marginTop: 10, borderRadius: 5 }} />}
                                                                </View>
                                                        </TouchableWithoutFeedback>
                                                </View>
                                                </>
                                                :
                                                        <View style={[styles.addImageContainer, { marginVertical: 30 }]}>
                                                                <TouchableWithoutFeedback onPress={onImagesSelect}>
                                                                        <View style={styles.addImageItem}>
                                                                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                                                        <Feather name="image" size={24} color="#777" />
                                                                                        <Text style={styles.addImageLabel}>
                                                                                                Images
                                                                                        </Text>
                                                                                </View>
                                                                                {/* {product.produit.IMAGE_1 ?
                                                                                        <Image source={{ uri: product.produit.IMAGE_1.uri }} style={{ width: "100%", height: 200, marginTop: 10, borderRadius: 5 }} /> :
                                                                                        <Text>null</Text>
                                                                                } */}
                                                                        </View>
                                                                </TouchableWithoutFeedback>
                                                        </View>

                                                }
                                                <TouchableOpacity onPress={SendData}>
                                                        <View style={styles.button}>
                                                                <Text style={styles.buttonText} > Enregistrer</Text>
                                                        </View>
                                                </TouchableOpacity>
                                        </View>
                                </ScrollView>
                        </View>

                        <Modalize ref={ajoutDetailsModalizeRef} adjustToContentHeight handlePosition='inside'>
                                <>
                                        <View style={{ justifyContent: "center", alignContent: "center", alignItems: "center", marginTop: 15 }}>
                                                <Text style={{ fontSize: 17, fontWeight: "bold" }}>Details</Text>
                                        </View>
                                        <View>
                                                <TouchableOpacity >
                                                        <View style={styles.modalItem} >
                                                                <View style={styles.inputCard}>
                                                                        <OutlinedTextField
                                                                                label={"Quantite Total"}
                                                                                fontSize={14}
                                                                                value={data.quantite}
                                                                                onChangeText={(newValue) => handleChange('quantite', newValue)}
                                                                                onBlur={() => checkFieldData('quantite')}
                                                                                error={hasError('quantite') ? getError('quantite') : ''}
                                                                                keyboardType='number-pad'
                                                                                lineWidth={0.5}
                                                                                activeLineWidth={0.5}
                                                                                baseColor={COLORS.smallBrown}
                                                                                tintColor={COLORS.primary}
                                                                        />

                                                                        <View>
                                                                                <TouchableOpacity style={styles.modalCard}
                                                                                        onPress={() => tailleModalizeRef.current.open()}
                                                                                >
                                                                                        <View >
                                                                                                <Text style={[styles.inputText, { fontSize: 13 }]}>
                                                                                                        Taille
                                                                                                </Text>
                                                                                                {TailleSelect ? <Text style={[styles.inputText, { color: '#000' }]}>
                                                                                                        {TailleSelect.TAILLE}
                                                                                                </Text> :
                                                                                                        <Text style={[styles.inputText, { color: '#000' }]}>{autreTailles}</Text>}
                                                                                        </View>
                                                                                        <AntDesign name="caretdown" size={20} color="#777" />
                                                                                </TouchableOpacity>
                                                                        </View>

                                                                        <View style={{ marginTop: 10 }}>
                                                                                <TouchableOpacity style={styles.modalCard}
                                                                                        onPress={() => couleurModalizeRef.current.open()}
                                                                                >
                                                                                        <View >
                                                                                                <Text style={[styles.inputText, { fontSize: 13 }]}>
                                                                                                        Couleur
                                                                                                </Text>
                                                                                                {selectedCouleur ? <Text style={[styles.inputText, { color: '#000' }]}>
                                                                                                        {selectedCouleur.COULEUR}
                                                                                                </Text> :
                                                                                                        <Text style={[styles.inputText, { color: '#000' }]}>{autreCouleurs}</Text>}
                                                                                        </View>
                                                                                        <AntDesign name="caretdown" size={20} color="#777" />
                                                                                </TouchableOpacity>
                                                                        </View>

                                                                        <TouchableOpacity onPress={Ajouter_detail}>
                                                                                <View style={styles.buttonModal}>
                                                                                        <Text style={styles.buttonText} >Ajouter</Text>
                                                                                </View>
                                                                        </TouchableOpacity>


                                                                </View>
                                                        </View>
                                                </TouchableOpacity>

                                        </View>
                                </>
                        </Modalize>

                        <Modalize ref={tailleModalizeRef} adjustToContentHeight handlePosition='inside'>
                                <>
                                        <View style={{ justifyContent: "center", alignContent: "center", alignItems: "center", marginTop: 15 }}>
                                                <Text style={{ fontSize: 17, fontWeight: "bold" }}>Tailles</Text>
                                        </View>
                                        <View>
                                                <TouchableOpacity style={styles.modalAutres} onPress={AutresTypesTaille}>
                                                        {showAUtresTaille ? <MaterialCommunityIcons name="radiobox-marked" size={24} color="#007bff" /> :
                                                                <MaterialCommunityIcons name="radiobox-blank" size={24} color="#777" />}
                                                        <Text style={{ fontSize: 15, fontWeight: "bold" }}>Autres</Text>
                                                </TouchableOpacity>

                                                {tailles.map((taille, index) => {
                                                        return (
                                                                <TouchableOpacity key={index} onPress={() => onTaillesSelect(taille)}>
                                                                        <View style={styles.modalItemModel2} >
                                                                                {TailleSelect?.ID_TAILLE == taille.ID_TAILLE ? <MaterialCommunityIcons name="radiobox-marked" size={24} color="#007bff" /> :
                                                                                        <MaterialCommunityIcons name="radiobox-blank" size={24} color="#777" />}
                                                                                <Text>{taille.TAILLE}</Text>
                                                                        </View>

                                                                </TouchableOpacity>
                                                        )
                                                })}


                                                {showAUtresTaille && <View style={{ marginHorizontal: 20, marginTop: 10 }}>
                                                        <OutlinedTextField
                                                                label={"Autres Tailles"}
                                                                fontSize={14}
                                                                value={data.autresTaille}
                                                                onChangeText={(newValue) => handleChange('autresTaille', newValue)}
                                                                onBlur={() => checkFieldData('autresTaille')}
                                                                error={hasError('autresTaille') ? getError('autresTaille') : ''}
                                                                lineWidth={0.5}
                                                                activeLineWidth={0.5}
                                                                baseColor={COLORS.smallBrown}
                                                                tintColor={COLORS.primary}
                                                        />
                                                </View>}

                                                {showAUtresTaille && <TouchableOpacity onPress={() => ajoutTailleInput(data.autresTaille)}>
                                                        <View style={styles.buttonModalSecond}>
                                                                <Text style={styles.buttonText} >Ajouter</Text>
                                                        </View>
                                                </TouchableOpacity>}




                                        </View>
                                </>
                        </Modalize>

                        <Modalize ref={couleurModalizeRef} adjustToContentHeight handlePosition='inside'>
                                <>
                                        <View style={{ justifyContent: "center", alignContent: "center", alignItems: "center", marginTop: 15 }}>
                                                <Text style={{ fontSize: 17, fontWeight: "bold" }}>Couleurs</Text>
                                        </View>
                                        <View>
                                                <TouchableOpacity style={styles.modalAutres} onPress={AutresTypesCouleurs}>
                                                        {showAUtresCouleur ? <MaterialCommunityIcons name="radiobox-marked" size={24} color="#007bff" /> :
                                                                <MaterialCommunityIcons name="radiobox-blank" size={24} color="#777" />}
                                                        <Text style={{ fontSize: 15, fontWeight: "bold" }}>Autres</Text>
                                                </TouchableOpacity>

                                                {couleurs.map((couleur, index) => {
                                                        return (
                                                                <TouchableOpacity key={index} onPress={() => onCouleurSelect(couleur)}>
                                                                        <View style={styles.modalItemModel2} >
                                                                                {selectedCouleur?.ID_COULEUR == couleur.ID_COULEUR ? <MaterialCommunityIcons name="radiobox-marked" size={24} color="#007bff" /> :
                                                                                        <MaterialCommunityIcons name="radiobox-blank" size={24} color="#777" />}
                                                                                <Text>{couleur.COULEUR}</Text>
                                                                        </View>
                                                                </TouchableOpacity>
                                                        )
                                                })}

                                                {showAUtresCouleur && <View style={{ marginHorizontal: 20, marginTop: 10 }}>
                                                        <OutlinedTextField
                                                                label={"Autres Couleurs"}
                                                                fontSize={14}
                                                                value={data.autresCouleur}
                                                                onChangeText={(newValue) => handleChange('autresCouleur', newValue)}
                                                                onBlur={() => checkFieldData('autresCouleur')}
                                                                error={hasError('autresCouleur') ? getError('autresCouleur') : ''}
                                                                lineWidth={0.5}
                                                                activeLineWidth={0.5}
                                                                baseColor={COLORS.smallBrown}
                                                                tintColor={COLORS.primary}
                                                        />
                                                </View>}

                                                {showAUtresCouleur && <TouchableOpacity onPress={() => autreCouleurInput(data.autresCouleur)}>
                                                        <View style={styles.buttonModalSecond}>
                                                                <Text style={styles.buttonText} >Ajouter</Text>
                                                        </View>
                                                </TouchableOpacity>}

                                        </View>
                                </>
                        </Modalize>

                        <Modalize ref={categoriesModalizeRef} adjustToContentHeight handlePosition='inside'>
                                <>
                                        <View style={{ justifyContent: "center", alignContent: "center", alignItems: "center", marginTop: 15 }}>
                                                <Text style={{ fontSize: 17, fontWeight: "bold" }}>Categories</Text>
                                        </View>
                                        <View>
                                                {categories.map((categorie, index) => {
                                                        return (
                                                                <TouchableOpacity key={index} onPress={() => onCategorieSelect(categorie)}>
                                                                        <View style={styles.modalItemModel2} >
                                                                                {CategorieSelect?.ID_CATEGORIE_PRODUIT == categorie.ID_CATEGORIE_PRODUIT ? <MaterialCommunityIcons name="radiobox-marked" size={24} color="#007bff" /> :
                                                                                        <MaterialCommunityIcons name="radiobox-blank" size={24} color="#777" />}
                                                                                <Text>{categorie.NOM}</Text>
                                                                        </View>
                                                                </TouchableOpacity>
                                                        )
                                                })}

                                        </View>
                                </>
                        </Modalize>

                        <Modalize ref={SousCategoriesModalizeRef} adjustToContentHeight handlePosition='inside'>
                                <>
                                        <View style={{ justifyContent: "center", alignContent: "center", alignItems: "center", marginTop: 15 }}>
                                                <Text style={{ fontSize: 17, fontWeight: "bold" }}>Sous Categories</Text>
                                        </View>
                                        <View>
                                                {souscategories.map((souscategorie, index) => {
                                                        return (
                                                                <TouchableOpacity key={index} onPress={() => onSousCategorieSelect(souscategorie)}>
                                                                        <View style={styles.modalItemModel2} >
                                                                                {selectedSousCategorie?.ID_PRODUIT_SOUS_CATEGORIE == souscategorie.ID_PRODUIT_SOUS_CATEGORIE ? <MaterialCommunityIcons name="radiobox-marked" size={24} color="#007bff" /> :
                                                                                        <MaterialCommunityIcons name="radiobox-blank" size={24} color="#777" />}
                                                                                <Text>{souscategorie.NOM}</Text>
                                                                        </View>
                                                                </TouchableOpacity>
                                                        )
                                                })}



                                        </View>
                                </>
                        </Modalize>
                </>
        )
}
const styles = StyleSheet.create({
        container: {
                flex: 1,
        },
        cardHeader: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 20,
                height: 88
        },
        menuOpener: {
                marginTop: 25
        },
        menuOpenerLine: {
                height: 3,
                width: 30,
                backgroundColor: COLORS.primary,
                marginTop: 5
        },
        logo: {
                resizeMode: 'center',
                height: "50%",
                width: "50%",
                marginTop: 25
        },
        imageContainer: {
                height: "100%",
                width: 100,
                justifyContent: 'center',
                alignItems: 'center'
        },
        title: {
                fontWeight: 'bold',
                fontSize: 25,
                fontWeight: "bold",
                marginBottom: 12,
                color: COLORS.ecommercePrimaryColor,
                margin: 20
        },
        modalCard: {
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                // marginHorizontal: 20,
                backgroundColor: "#fff",
                padding: 13,
                borderRadius: 5,
                borderWidth: 0.5,
                borderColor: "#ddd"
        },
        inputText: {
                color: '#777'
        },
        inputCard: {
                marginHorizontal: 20,
                marginTop: 10,

        },
        button: {
                marginTop: 10,
                borderRadius: 8,
                paddingVertical: 14,
                paddingHorizontal: 10,
                backgroundColor: COLORS.primaryPicker,
                marginHorizontal: 20
        },
        button1: {
                marginTop: 10,
                borderRadius: 8,
                paddingVertical: 14,
                paddingHorizontal: 10,
                backgroundColor: COLORS.ecommerceOrange,
                marginHorizontal: 20
        },
        buttonText: {
                color: "#fff",
                fontWeight: "bold",
                // textTransform:"uppercase",
                fontSize: 16,
                textAlign: "center"
        },
        buttonModal: {
                marginTop: 10,
                borderRadius: 8,
                paddingVertical: 14,
                paddingHorizontal: 10,
                backgroundColor: COLORS.primaryPicker,
                marginBottom: 10
        },
        addImageContainer: {
                paddingHorizontal: 20
        },
        addImageItem: {
                borderWidth: 0.5,
                borderColor: COLORS.smallBrown,
                borderRadius: 5,
                paddingHorizontal: 10,
                paddingVertical: 15
        },
        modalItemModel2: {
                paddingVertical: 15,
                paddingHorizontal: 20,
                flexDirection: 'row',
                alignItems: 'center',
                alignContent: 'center'
        },
        modalAutres: {
                paddingHorizontal: 20,
                flexDirection: 'row',
                alignItems: 'center',
                alignContent: 'center',
        },
        buttonModalSecond: {
                marginTop: 10,
                borderRadius: 8,
                paddingVertical: 14,
                paddingHorizontal: 10,
                backgroundColor: COLORS.primaryPicker,
                marginBottom: 10,
                marginHorizontal: 20
        },

})
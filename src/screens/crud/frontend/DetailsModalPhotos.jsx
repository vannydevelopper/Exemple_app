import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View, Image, TouchableOpacity, Modal, TouchableWithoutFeedback, useWindowDimensions } from "react-native";
import Header from "../../components/Header";
import moment from 'moment'
import { FontAwesome5, AntDesign, MaterialIcons, Entypo, MaterialCommunityIcons, Feather, Ionicons, FontAwesome } from '@expo/vector-icons';
import { useIntl } from 'react-intl'
import ImageViewer from 'react-native-image-zoom-viewer';

export default function DetailsHabitatScreen() {
        const navigation = useNavigation()
        const { width } = useWindowDimensions()
        const IMAGE_WIDTH = (width / 2 - 20)
        const route = useRoute()
        const { details } = route.params
        const intl = useIntl()
        const [showImageModal, setShowImageModal] = useState(false)

        const [imageIndex, setImageIndex] = useState(0)
        const [showImageModalIdentite, setShowImageModalIdentite] = useState(false)

        var imageUrls = []
        if (details.IMAGE1_CNI) imageUrls.push(details.IMAGE1_CNI)
        if (details.IMAGE2_CNI) imageUrls.push(details.IMAGE2_CNI)

        return (
                <>
                        <Header withRadius={false} />
                        <View style={{ flex: 1, backgroundColor: '#fff' }}>
                                <ScrollView style={styles.container}>
                                        <TouchableOpacity style={styles.habitant} onPress={() => {
                                                setShowImageModal(true)
                                        }}>
                                                <Image source={{ uri: details.PHOTO }} style={styles.habitantPhoto} />
                                        </TouchableOpacity>
                                        <View style={styles.verification}>
                                                <View style={styles.cardImage}>
                                                        <View style={styles.imagecard}>
                                                                <AntDesign name="user" size={24} color="#53a4d4" />
                                                        </View>
                                                        <View style={styles.names}>
                                                                <Text style={styles.itemTitle}>{intl.formatMessage({ id: "ProfileDetailScreen.Nom" })}</Text>
                                                                <Text style={styles.itemValue}>{details.NOM}</Text>
                                                        </View>
                                                </View>
                                                <View style={styles.separator}></View>

                                                <View style={styles.cardImage}>
                                                        <View style={styles.imagecard}>
                                                                <AntDesign name="user" size={24} color="#53a4d4" />
                                                        </View>
                                                        <View style={styles.names}>
                                                                <Text style={styles.itemTitle}>{intl.formatMessage({ id: "ProfileDetailScreen.Prenom" })}</Text>
                                                                <Text style={styles.itemValue}>{details.PRENOM}</Text>
                                                        </View>
                                                </View>
                                                <View style={styles.separator}></View>

                                                <View style={styles.cardImage}>
                                                        <View style={styles.imagecard}>
                                                                <AntDesign name="user" size={24} color="#53a4d4" />
                                                        </View>
                                                        <View style={styles.names}>
                                                                <Text style={styles.itemTitle}>{intl.formatMessage({ id: "DetailsHabitatScreen.nomPere" })}</Text>
                                                                <Text style={styles.itemValue}>{details.PERE}</Text>
                                                        </View>
                                                </View>
                                                <View style={styles.separator}></View>

                                                <View style={styles.cardImage}>
                                                        <View style={styles.imagecard}>
                                                                <AntDesign name="user" size={24} color="#53a4d4" />
                                                        </View>
                                                        <View style={styles.names}>
                                                                <Text style={styles.itemTitle}>{intl.formatMessage({ id: "DetailsHabitatScreen.nomMere" })}</Text>
                                                                <Text style={styles.itemValue}>{details.MERE}</Text>
                                                        </View>
                                                </View>
                                                <View style={styles.separator}></View>

                                                <View style={styles.cardImage}>
                                                        <View style={styles.imagecard}>
                                                                <FontAwesome5 name="critical-role" size={24} color="#53a4d4" />
                                                        </View>
                                                        <View style={styles.names}>
                                                                <Text style={styles.itemTitle}>{intl.formatMessage({ id: "DetailsHabitatScreen.role" })}</Text>
                                                                <Text style={styles.itemValue}>{details.NOM_ROLE}</Text>
                                                        </View>
                                                </View>
                                                <View style={styles.separator}></View>

                                                {/* <View style={styles.cardImage}>
                                                        <View style={styles.imagecard}>
                                                                <AntDesign name="idcard" size={24} color="#53a4d4" />
                                                        </View>
                                                        <View style={styles.names}>
                                                                <Text style={styles.itemTitle}>{intl.formatMessage({ id: "RegistreScreen.Carte" })}</Text>
                                                                <Text style={styles.itemValue}>{details.NUMERO_IDENTITE}</Text>
                                                        </View>
                                                </View>
                                                <View style={styles.separator}></View> */}

                                                <View style={styles.cardImage}>
                                                        <View style={styles.imagecard}>
                                                                <AntDesign name="calendar" size={24} color="#53a4d4" />
                                                        </View>
                                                        <View style={styles.names}>
                                                                <Text style={styles.itemTitle}>{intl.formatMessage({ id: "registerHabitantscreen.dateDelivrance" })}</Text>
                                                                <Text style={styles.itemValue}>{moment(details.DATE_DELIVRANCE).format('DD-MM-Y')}</Text>
                                                        </View>
                                                </View>
                                                <View style={styles.separator}></View>

                                                <View style={styles.cardImage}>
                                                        <View style={styles.imagecard}>
                                                                <Entypo name="location" size={24} color="#53a4d4" />
                                                        </View>
                                                        <View style={styles.names}>
                                                                <Text style={styles.itemTitle}>{intl.formatMessage({ id: "registerHabitantscreen.lieuDelivrance" })}</Text>
                                                                <Text style={styles.itemValue}>{moment(details.LIEU_DELIVRANCE).format('DD-MM-Y')}</Text>
                                                        </View>
                                                </View>
                                                <View style={styles.separator}></View>

                                                <View style={styles.cardImage}>
                                                        <View style={styles.imagecard}>
                                                                <Feather name="phone" size={24} color="#53a4d4" />
                                                        </View>
                                                        <View style={styles.names}>
                                                                <Text style={styles.itemTitle}>{intl.formatMessage({ id: "IdentityModal.Telephone" })}</Text>
                                                                <Text style={styles.itemValue}>{details.NUMERO_TELEPHONE}</Text>
                                                        </View>
                                                </View>
                                                <View style={styles.separator}></View>

                                                <View style={styles.cardImage}>
                                                        <View style={styles.imagecard}>
                                                                <AntDesign name="calendar" size={24} color="#53a4d4" />
                                                        </View>
                                                        <View style={styles.names}>
                                                                <Text style={styles.itemTitle}>{intl.formatMessage({ id: "registerHabitantscreen.dateNaissance" })}</Text>
                                                                <Text style={styles.itemValue}>{moment(details.DATE_NAISSANCE).format('DD-MM-Y')}</Text>
                                                        </View>
                                                </View>
                                                <View style={styles.separator}></View>

                                                <View style={styles.cardImage}>
                                                        <View style={styles.imagecard}>
                                                                <AntDesign name="creditcard" size={24} color="#53a4d4" />
                                                        </View>
                                                        <View style={styles.names}>
                                                                <Text style={styles.itemTitle}>{intl.formatMessage({ id: "NewAffectationScreen.civils" })}</Text>
                                                                <Text style={styles.itemValue}>{details.DESC_CIVILS}</Text>
                                                        </View>
                                                </View>
                                                <View style={styles.separator}></View>

                                                <View style={styles.cardImage}>
                                                        <View style={styles.imagecard}>
                                                                <AntDesign name="creditcard" size={24} color="#53a4d4" />
                                                        </View>
                                                        <View style={styles.names}>
                                                                <Text style={styles.itemTitle}>{intl.formatMessage({ id: "NewAffectationScreen.fonctions" })}</Text>
                                                                <Text style={styles.itemValue}>{details.FONCTION_NAME}</Text>
                                                        </View>
                                                </View>
                                                <View style={styles.separator}></View>
                                        </View>
                                        <View style={[styles.detailCard, { marginBottom: 10 }]}>
                                                <View style={styles.detailCardHeader}>
                                                        <View style={styles.iconContainer}>
                                                                <FontAwesome name="image" size={24} color="#071E43" />
                                                        </View>
                                                        <Text style={styles.cardTitle}>
                                                                {intl.formatMessage({ id: "RegistreScreen.Carte" })}
                                                        </Text>
                                                </View>
                                                <View style={styles.imagesIdentite}>
                                                        <TouchableWithoutFeedback onPress={() => {
                                                                setImageIndex(0)
                                                                setShowImageModalIdentite(true)
                                                        }}>
                                                                <View style={{ ...styles.imageContainer, borderWidth: 0, width: IMAGE_WIDTH, height: IMAGE_WIDTH }} >
                                                                        <Image source={{ uri: details.IMAGE1_CNI }} style={styles.image} />
                                                                </View>
                                                        </TouchableWithoutFeedback>
                                                        <View style={{ padding: 2 }}></View>
                                                        <TouchableWithoutFeedback onPress={() => {
                                                                setImageIndex(1)
                                                                setShowImageModalIdentite(true)
                                                        }}>
                                                                <View style={{ ...styles.imageContainer, borderWidth: 0, width: IMAGE_WIDTH, height: IMAGE_WIDTH }} >
                                                                        <Image source={{ uri: details.IMAGE2_CNI }} style={styles.image} />
                                                                </View>
                                                        </TouchableWithoutFeedback>
                                                </View>
                                        </View>
                                </ScrollView>

                        </View>

                        <Modal visible={showImageModal} transparent={true} onRequestClose={() => setShowImageModal(false)}>
                                <ImageViewer
                                        renderHeader={() => {
                                                return (
                                                        <View style={{ padding: 0, width: '100%', position: 'absolute', zIndex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', flexDirection: 'row', alignItems: 'center' }}>
                                                                <TouchableOpacity onPress={() => setShowImageModal(false)}>
                                                                        <View style={{ padding: 20 }}>
                                                                                <Ionicons name="arrow-back-outline" size={24} color="#fff" />
                                                                        </View>
                                                                </TouchableOpacity>
                                                                <Text style={{ color: '#fff', marginLeft: 20, opacity: 0.8 }}>
                                                                        {/* {intl.formatMessage({id: "VehiculeDetailScreen.titleImagesIncident"})} */}
                                                                </Text>
                                                        </View>
                                                )
                                        }}
                                        index={0}
                                        renderIndicator={() => <Text></Text>}
                                        loadingRender={() => <Text>loading image</Text>}
                                        imageUrls={[{ url: details.PHOTO }]}
                                        enableSwipeDown={true}
                                        onSwipeDown={() => setShowImageModal(false)}
                                        onCancel={() => setShowImageModal(false)}
                                        saveToLocalByLongPress={false}
                                        enablePreload={true}
                                        swipeDownThreshold={100}

                                />
                        </Modal>

                        <Modal visible={showImageModalIdentite} transparent={true} onRequestClose={() => setShowImageModalIdentite(false)}>
                                <ImageViewer
                                        renderHeader={() => {
                                                return (
                                                        <View style={{ padding: 0, width: '100%', position: 'absolute', zIndex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', flexDirection: 'row', alignItems: 'center' }}>
                                                                <TouchableOpacity onPress={() => setShowImageModalIdentite(false)}>
                                                                        <View style={{ padding: 20 }}>
                                                                                <Ionicons name="arrow-back-outline" size={24} color="#fff" />
                                                                        </View>
                                                                </TouchableOpacity>
                                                                <Text style={{ color: '#fff', marginLeft: 20, opacity: 0.8 }}>
                                                                        {/* {intl.formatMessage({id: "VehiculeDetailScreen.titleImagesIncident"})} */}
                                                                </Text>
                                                        </View>
                                                )
                                        }}
                                        index={imageIndex}
                                        renderIndicator={() => <Text></Text>}
                                        loadingRender={() => <Text>loading image</Text>}
                                        imageUrls={imageUrls.map(image => ({ url: image }))}
                                        enableSwipeDown={true}
                                        onSwipeDown={() => setShowImageModalIdentite(false)}
                                        onCancel={() => setShowImageModalIdentite(false)}
                                        saveToLocalByLongPress={false}
                                        enablePreload={true}
                                        swipeDownThreshold={100}
                                />
                        </Modal>
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
        verification: {
                backgroundColor: '#fff',
                borderRadius: 8,
                elevation: 5,
                shadowColor: '#c4c4c4',
                backgroundColor: '#fff',
                padding: 5,
                overflow: 'hidden',
                marginTop: 5,
                marginHorizontal: 8
        },
        itemTitle: {
                fontSize: 15
        },
        itemValue: {
                opacity: 0.8,
                fontWeight: 'bold',
                color: '#777',
        },
        cardImage: {
                marginTop: 10,
                flexDirection: "row",
        },
        names: {
                justifyContent: "center",
                marginLeft: 10

        },
        imagecard: {
                width: 50,
                height: 50,
                backgroundColor: "#DCE4F7",
                borderRadius: 8,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 4
        },
        separator: {
                borderWidth: 1,
                borderColor: "#DCE4F7",
                opacity: 0.5,
                marginVertical: 5,
                marginLeft: 58
        },
        habitant: {
                flexDirection: 'row',
                alignItems: "center",
                justifyContent: "center",
                marginTop: 10
        },
        habitantPhoto: {
                width: 60,
                height: 60,
                borderRadius: 50
        },
        detailCard: {
                borderRadius: 8,
                backgroundColor: '#FFF',
                elevation: 10,
                shadowColor: '#C4C4C4',
                marginTop: 10,
                marginHorizontal: 8
        },
        detailCardHeader: {
                flexDirection: "row",
                alignItems: "center",
                borderBottomWidth: 1,
                borderBottomColor: '#F1F1F1',
                padding: 10
        },
        iconContainer: {
                width: 50,
                height: 50,
                backgroundColor: '#F1F1F1',
                borderRadius: 50,
                justifyContent: "center",
                alignItems: "center"
        },
        cardTitle: {
                fontWeight: "bold",
                marginLeft: 10,
                opacity: 0.8
        },
        imagesIdentite: {
                flexDirection: "row",
                alignItems: "center",
                flexWrap: "wrap",
                paddingHorizontal: 10,
        },
        imageContainer: {
                borderRadius: 5,
                marginTop: 15
        },
        image: {
                width: "100%",
                height: "100%",
                borderRadius: 5
        },
})
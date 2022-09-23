import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Affichageimage() {
        return (
                <ScrollView>
                        <View style={{ flexDirection: "row", marginHorizontal: 20, justifyContent: "space-between", marginBottom: 10 }}>
                                {produits.map((produit, index) => {
                                        return (
                                                <View key={index}>
                                                        <View style={styles.cardAchat}>
                                                                <Image source={{ uri: produit.IMAGE_1 }} style={styles.DataImage} />
                                                        </View>
                                                        <View style={{ flexDirection: "row" }}>
                                                                <View style={styles.cardLike}>
                                                                        <Ionicons name="heart-dislike-outline" size={24} color="#F29558" />
                                                                </View>
                                                                <View style={styles.cardLike2}>
                                                                        <AntDesign name="shoppingcart" size={24} color="#F29558" />
                                                                </View>
                                                        </View>
                                                        <View >
                                                                <Text numberOfLines={2} style={{ maxWidth: 150, fontSize: 15 }}>{produit.NOM_PRODUIT}</Text>
                                                                <Text style={{ color: "#F29558", fontWeight: "bold" }}>{produit.PRIX} Fbu</Text>
                                                        </View>
                                                </View>
                                        )
                                })}



                        </View>

                </ScrollView>
        )
}

const styles = StyleSheet.create({
        DataImage: {
                minWidth: 160,
                minHeight: 120,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "#777"
        }
})
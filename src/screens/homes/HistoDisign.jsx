import React from "react";
import { ScrollView, Text, StyleSheet, View } from "react-native";
import { AntDesign } from '@expo/vector-icons';

export default function HistoDisign() {
        return (
                <ScrollView>
                        <View style={styles.cardPrincipal}>
                                <View style={styles.card1}>
                                        <Text style={styles.title}>Disign</Text>
                                        <Text style={styles.description}>le 12/12/2022</Text>
                                </View>
                                <View style={styles.cardLiaison}>
                                        <View style={styles.card2}>
                                                <AntDesign name="check" size={20} color="#fff" />
                                        </View>
                                        {/* <View style={styles.ligne}>
                                        </View> */}
                                </View>

                                <View style={styles.card3}>
                                        <Text style={styles.title}>commentaires</Text>
                                        <Text style={styles.description}>These</Text>
                                </View>
                        </View>

                </ScrollView>
        )
}

const styles = StyleSheet.create({
        cardPrincipal: {
                flexDirection: "row",
                alignItems: "center",
                marginTop: 15
        },
        card1: {
                marginLeft: 10,
                borderRightWidth:1,
                color:"#777"
        },
        card2: {
                padding: 5,
                width: 30,
                height: 30,
                backgroundColor: "#000",
                borderRadius: 50,
                marginLeft: 10,
                justifyContent:"center",
                alignItems:"center"

        },
        card3: {
                marginLeft: 10,
                borderLeftWidth:1,
                color:"#777"
        },
        title: {
                fontSize: 15,
                fontWeight: "bold",
                color: "#777"
        },
        description: {
                color: "#777",
                fontSize: 15
        },
        ligne: {
                backgroundColor: "#000",
                width: 2,
                height: 50
        },
        cardLiaison:{
                alignItems:"center",
                justifyContent:"center",
        }
})
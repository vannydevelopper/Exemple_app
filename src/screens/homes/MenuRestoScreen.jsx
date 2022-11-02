import React from "react";
import { Text, View, StyleSheet, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { AntDesign } from '@expo/vector-icons';
import Carousel from "../../components/app/Carousel";

export default function MenuRestoScreen() {
        return (
                <>
                        <StatusBar backgroundColor='#fff' barStyle='dark-content' />
                        <View style={styles.imgBackground}>
                                <View style={styles.cardHeader}>
                                        <View style={styles.menuOpener}>
                                                <View style={styles.menuOpenerLine} />
                                                <View style={[styles.menuOpenerLine, { width: 15 }]} />
                                                <View style={[styles.menuOpenerLine, { width: 25 }]} />
                                        </View>

                                        <View style={styles.imageContainer}>
                                                <Image source={require('../../../assets/menus/chapchap.png')} style={styles.logo} />
                                        </View>
                                        <View style={{ marginTop: 25 }}>
                                                <AntDesign name="search1" size={24} color="back" />
                                        </View>
                                </View>
                                <Carousel/>
                        </View>
                </>
        )
}

const styles = StyleSheet.create({
        imgBackground: {
                flex: 1,
                width: '100%',
                height: "100%"
        },
        cardHeader: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 20,
                height: 88
        },
        menuOpenerLine: {
                height: 3,
                width: 30,
                backgroundColor: "#F58424",
                marginTop: 5
        },
        imageContainer: {
                height: "100%",
                width: 100,
                justifyContent: 'center',
                alignItems: 'center'
        },
        logo: {
                resizeMode: 'center',
                height: "50%",
                width: "50%",
                marginTop: 25
        },
        menuOpener: {
                marginTop: 25
      },
})
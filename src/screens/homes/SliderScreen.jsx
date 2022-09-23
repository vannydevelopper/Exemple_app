import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Slider from "@react-native-community/slider";

export default function SliderScreen() {
        const [range, setRange] = useState('50%')
        const [slinding, setSlinding] = useState('inactive')
        return (
                <View style={styles.container}>
                        <Text style={{
                                fontSize: 20,
                                fontWeight: "bold",
                                alignSelf: "center"
                        }}>{range}</Text>
                        <Text style={{
                                fontSize: 20,
                                fontWeight: "bold",
                                alignSelf: "center"
                        }}>{slinding}</Text>
                        <View>
                                <Slider
                                        style={{ height: 50 }}
                                        minimumValue={0}
                                        maximumValue={100}
                                        minimumTrackTintColor="tomato"
                                        maximumTrackTintColor="#000000"
                                        thumbTintColor="tomato"
                                        thumbStyle={styles.thumb}
                                        trackStyle={styles.track}
                                        step={2}
                                        value={5}
                                        onValueChange={value => setRange(value)}
                                        onSlidingStart={() => setSlinding('slinding')}
                                        onSlidingComplete={() => setSlinding('inactive')}
                                />
                        </View>
                </View>
        )
}

const styles = StyleSheet.create({
        container: {
                flex: 1
        },
        thumb: {
                width: 50,
                height: 80,
                backgroundColor: "#777",
                borderBottomRightRadius: 100,
                borderTopRightRadius: 100,

        },
        track: {
                height: 80,
                borderBottomRightRadius: 20,
                borderTopRightRadius: 20,
        }
})
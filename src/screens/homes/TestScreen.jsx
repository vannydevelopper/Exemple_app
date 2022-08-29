import React, { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, Animated, BackHandler, TouchableWithoutFeedback, View } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker'
import { Host, Portal } from 'react-native-portalize';
import { Button, Icon, Input, FormControl, WarningOutlineIcon, extendTheme } from 'native-base'
import { Entypo, FontAwesome5, AntDesign, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";


const Modal = ( { onClose, selectedPartenaire, onPartenaireSelect }) => {
        const [scale] = useState(new Animated.Value(1.1))
       useEffect(() => {
              const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
                     onClose()
                     return true
              })
              Animated.spring(scale, {
                     toValue: 1,
                     useNativeDriver: true
              }).start()
              return () => {
                     backHandler.remove()
              }
       }, [])
        return (
                <Portal>
                        <TouchableWithoutFeedback onPress={onClose}>
                                <View style={styles.modalContainer}>
                                        <TouchableWithoutFeedback>
                                                <Animated.View style={{ ...styles.modalContent , transform: [{ scale }]}}>
                                                        <View style={{ borderBottomWidth: 0, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#F58424' }}>
                                                                <Text style={{ fontWeight: 'bold', color: '#fff', opacity: 0.8, textAlign: 'center' }}>
                                                                        Partenaires
                                                                </Text>
                                                        </View>
                                                        <ScrollView keyboardShouldPersistTaps="handled">
                                                                <View>
                                                                        <TouchableWithoutFeedback onPress={() => onPartenaireSelect(partenaire)}>
                                                                                <View style={styles.modalItem}>
                                                                                        <MaterialCommunityIcons name="radiobox-marked" size={24} color="#007bff" />
                                                                                        <Text numberOfLines={1} style={styles.modalText}>Les outils</Text>
                                                                                </View>
                                                                        </TouchableWithoutFeedback>
                                                                </View>
                                                        </ScrollView>
                                                </Animated.View>
                                        </TouchableWithoutFeedback>
                                </View>
                        </TouchableWithoutFeedback>
                </Portal>
        )
}

export default function TestScreen() {
        const [showPartenaires, setshowPartenaires] = useState(false)
        const [selectedPartenaire, setselectedPartenaire] = useState(null)
        const onPartenaireSelect = (partenaire) => {
                setselectedPartenaire(partenaire)
                setshowPartenaires(false)
         }
        //recuperation Heure
        const [time, setTime] = useState(new Date());
        const [isDisplayTime, setShow] = useState(false);
        const changeSelectedTime = (event, selectedDate) => {
                const currentDate = selectedDate || mydate;
                setShow(Platform.OS === "ios");
                setTime(currentDate);

        };
        const showMode = (currentMode) => {
                setShow(true);
        };
        const displayDatepicker = () => {
                showMode('date');
        };

        //recuperation des dates
        const [mydate, setDate] = useState(new Date());
        const [displaymode, setMode] = useState('date');
        const [isDisplayDate, setShowDate] = useState(false);
        const changeSelectedDate = (event, selectedDate) => {
                const currentDate = selectedDate || mydate;
                setShowDate(Platform.OS === "ios");
                setDate(currentDate);

        };
        const showModeDate = (currentMode) => {
                setShowDate(true);
                setMode(currentMode);
        };
        const displayDatepicker2 = () => {
                showModeDate('date');
        };

        const navigation = useNavigation()
        const connexion = () => {
                navigation.navigate("Disign")
        }
        return (
                <>
                <ScrollView>
                        <View style={styles.container}>
                                <View style={{ ...styles.formGroup, paddingHorizontal: 10 }}>
                                        <Text >
                                                Heure de demande de la course
                                        </Text>
                                        <TouchableOpacity style={styles.openModalize} onPress={displayDatepicker}>
                                                <Text style={styles.openModalizeLabel} numberOfLines={1}>
                                                        Sélectionner l'heure
                                                </Text>
                                                <AntDesign name="clockcircleo" size={20} color="#777" />
                                        </TouchableOpacity>
                                        {isDisplayTime && <DateTimePicker
                                                testID="dateTimePicker"
                                                value={time}
                                                mode={"time"}
                                                is24Hour={true}
                                                display="default"
                                                onChange={changeSelectedTime}
                                        />}
                                </View>
                                <View style={{ ...styles.formGroup, paddingHorizontal: 10 }}>
                                        <Text >
                                                Date de demande de la course
                                        </Text>
                                        <TouchableOpacity style={styles.openModalize} onPress={displayDatepicker2}>
                                                <View style={styles.iconDebutName}>
                                                        <MaterialIcons name="calendar-today" size={18} color="#777" style={styles.icon} />
                                                        <Text style={styles.debutName}>
                                                                Date debut
                                                        </Text>
                                                </View>
                                                <View style={styles.rightDate}>
                                                        <Text style={styles.rightDateText}>
                                                                12/12/2022
                                                        </Text>
                                                </View>
                                        </TouchableOpacity>
                                        {isDisplayDate && <DateTimePicker
                                                testID="dateTimePicker"
                                                value={mydate}
                                                mode={displaymode}
                                                //   mode={"time"}
                                                is24Hour={true}
                                                display="default"
                                                onChange={changeSelectedDate}
                                        />}
                                </View>

                                <View style={{ ...styles.formGroup, paddingHorizontal: 10 }}>
                                        <Text >
                                                Modal
                                        </Text>
                                        <TouchableOpacity style={styles.openModalize} onPress={() => setshowPartenaires(true)}>
                                                <Text style={styles.inputText}>
                                                        Selectionner
                                                </Text>
                                                <AntDesign name="caretdown" size={16} color="#777" />
                                        </TouchableOpacity>
                                </View>
                                <Button
                                
                                   borderRadius={15}
                                   // isDisabled={email == "" || password == ""}
                                   onPress={connexion}
                                   marginBottom={5}
                                   marginHorizontal={20}
                                   mt={5}
                                   backgroundColor={"#F58424"}
                                   py={3.5}
                                   _text={{ color: '#fff', fontWeight: 'bold' }}
                            >
                                   Continuer sur historique
                            </Button>

                        </View>
                </ScrollView>
                {showPartenaires && <Modal selectedPartenaire={selectedPartenaire} onPartenaireSelect={onPartenaireSelect} onClose={() => setshowPartenaires(false)}/>}
                </>
        )
}

const styles = StyleSheet.create({
        container: {
                flex: 1
        },
        openModalize: {
                backgroundColor: '#dde1ed',
                padding: 10,
                borderRadius: 5,
                marginTop: 5,
                flexDirection: 'row',
                alignContent: 'center',
                alignItems: 'center',
                justifyContent: 'space-between'
        },
        openModalizeLabel: {
                color: '#555',
                fontSize: 14,
        },
        formGroup: {
                marginTop: 10
        },
        datePickerButton: {
                flexDirection: "row",
                borderWidth: 1,
                marginBottom: 8,
                borderRadius: 10,
                backgroundColor: "#fff",
                borderColor: "#ddd",
                padding: 9,
                justifyContent: "space-between",
                marginTop: 10,
                marginHorizontal: 10
        },
        iconDebutName: {
                flexDirection: "row",
                alignItems: 'center'
        },
        debutName: {
                marginLeft: 10,
                color: '#777'
        },
        rightDateText: {
                fontWeight: 'bold',
                padding: 2,
                borderRadius: 5
        },
        modalContainer: {
                position: 'absolute',
                zIndex: 1,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                justifyContent: 'center',
                alignItems: 'center'
        },
        modalContent: {
                width: '90%',
                maxWidth: 400,
                backgroundColor: '#fff',
                borderRadius: 10,
                overflow: 'hidden',
                maxHeight: '90%'
        },
        modalItem: {
                paddingVertical: 10,
                paddingHorizontal: 15,
                marginTop: 5,
                flexDirection: 'row',
                alignItems: 'center',
                alignContent: 'center'
        },
        modalText: {
                fontWeight: 'bold',
                marginLeft: 10
        },
})
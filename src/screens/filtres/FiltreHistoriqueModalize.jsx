import React, { useCallback, useRef, useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity, TouchableNativeFeedback, ScrollView } from "react-native";
import { OutlinedTextField } from 'rn-material-ui-textfield'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useIntl } from "react-intl";
import { COLORS } from '../../styles/COLORS';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment'
import { useNavigation } from "@react-navigation/native";
import { Modalize } from 'react-native-modalize';
import { Portal } from "react-native-portalize";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function FiltreHistoriqueModalize({ setFilters, filters, modalizeRef, selectedCorporate }) {
        const navigation = useNavigation()
        const intl = useIntl()
        const [codeCourse, setCodeCourse] = useState(filters?.codeCourse)
        // const [corporate, setCorporate] = useState(filters?.corporate)


        // date debut pour filtrer les donnees des historiques
        const [dateDebut, setDateDebut] = useState(filters?.dateDebut);
        const [showDateDebut, setShowDateDebut] = useState(false);
        const onChangeDateDebut = (event, selectedDate) => {
                setShowDateDebut(Platform.OS === "ios");
                const currentDate = event.type == 'dismissed' ? dateDebut : selectedDate
                setDateDebut(currentDate);
        };

        // date fin pour filtrer les donnees des historiques
        const [dateFin, setDateFin] = useState(filters?.dateFin);
        const [showDateFin, setShowDateFin] = useState(false);
        const onChangeDateFin = (event, selectedDate) => {
                setShowDateFin(Platform.OS === "ios");
                const currentDate = event.type == 'dismissed' ? dateFin : selectedDate
                setDateFin(currentDate);
        };

        const handlePress = useCallback(() => {
                setFilters({
                        codeCourse: codeCourse ? codeCourse : null,
                        dateDebut: dateDebut ? dateDebut : null,
                        dateFin: dateFin ? dateFin : null,
                        corporate:selectedCorporate ? selectedCorporate.NOM : null
                }
                )
                modalizeRef.current.close()
        }, [codeCourse, dateDebut, dateFin, selectedCorporate])
        const handleDelete = () => {
                setFilters(null)
                modalizeRef.current.close()
        }
        const getFilterCount = useCallback(() => {
                var count = 0
                if (filters?.codeCourse) count += 1
                if (filters?.corporate) count += 1
                if (filters?.dateDebut) count += 1
                if (filters?.dateFin) count += 1
                return count
        }, [filters])

        const handleCorporate = () =>{
                navigation.navigate("SelectedCorporateFiltreScreen",{selectedCorporate:selectedCorporate})
        }

        return (
                        <View style={styles.container}>
                                <View style={styles.filterHeader}>
                                        <Text style={styles.title}>
                                                Filtre par
                                        </Text>
                                        {getFilterCount() > 0 ? <TouchableOpacity onPress={() => handleDelete()} style={styles.removeFiltersBtn}>
                                                <Text style={styles.removeFiltersText}>
                                                        Supprimer les filtres
                                                </Text>
                                        </TouchableOpacity> : null}
                                </View>
                                <View style={styles.filters}>
                                        <View style={styles.inputs}>
                                                <TouchableOpacity style={[styles.CardCorporate]} onPress={handleCorporate}>
                                                        <View style={{ paddingHorizontal: 10 }}>
                                                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: 'space-between' }}>
                                                                        <Text style={{ fontFamily: "Nunito" }}>
                                                                                Corporate
                                                                        </Text>
                                                                </View>
                                                                <Text style={styles.selectedValue}>{selectedCorporate ? selectedCorporate.NOM : "selectionner"}</Text>
                                                        </View>
                                                </TouchableOpacity>
                                                <OutlinedTextField
                                                        label="Code de la course"
                                                        fontSize={14}
                                                        baseColor={COLORS.smallBrown}
                                                        tintColor={COLORS.primary}
                                                        containerStyle={{ borderRadius: 20, marginTop: 10, flex: 0.5, marginRight: 4, marginLeft: 2 }}
                                                        labelTextStyle={{ fontFamily: "Nunito" }}
                                                        lineWidth={0.5}
                                                        activeLineWidth={0.5}
                                                        errorColor={COLORS.error}
                                                        value={codeCourse}
                                                        onChangeText={(text) => setCodeCourse(text)}
                                                        blurOnSubmit={false}
                                                />
                                        </View>
                                        <View style={styles.dates}>
                                                <TouchableOpacity style={[styles.modalCard, { flex: 1, marginRight: 5 }]} onPress={() => setShowDateDebut(true)}>
                                                        <View style={{}}>
                                                                <Text style={[styles.inputText, { fontSize: 12 }]}>
                                                                        De
                                                                </Text>
                                                                <Text style={[styles.inputText, { color: '#333' }]}>
                                                                        {dateDebut ? moment(dateDebut).format('DD/MM/YYYY') : "Non determine"}
                                                                </Text>
                                                        </View>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={[styles.modalCard, { flex: 1, marginLeft: 5 }]} onPress={() => setShowDateFin(true)}>
                                                        <View style={{}}>
                                                                <Text style={[styles.inputText, { fontSize: 13 }]}>
                                                                        A
                                                                </Text>
                                                                <Text style={[styles.inputText, { color: '#333' }]}>
                                                                        {dateFin ? moment(dateFin).format('DD/MM/YYYY') : "Non determine"}
                                                                </Text>
                                                        </View>
                                                </TouchableOpacity>
                                        </View>
                                        <View style={styles.actions}>
                                                <TouchableOpacity style={styles.actionBtn} activeOpacity={0.5}
                                                        onPress={handlePress}
                                                >
                                                        <Text style={styles.actionText}>
                                                                Appliquer
                                                        </Text>
                                                </TouchableOpacity>
                                        </View>

                                        {showDateDebut && (
                                                <DateTimePicker
                                                        testID="dateTimePicker"
                                                        value={dateDebut || new Date()}
                                                        mode={"date"}
                                                        is24Hour={true}
                                                        display="default"
                                                        onChange={onChangeDateDebut}
                                                        maximumDate={new Date()}
                                                />
                                        )}
                                        {showDateFin && (
                                                <DateTimePicker
                                                        testID="dateTimePicker"
                                                        value={dateFin || new Date()}
                                                        mode={"date"}
                                                        is24Hour={true}
                                                        display="default"
                                                        onChange={onChangeDateFin}
                                                        minimumDate={dateDebut}
                                                />
                                        )}
                                </View>
                        </View>
        )
}

const styles = StyleSheet.create({
        container: {
                paddingTop: 20
        },
        filterHeader: {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginVertical: 5,
                paddingHorizontal: 10
        },
        title: {
                fontSize: 16,
                color: '#333'
        },
        filters: {
                paddingHorizontal: 10
        },
        modalCard: {
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#fff",
                paddingHorizontal: 13,
                paddingVertical: 5,
                borderRadius: 5,
                borderWidth: 0.5,
                borderColor: "#aaa"
        },
        inputText: {
                color: '#777'
        },
        modalizeTitle: {
                marginTop: 20,
                marginVertical: 10,
                fontSize: 16,
                fontWeight: "bold",
                color: '#333',
                textAlign: "center"
        },
        checkSelect: {
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 5
        },
        dates: {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 10
        },
        selects: {
                flexDirection: "row",
                alignItems: "center"
        },
        actions: {
                marginTop: 10,
                marginBottom: 5
        },
        actionBtn: {
                backgroundColor: "#1d9bf0",
                paddingVertical: 15,
                borderRadius: 5
        },
        actionText: {
                color: '#fff',
                textAlign: "center",
                fontWeight: "bold"
        },
        inputs: {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between"
        },
        removeFiltersBtn: {
                backgroundColor: '#F1F1F1',
                padding: 10,
                borderRadius: 10
        },
        removeFiltersText: {
                fontSize: 12,
                color: '#777',
                fontWeight: "bold",
                opacity: 0.8
        },
        CardCorporate: {
                borderWidth: 0.5,
                borderColor: COLORS.smallBrown,
                borderRadius: 5,
                // paddingHorizontal: 10,
                paddingVertical: 5,
                flex: 0.5,
                marginRight: 10
        },
        selectedValue: {
                color: '#777',
                marginTop: 2,
                fontFamily: "Nunito"
        },
})
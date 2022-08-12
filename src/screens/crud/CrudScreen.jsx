import React, { useState, useEffect, useRef } from 'react'
import { ScrollView, Text, View, StyleSheet } from "react-native";
import { Button, Icon, Input, FormControl, WarningOutlineIcon, extendTheme } from 'native-base'
import { Ionicons, Entypo, EvilIcons } from '@expo/vector-icons';
import { Portal } from 'react-native-portalize'

export default function CrudScreen() {
        const [success, setSuccess] = useState(false)

        const sendData = async () => {
                setSuccess(true)
        }
        return (
                <>
                        {success && <Portal>
                                <View style={styles.modalContainer}>
                                        <View style={styles.modalContent}>
                                                <View style={{ borderBottomWidth: 0, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#071E43' }}>
                                                        <Text style={{ fontWeight: 'bold', color: '#fff', opacity: 0.8, textAlign: 'center' }}>
                                                                test test
                                                        </Text>
                                                </View>
                                                <View style={{ paddingHorizontal: 10 }}>
                                                        <Text style={{ color: '#777', marginVertical: 20, textAlign: 'center' }}>
                                                                confirmer
                                                        </Text>
                                                </View>
                                                <View style={{ paddingVertical: 10, paddingHorizontal: 10 }}>
                                                        <Button colorScheme="info" onPress={() => {
                                                                setSuccess(false)
                                                                // navigation.navigate('Home')
                                                        }} backgroundColor={"#071E43"} borderRadius={10}>
                                                                ok
                                                        </Button>
                                                </View>
                                        </View>
                                </View>
                        </Portal>}
                        <ScrollView keyboardShouldPersistTaps="handled">
                                <View style={styles.form}>
                                        <Input
                                                // width={"90%"}
                                                placeholder="recherche"
                                                size='md' py={2}
                                                // value={search}
                                                // onChangeText={t => setSearch(t)}
                                                flex={1}
                                                borderRadius={10}
                                                backgroundColor={"#fff"}
                                                InputLeftElement={
                                                        <Icon
                                                                as={<EvilIcons name="search" size={24} color="black" />}
                                                                size={8}
                                                                ml="2"
                                                                color="muted.400"
                                                        />
                                                }
                                        />
                                        <View style={styles.bottom}>
                                                <Button
                                                        borderRadius={10}
                                                        onPress={() => sendData()}
                                                        //isDisabled={description == '' || selectedQuestionnaires.length == 0 || images.length == 0}
                                                        px={12}
                                                        py={3}
                                                        size="lg"
                                                        width={"full"}
                                                        backgroundColor={"#071E43"}
                                                        borderColor={"#021737"}
                                                        borderWidth={2}
                                                        marginBottom={1}
                                                        _text={{
                                                                fontWeight: 'bold',
                                                                color: "#fff"
                                                        }}
                                                >
                                                        enregistrer
                                                </Button>
                                        </View>
                                </View>
                        </ScrollView>
                </>
        )
}

const styles = StyleSheet.create({
        form: {
                marginVertical: 30,
                marginHorizontal: 20
        },
        bottom: {
                marginTop: 10
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
                width: '80%',
                maxWidth: 400,
                backgroundColor: '#fff',
                borderRadius: 10,
                overflow: 'hidden',
        },
})
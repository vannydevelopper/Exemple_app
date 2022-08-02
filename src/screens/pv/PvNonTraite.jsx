import { useState, useEffect } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import * as SQLite from "expo-sqlite";
import * as FileSystem from 'expo-file-system';
import { shareAsync } from "expo-sharing";
import { useNavigation } from "@react-navigation/native";
import { Button, Icon, Input, useToast, FormControl, WarningOutlineIcon } from 'native-base'

function openDatabase() {
       if (Platform.OS === "web") {
              return {
                     transaction: () => {
                            return {
                                   executeSql: () => { },
                            };
                     },
              };
       }

       const db = SQLite.openDatabase("example.db");
       return db;
}

const db = openDatabase();

export default function PvNonTraite() {
       const [nom, setNom] = useState("")
       const [prenom, setPrenom] = useState("")
       const [province, setProvince] = useState("")
       const [commune, setCommune] = useState("")
       const [zone, setZone] = useState("")
       const navigation = useNavigation()
       const [dataformulaire, setDataformulaire] = useState([]);

       //creation de la table 

       useEffect(() => {
              db.transaction((tx) => {
                     tx.executeSql(
                            "create table if not exists formulaire (id integer primary key not null, nom text, prenom text, province text, commune text, zone text);"
                     );
              });
       }, []);

       //fonction get pour recuperer les donnees
       useEffect(() => {
              db.transaction((tx) => {
                     tx.executeSql(
                            `select * from formulaire where 1;`,
                            [],
                            (_, { rows: { _array } }) => setDataformulaire(_array)
                     );
              });
       }, []);

       console.log(dataformulaire)

       if (dataformulaire === null || dataformulaire.length === 0) {
              return null;
       }


       const addFileSysteme = async () => {
              try {
                     await shareAsync(
                            FileSystem.documentDirectory + 'SQLite/example.db'
                     )
              }
              catch (error) {
                     console.log(error)
              }

       }

       //fonction de post des donnees
       const ajouter = () => {
              db.transaction(
                     (tx) => {
                            tx.executeSql("insert into formulaire (nom, prenom, province, commune, zone) values (?,?,?,?,?)", [nom, prenom, province, commune, zone]);
                            tx.executeSql("select * from formulaire", [], (_, { rows }) =>
                                   console.log(JSON.stringify(rows))
                            );
                     },
                     null,
              );
              navigation.navigate("Json")
       };

       return (
              <ScrollView keyboardShouldPersistTaps={"handled"}>
                     <View style={styles.flexRow}>
                            <Input
                                   placeholder="Entrez votre nom"
                                   backgroundColor={"#ddd"}
                                   borderRadius={8}
                                   py={2}
                                   mt={2}
                                   value={nom}
                                   onChangeText={(text) => setNom(text)}
                            />

                            <Input
                                   placeholder="Entrez votre prenom"
                                   backgroundColor={"#ddd"}
                                   borderRadius={8}
                                   py={2}
                                   mt={2}
                                   value={prenom}
                                   onChangeText={(text) => setPrenom(text)}
                            />

                            <Input
                                   placeholder="Entrez votre Province"
                                   backgroundColor={"#ddd"}
                                   borderRadius={8}
                                   py={2}
                                   mt={2}
                                   value={province}
                                   onChangeText={(text) => setProvince(text)}
                            />

                            <Input
                                   placeholder="Entrez votre commune"
                                   backgroundColor={"#ddd"}
                                   borderRadius={8}
                                   py={2}
                                   mt={2}
                                   value={commune}
                                   onChangeText={(text) => setCommune(text)}
                            />

                            <Input
                                   placeholder="Entrez votre zone"
                                   backgroundColor={"#ddd"}
                                   borderRadius={8}
                                   py={2}
                                   mt={2}
                                   value={zone}
                                   onChangeText={(text) => setZone(text)}
                            />

                     </View>
                     <View style={{marginHorizontal:20}}>
                     <Button
                            onPress={() => ajouter()}
                            // isLoading={loading}
                            isDisabled={nom == "" || prenom == "" || province == "" || commune == "" || zone == "" }
                            borderRadius={10}
                            px={0}
                            py={2}
                            // width={"80%"}
                            marginTop={5}
                            size="lg"
                            backgroundColor={"#998033"}
                            marginBottom={15}
                            _text={{
                                   fontWeight: 'bold'
                            }}
                     >
                            Enregistrer
                     </Button>
                     </View>

              </ScrollView>
       )
}

const styles = StyleSheet.create({
       flexRow: {
              paddingHorizontal: 20,
              marginTop: 10
       },
       input: {
              borderColor: "#4630eb",
              borderRadius: 4,
              borderWidth: 1,
              height: 40,
              margin: 13,
              padding: 8,
       },

})
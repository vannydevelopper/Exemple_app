import { useState, useEffect } from "react";
import { Text, View, Button, StyleSheet, TouchableNativeFeedback} from "react-native";
import * as SQLite from "expo-sqlite";
import * as FileSystem from 'expo-file-system';
import { shareAsync } from "expo-sharing";

//creation de la base de donnees

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

//Affichage des donnees qui vient de la base de donnees

const ItemsData = ()=>{
       const [dataItems, setdataItems] = useState([]);
       useEffect(() => {
              db.transaction((tx) => {
                     tx.executeSql(
                            `select * from items where 1;`,
                            [],
                            (_, { rows: { _array } }) => setdataItems(_array)
                     );
              });
       }, []);

       console.log(dataItems)

       if (dataItems === null || dataItems.length === 0) {
              return null;
       }

       //Creation la suppression des donnees 
       
       const ondelete = ({id}) =>{
              db.transaction(
                     (tx) => {
                            tx.executeSql(`delete from items where id = ?;`, [id]);
                            const newDataItems = dataItems.filter(dataItem => dataItem.id != id)
                            setdataItems(newDataItems)
                     },

                     null
              )

       }
       return(
              <>
              {dataItems.map((donnee, index)=>{
                     return(
                            <TouchableNativeFeedback key={index} onPress={()=>ondelete({id:donnee.id})}>
                                   <View style={styles.cardPrincipal}>
                                          <View style={styles.cardItems}>
                                                 <Text>{donnee.nom}</Text>
                                                 <Text>{donnee.prenom}</Text>
                                          </View>
                                          <Text>{donnee.adresse}</Text>
                                   </View>
                            </TouchableNativeFeedback>
                     )
              })}
              </>
       )
}

export default function Pvtraite(){

       //En utilisant les donnees json creer  manuellement

       const data = [
              {
                     "nom":"azosenga",
                     "prenom":"vanny",
                     "adresse":"buja"
              },
              {
                     "nom":"dukiwze",
                     "prenom":"darcy",
                     "adresse":"buja"
              }
       ]

       //creation de la table si ca n'existe pas 

       useEffect(() => {
              db.transaction((tx) => {
                     tx.executeSql(
                            "create table if not exists items (id integer primary key not null, nom text, prenom text, adresse text);"
                     );
              });
       }, []);

       //Pour envoye les donnees sur whatsapp ou d'autre application
       
       const addFileSysteme = async () =>{
              try{
                     await shareAsync(
                            FileSystem.documentDirectory + 'SQLite/example.db'
                     )
              }
              catch(error){
                     console.log(error)
              }
              
       }

       //Pour inserer les donnees dans la base de donnees

       const ajouter = ()=>{
              db.transaction(
                     (tx) => {
                            data.forEach(i =>{
                                   tx.executeSql("insert into items (nom, prenom, adresse) values (?, ?,?)", [i.nom, i.prenom, i.adresse]);
                            })
                            tx.executeSql("select * from items", [], (_, { rows }) =>
                                   console.log(JSON.stringify(rows))
                            );
                     },
                     null,
              );
       }


       return(
              <View style={{marginTop: 30}}>
                     <Button title="Submit" onPress={addFileSysteme}/>
                     <View style={{marginTop: 10}}></View>
                     <Button title="Enregistrer" onPress={ajouter}/>
                     <ItemsData/>
              </View>
       )
}

const styles = StyleSheet.create({
       cardPrincipal:{
              marginTop: 20,
              padding: 10,
              backgroundColor:"#fff",
              marginHorizontal: 10,
              borderRadius: 10
       },
       cardItems:{
              flexDirection:"row",
              justifyContent:"space-between"
       }
})
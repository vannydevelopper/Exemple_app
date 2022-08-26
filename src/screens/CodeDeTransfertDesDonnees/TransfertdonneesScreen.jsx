import React from "react"
import { Text, View } from "react-native"

export default function TransfertdonneesScreen() {
        //Pour recuperer le flux de donnees et l'envoyer vers une autres backend
        //dans le controller
        const findAllDocument = async (req, res) => {
                try {
                        const { id_document } = req.params
                        const document = (await jsonModel.findAll(id_document))[0]
                        console.log(document)
                        const donnees = JSON.stringify(document)
                        if (document) {
                                var url = 'http://localhost:3000/document/json';
                                var data = document

                                var response = request({
                                        url: url,
                                        method: "POST",
                                        json: { data }
                                });
                        }
                        res.status(200).json({
                                succes: "true",
                                // document,
                                document
                        })
                }
                catch (error) {
                        console.log(error)
                        res.status(500).send("server error")
                }
        }

        //dans le model on recuperer les donnees avec la findAll
        //model
        const findAll = async (id_document) => {
                try{
                       return query("SELECT * FROM doc_document WHERE 1 AND id = ?",[id_document])
                }
                catch(error){
                       throw error
                }
         }

         //recuperation des donnees dans une autre api 
         const createDocument = async (req, res) => {
                try {
                       const {data} = req.body
                       console.log(data)
                       const validation = new Validation(req.body)
                       validation.run()
                       if (validation.isValidate()) {
                              const { insertId } = await jsonModel.CreateDocument(
                                     data.nom,
                                     data.prenom,
                                     data.fn_pere,
                                     data.ln_pere,
                                     data.fn_mere,
                                     data.ln_mere,
                                     data.sexe,
                                     data.date_naissance,
                                     data.lieu_naissance,
                                     data.province,
                                     data.commune,
                                     data.situation_matrimoniale,
                                     data.adresse_email,
                                     data.telephone,
                                     data.profession,
                                     data.profession_autre,
                                     data.datecreation,
                                     data.paie
                              );
                       }
                }
         
                catch (error) {
                       console.log(error)
                       res.status(500).send("server error")
                }
         }
         //dans le model on recuperer les donnees avec la findAll
        //model
        const CreateDocument = async (nom, prenom, fn_pere, ln_pere, fn_mere, ln_mere, sexe, date_naissance,
                lieu_naissance, province, commune, situation_matrimoniale, adresse_email, telephone, profession,
                profession_autre, datecreation, paie ) => {
                try {
                    var sqlQuery = "INSERT INTO  doc_document_json(nom, prenom, fn_pere, ln_pere, fn_mere, ln_mere, sexe, date_naissance,lieu_naissance, province, commune, situation_matrimoniale, adresse_email, telephone, profession,profession_autre, datecreation, paie)";
                    sqlQuery += "VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
                    return query(sqlQuery, [
                       nom, prenom, fn_pere,
                       ln_pere, fn_mere, ln_mere, sexe,
                       date_naissance,
                       lieu_naissance, province, commune,
                       situation_matrimoniale, adresse_email, telephone, profession,
                       profession_autre, datecreation, paie
            
                    ]);
                } catch (error) {
                    throw error
                }
            
            }
        return (
                <View>
                        <Text>Transfert</Text>
                </View>
        )
}
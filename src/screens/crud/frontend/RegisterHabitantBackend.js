const createAppartementHabitant = async (req, res) => {
        try {
                const { NOM, PRENOM, NUMERO_IDENTITE, LIEU_DELIVRANCE, DATE_DELIVRANCE, PERE, MERE, NUMERO_TELEPHONE, COLLINE_ID, DATE_NAISSANCE, ID_SEXE, ID_ETAT_CIVIL, ID_FONCTION, ID_HABITANT_ROLE } = req.body
                const { PHOTO, PHOTO_CNI1, PHOTO_CNI2 } = req.files
                const { ID_APPARTEMENT } = req.params
                const sqlQuery = `
                    INSERT INTO menage_habitants(
                              NOM,
                              PRENOM,
                              NUMERO_IDENTITE,
                              LIEU_DELIVRANCE,
                              DATE_DELIVRANCE,
                              PERE,
                              MERE,
                              NUMERO_TELEPHONE,
                              COLLINE_ID,
                              DATE_NAISSANCE,
                              ID_SEXE,
                              ID_ETAT_CIVIL,
                              ID_FONCTION,
                              PHOTO,
                              IMAGE1_CNI,
                              IMAGE2_CNI
                    )
                    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `
                const destination = path.resolve("./") + path.sep + "public" + path.sep + "images" + path.sep + "habitants" + path.sep

                const fileName = `${Date.now()}${path.extname(PHOTO.name)}`;
                const newFile = await PHOTO.mv(destination + fileName);
                const fullPath = `${req.protocol}://${req.get("host")}/images/habitants/${fileName}`;

                const fileName1 = `${Date.now()}_1${path.extname(PHOTO_CNI1.name)}`;
                const newFile1 = await PHOTO_CNI1.mv(destination + fileName1);
                const fullPath1 = `${req.protocol}://${req.get("host")}/images/habitants/${fileName1}`;

                const fileName2 = `${Date.now()}_2${path.extname(PHOTO_CNI2.name)}`;
                const newFile2 = await PHOTO_CNI2.mv(destination + fileName2);
                const fullPath2 = `${req.protocol}://${req.get("host")}/images/habitants/${fileName2}`;

                const { insertId: ID_HABITANT } = await query(sqlQuery, [
                        NOM, PRENOM, NUMERO_IDENTITE, LIEU_DELIVRANCE, moment(new Date(DATE_DELIVRANCE)).format("YYYY/MM/DD HH:mm:ss"), PERE, MERE, NUMERO_TELEPHONE, COLLINE_ID, moment(new Date(DATE_NAISSANCE)).format("YYYY/MM/DD HH:mm:ss"), ID_SEXE, ID_ETAT_CIVIL, ID_FONCTION, fullPath, fullPath1, fullPath2
                ])
                const { insertId: ID_APPARTEMENT_HABITANT } = await query('INSERT INTO menage_appartement_habitants(ID_APPARTEMENT, ID_HABITANT, ID_HABITANT_ROLE) VALUES(?, ?, ?)', [
                        ID_APPARTEMENT, ID_HABITANT, ID_HABITANT_ROLE
                ])
                res.status(201).json({
                        ID_APPARTEMENT_HABITANT
                })
        } catch (error) {
                console.log(error)
                res.status(500).send('Server error')
        }
}
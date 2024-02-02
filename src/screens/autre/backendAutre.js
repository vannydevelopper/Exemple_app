/**
* Permet d'enregistrer une incident declarer
* @author Vanny Boy <vanny@mediabox.bi>
* @param {express.Request} req
* @param {express.Response} res 
* @date  1/09/2023
* 
*/
const createIncidents = async (req, res) => {
        try {
            const {
                ID_ORDRE_INCIDENT,ID_TYPE_INCIDENT, DESCRIPTION,NOM_LOGICIEL, Autres, AutresIncident
            } = req.body;
            const date = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
            if (Autres) {
                const newTypeOrdrerInsert = await Ordres_incident.create({
                    ORDRE_INCIDENT: Autres,
                    IS_AUTRE: 1,
                    ID_USER: req.userId,
                })
                const lastInsertOrdre = newTypeOrdrerInsert.toJSON()
                const newTypeIncidentInsert = await Types_incident.create({
                    ID_ORDRE_INCIDENT:lastInsertOrdre.ID_ORDRE_INCIDENT,
                    TYPE_INCIDENT: Autres,
                    IS_AUTRE: 1,
                    ID_USER: req.userId,
                })
                const lastInsertData = newTypeIncidentInsert.toJSON()
                await Incidents.create(
                    {
                        ID_TYPE_INCIDENT: lastInsertData.ID_TYPE_INCIDENT,
                        DESCRIPTION: DESCRIPTION,
                        ID_USER: req.userId,
                    }
                )
            } else if(AutresIncident) {
                const newTypeIncidentInsert = await Types_incident.create({
                    ID_ORDRE_INCIDENT:ID_ORDRE_INCIDENT,
                    TYPE_INCIDENT: AutresIncident,
                    IS_AUTRE: 1,
                    ID_USER: req.userId,
                })
                const lastInsertData = newTypeIncidentInsert.toJSON()
                await Incidents.create(
                    {
                        ID_TYPE_INCIDENT: lastInsertData.ID_TYPE_INCIDENT,
                        DESCRIPTION: DESCRIPTION,
                        ID_USER: req.userId,
                    }
                )
            }else if(NOM_LOGICIEL){
                const incidentInsert = await Incidents.create({
                    ID_TYPE_INCIDENT: ID_TYPE_INCIDENT,
                    ID_INCIDENT_LOGICIEL:NOM_LOGICIEL,
                    DESCRIPTION: DESCRIPTION,
                    ID_USER: req.userId,
                })
            }else{
                const incidentInsert = await Incidents.create({
                    ID_TYPE_INCIDENT: ID_TYPE_INCIDENT,
                    DESCRIPTION: DESCRIPTION,
                    ID_USER: req.userId,
                })
            }
            res.status(RESPONSE_CODES.CREATED).json({
                statusCode: RESPONSE_CODES.CREATED,
                httpStatus: RESPONSE_STATUS.CREATED,
                message: "Insertion faite  avec succès",
            })
        } catch (error) {
            console.log(error)
            res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
                statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
                httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
                message: "Erreur interne du serveur, réessayer plus tard",
            })
        }
    }
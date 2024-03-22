const findHistoriqueDrive = async (driverId,limit = 10,offset = 0,codeCourse,corporate,dateDebut,dateFin) => {
        try {
            var sqlQuery = `
            SELECT c.ID_COURSE,
              c.NUMERO_COURSE,
              c.ADDRESSE_PICKUP,
              c.DISTANCE_PARCOURUE,
              c.DUREE_PARCOURUE,
              c.DATE_INSERTION,
              c.MONTANT,
              c.ID_STATUT,
              c.ADDRESSE_DESTINATION,
              c.ID_COURSE_PROMOTION,
              cc.NOM AS CORPORATE_NAME,
              cm.HEURE_DEBUT,
              cm.HEURE_FIN,
              cm.POURCENTAGE,
              ccm.HEURE_DEBUT CORPO_HEURE_DEBUT,
              ccm.HEURE_FIN CORPO_HEURE_FIN,
              ccm.POURCENTAGE CORPO_POURCENTAGE,
              pay.NOM_METHODE
            FROM courses c
            LEFT JOIN corp_corporates cc ON cc.ID_CORP_CORPORATE = c.ID_CORP_CORPORATE
            LEFT JOIN courses_marges cm ON cm.ID_COURSE_MARGIN = c.ID_COURSE_MARGIN
            LEFT JOIN course_corp_corporate_marges ccm ON ccm.ID_COURSE_CORPO_MARGIN = c.ID_COURSE_CORPO_MARGIN
            LEFT JOIN payments_methods pay ON pay.ID_PAYMENT_METHOD = c.ID_PAYMENT_METHOD
            WHERE c.ID_DRIVER = ?
              AND c.ID_STATUT IN (?)
          `;
    
            const statusList = [
                IDS_COURSE_STATUS.COURSE_TERMINE,
                IDS_COURSE_STATUS.TERMINE_PAR_ADMIN,
                IDS_COURSE_STATUS.ANNLER_PAR_DRIVER,
                IDS_COURSE_STATUS.ANNLER_PAR_RIDER,
                IDS_COURSE_STATUS.ANNLER_PAR_ADMIN,
                IDS_COURSE_STATUS.EN_ATTENTE_DE_VALIDATION,
            ];
    
            const params = [driverId, statusList];
    
            if (codeCourse !== null && codeCourse !== undefined) {
                sqlQuery += " AND c.NUMERO_COURSE = ?";
                params.push(codeCourse);
            }
    
            if (corporate !== null && corporate !== undefined) {
                sqlQuery += " AND cc.NOM = ?";
                params.push(corporate);
            }
    
            if (dateDebut && dateFin) {
                sqlQuery += " AND c.DATE_INSERTION BETWEEN ? AND ?";
                params.push(dateDebut, dateFin);
            }
    
            sqlQuery += " ORDER BY c.DATE_INSERTION DESC";
            sqlQuery += ` LIMIT ${offset}, ${limit}`;
    
            return query(sqlQuery, params);
        } catch (error) {
            console.log(error);
            throw error;
        }
    };
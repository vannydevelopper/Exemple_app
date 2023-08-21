const usersLotQuery = `SELECT abs.*, col.Nom, col.Prenom, st.STATUS_DESCRIPTION  FROM absence_collaborateur abs LEFT JOIN collaborateurs col ON abs.IDEmploye=col.IDEmploye LEFT JOIN statut_absences st ON abs.ID_STATUT_ABSCENCE=st.ID_STATUT_ABSCENCE WHERE abs.ID_ABSENCE_COLLABORATEUR=?`
const userNot = (await query(usersLotQuery, [ID_ABSENCE_COLLABORATEUR]))[0]

var contenu = `Une nouvelle declaration d'absence vient d'etre valide, declarant: ${userNot.Nom} ${userNot.Prenom}, type de d'absence:${userNot.STATUS_DESCRIPTION}, date de declaration: ${userNot.DATE_INSERTION},`

const info = await sendMail({
        to: ['darcy@mediabox.bi', 'vanny@mediabox.bi'],
        subject: "Declaration d'absence"
}, null, contenu)
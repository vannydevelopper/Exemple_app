const getProvinces = async (q) => {
        try {
                var binds = [q]
                var sqlQuery = `
                SELECT ID_PROVINCE_PAYS,
                        PROVINCE_NAME
                FROM province_pays
                WHERE 1
                `

                if (q && q != "") {
                        sqlQuery +=
                                `AND PROVINCE_NAME LIKE '%${q}%'`;
                        // binds.push(`%${q}%`);
                }
                sqlQuery += ` ORDER BY PROVINCE_NAME ASC`
                return query(sqlQuery)
        } catch (error) {
                throw error
        }
}

const findPays = async (q) => {
        try {
                var binds = [q]
                var sqlQuery = `
                SELECT COUNTRY_ID,
                        CommonName
                FROM countries
                WHERE 1
                `

                if (q && q != "") {
                        sqlQuery +=
                                `AND CommonName LIKE '%${q}%'`;
                        // binds.push(`%${q}%`);
                }
                sqlQuery += ` ORDER BY CommonName ASC`
                return query(sqlQuery)
        } catch (error) {
                throw error
        }
}
//generation de code otp
      generateCode:{
        function generateCode(taille=0){
  
                var Caracteres = '0123456789'; 
                var QuantidadeCaracteres = Caracteres.length; 
                QuantidadeCaracteres--; 
                var Hash= ''; 
                  for(var x =1; x <= taille; x++){ 
                      var Posicao = Math.floor(Math.random() * QuantidadeCaracteres);
                      Hash +=  Caracteres.substr(Posicao, 1); 
                  }
                 
                  return Hash; 
              }
        
        module.exports = generateCode
      }  
  
//enregistre code in base de donnee
const create = async (req, res) => {
      try {
            const { password, nom, prenom, numero, cni, sexe, lat, long, PUSH_NOTIFICATION_TOKEN, DEVICE } = req.body;
            const validation = new Validation(
                  req.body,
                  {
                        password: {
                              required: true,
                              length: [8],
                        },
                        nom: "required",
                        prenom: "required",
                        numero: "required",
                        cni: "required",
                  },
                  {
                        password: {
                              required: "Le mot de passe est requis",
                              length: {
                                    fr: "Mot de passe trop court",
                                    en: "Password is too weak",
                                    bi: "Akabanga kanyu ni kagufi",
                                    sw: "Nenosiri fupi mno",
                              },
                        },
                        nom: {
                              required: "Le nom est requis",
                        },
                        prenom: {
                              required: "Le prénom est requis",
                        },
                        numero: {
                              required: "Le numéro est requis",
                        },
                        cni: {
                              required: "Le numéro d'identité est requis",
                        },
                  }
            );
            const userNumero = (await userModel.findBy("NUMERO_CITOYEN", numero))[0];
            if (userNumero) {
                  validation.setError("numero", {
                        fr: "Numéro de téléphone déjà utilisé",
                        en: "Phone number already in use",
                        bi: "Inomero ya ngendanwa yaramaze gukoreshwa",
                        sw: "Nambari ya simu tayari inatumika",
                  });
            }
            await validation.run();
            const isValid = await validation.isValidate()
            if (!isValid) {
                  const errors = await validation.getErrors()
                  return res.status(422).json({ errors });
            }
            const code = generateCode(4)
            const { insertId } = await userModel.createOne(
                  numero,
                  md5(password),
                  nom,
                  prenom,
                  numero,
                  cni,
                  sexe,
                  lat,
                  long,
                  code
            );
            const user = (await userModel.findBy("ID_UTILISATEUR", insertId))[0];
            const notification = (await query('SELECT ID_NOTIFICATION_TOKEN FROM notification_tokens WHERE TOKEN = ? AND ID_UTILISATEUR = ?', [PUSH_NOTIFICATION_TOKEN, user.ID_UTILISATEUR]))[0]
            if (!notification && PUSH_NOTIFICATION_TOKEN) {
                  await query('INSERT INTO notification_tokens(ID_UTILISATEUR, DEVICE, TOKEN, IS_CITOYEN) VALUES(?, ?, ?, ?)', [user.ID_UTILISATEUR, DEVICE, PUSH_NOTIFICATION_TOKEN, user.PROFIL_ID == 7]);
            }
            res.status(200).json({
                  ...user,
                  TOKEN: generateToken({ ...user }, 3600 * 24 * 365 * 3),
            });
      } catch (error) {
            console.log(error);
            res.status(500).send("Server error");
      }
};

//generate token 
const jwt = require("jsonwebtoken");

const generateToken = (data, maxAge) => {
          return jwt.sign(data, process.env.JWT_PRIVATE_KEY, {
                    expiresIn: maxAge,
          });
};
module.exports = generateToken;
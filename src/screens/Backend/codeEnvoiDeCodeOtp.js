//Les routes pour confirmation et resend message
userRouter.post('/confirmation/code', userController.confirmCode)
userRouter.post('/confirmation/resend_code', userController.resendConfirmationCode)

//declaration des variables
const ECONET_PHONE_NUMBER_STARTS = ["79", "71", "76", "72"]
const LUMITEL_PHONE_NUMBER_STARTS = ["69", "61", "68", "67", "62", "65"]
const ONAMOB_PHONE_NUMBER_STARTS = ["77"]
const VALID_PHONE_NUMBER_STARTS = [...ECONET_PHONE_NUMBER_STARTS, ...LUMITEL_PHONE_NUMBER_STARTS, ...ONAMOB_PHONE_NUMBER_STARTS]

/**
 * Répresente un code par défault à utiliser en cas de non envoir de OTP de vérification
 *  @type {Number}
 */
const DEFAULT_CODE = 1234

/**
 * 
 * @param {string} numero le numéro de téléphone à envoyer le numéro
 * @returns {string} le code envoyer sur ce numero
 */
const sendConfirmationCode = (numero) => {
          /**
           * Représente les deux chiffres qui commencent sur un numéro burundais
           *  @type  {string} 
           */
          const phoneStart = numero.substring(0, 2)

          // si c'est un numéro econet, on génère un code aléatoire, sinon on ajoute le code 1234 par défault
          var code
          if(ECONET_PHONE_NUMBER_STARTS.includes(phoneStart)) {
                    code = generateCode(4)
                    sendSMS(null, numero, `Votre code de confirmation sur l'application de PSR: ${code}`, null, 0)
          } else {
                    code = DEFAULT_CODE
          }
          return code
}

//enregistre le code de l'utilisateurs

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
                                        bi: "Inomero ya telephone yaramaze gukoreshwa",
                                        sw: "Nambari ya simu tayari inatumika",
                              });
                    }
                    /**
                     * Représente les deux chiffres qui commencent sur un numéro burundais
                     *  @type  {string} 
                     */
                    const phoneStart = numero.substring(0, 2)
                    
                    // si ce n'est pas un numéro burundais, on sort une erreur
                    if (!VALID_PHONE_NUMBER_STARTS.includes(phoneStart)) {
                              validation.setError('numero', {
                                        fr: "Numéro de téléphone invalide",
                                        en: "Invalid phone number",
                                        bi: "Inomero ya telephone siyo",
                                        sw: "Nambari ya simu si sahihi",
                              })
                    }
                    await validation.run();
                    const isValid = await validation.isValidate()
                    if (!isValid) {
                              const errors = await validation.getErrors()
                              return res.status(422).json({ errors });
                    }
                    const code = sendConfirmationCode(numero)
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

//confirmer le code de l'utilisateur
const confirmCode = async (req, res) => {
          try {
                    const { ID_UTILISATEUR, CODE_OTP } = req.body;
                    const validation = new Validation(
                              req.body,
                              {
                                        ID_UTILISATEUR: "required",
                                        CODE_OTP: "required"
                              },
                              {
                                        ID_UTILISATEUR: {
                                                  required: "Le ID_UTILISATEUR est requis",
                                        },
                                        CODE_OTP: {
                                                  required: "Le CODE_OTP est requis",
                                        }
                              }
                    );
                    await validation.run();
                    const isValid = await validation.isValidate()
                    if (!isValid) {
                              const errors = await validation.getErrors()
                              return res.status(422).json({ errors });
                    }
                    const userIdNumero = (await userModel.findById("ID_UTILISATEUR", ID_UTILISATEUR))[0];
                    // console.log(userIdNumero)
                    if (userIdNumero) {
                              if (userIdNumero.CODE_OTP == CODE_OTP) {
                                        await query("UPDATE utilisateurs SET IS_CONFIRM = ?, DATE_CONFIRMATION = ? WHERE ID_UTILISATEUR = ?", [1, moment().format("YYYY/DD/MM HH:MM:SS"), ID_UTILISATEUR])
                                        res.status(200).json({
                                                  message: "Le code de confirmation est correcte",
                                        });
                              } else {
                                        res.status(404).json({
                                                  message: {
                                                            fr: "Code de confirmation invalide",
                                                            en: "Invalid confirmation code",
                                                            bi: "Igiharuro c'isuzuma sico",
                                                            sw: "Nambari ya uthibitishaji si sahihi"
                                                  }
                                        });
                              }

                    }
          } catch (error) {
                    console.log(error);
                    res.status(500).send("Server error");
          }
};

/**
 * Réenvoyer un code de confirmation
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @returns
 */
const resendConfirmationCode = async (req, res) => {
          try {
                    const { numero, ID_UTILISATEUR } = req.body
                    const code = sendConfirmationCode(numero)
                    await query('UPDATE utilisateurs SET CODE_OTP = ? WHERE ID_UTILISATEUR = ?', [code, ID_UTILISATEUR])
                    res.status(200).json({
                              message: {
                                        fr: "Code réenvoyé avec succès",
                                        en: "Code resended successfully",
                                        sw: "msimbo umetumwa tena",
                                        bi: "Ikode yongewe kurungikwa",
                              }
                    })
          } catch (error) {
                    console.log(error);
                    res.status(500).send("Server error");
          }
}
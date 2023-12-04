const RESPONSE_CODES = require("../../../constants/RESPONSE_CODES")
const RESPONSE_STATUS = require("../../../constants/RESPONSE_STATUS")
const express = require('express')
const Messages_drivers = require("../../../models/admin/Messages_drivers")
const Drivers = require("../../../models/admin/Drivers")
const { Op, fn } = require("sequelize")
const sequelize = require("../../../utils/sequerize")

/**
 * Permet d'envoye un message au chauffeur
 * @author Dukizwe Darcie <darcy@mediabox.bi>
 * @date 29/09/2023
 * @param {express.Request} req
 * @param {express.Response} res
 */
const sendDriverMessage = async (req, res) => {
          try {
                    const { idDriver } = req.params
                    const { message, idUser, isDriver } = req.body
                    const newMessage = await Messages_drivers.create({
                              ID_DRIVER: idDriver,
                              ID_UTILISATEUR: idUser,
                              IS_DRIVER: isDriver,
                              MESSAGE: message
                    })
                    req.app.io.emit("MESSAGE_ENVOYER", message)
                    res.status(RESPONSE_CODES.OK).json({
                              statusCode: RESPONSE_CODES.OK,
                              httpStatus: RESPONSE_STATUS.OK,
                              message: "Message envoyé au chauffeur",
                              result: newMessage.toJSON()
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

/**
 * Permet de recuperer les conversations des chauffeurs
 * @author Dukizwe Darcie <darcy@mediabox.bi>
 * @date 29/09/2023
 * @param {express.Request} req
 * @param {express.Response} res
 */
const getConversations = async (req, res) => {
          try {
                    const { rows = 10, first = 0, sortField, sortOrder, search, userId } = req.query

                    const defaultSortField = "DATE_INSERTION"
                    const defaultSortDirection = "DESC"
                    const sortColumns = {
                              drivers: {
                                        as: "drivers",
                                        fields: {
                                                  NOM: 'NOM'
                                        }
                              },
                    }

                    var orderColumn, orderDirection

                    // sorting
                    var sortModel
                    if (sortField) {
                              for (let key in sortColumns) {
                                        if (sortColumns[key].fields.hasOwnProperty(sortField)) {
                                                  sortModel = {
                                                            model: key,
                                                            as: sortColumns[key].as
                                                  }
                                                  orderColumn = sortColumns[key].fields[sortField]
                                                  break
                                        }
                              }
                    }
                    if (!orderColumn || !sortModel) {
                              orderColumn = sortColumns.drivers.fields.NOM
                              sortModel = {
                                        model: 'drivers',
                                        as: sortColumns.drivers
                              }
                    }
                    // ordering
                    if (sortOrder == 1) {
                              orderDirection = 'ASC'
                    } else if (sortOrder == -1) {
                              orderDirection = 'DESC'
                    } else {
                              orderDirection = defaultSortDirection
                    }

                    // searching
                    const globalSearchColumns = [
                              'NOM',
                              'PRENOM',
                              'TELEPHONE',
                    ]
                    var globalSearchWhereLike = {}
                    if (search && search.trim() != "") {
                              const searchWildCard = {}
                              globalSearchColumns.forEach(column => {
                                        searchWildCard[column] = {
                                                  [Op.substring]: search
                                        }
                              })
                              globalSearchWhereLike = {
                                        [Op.or]: searchWildCard
                              }
                    }
                    const result = await Drivers.findAll({
                              limit: parseInt(rows),
                              offset: parseInt(first),
                              include: [{
                                        model: Messages_drivers,
                                        as: 'driverMessages',
                                        limit: 1,
                                        order: [['DATE_INSERTION', 'DESC']],
                                        where: {
                                                  ID_UTILISATEUR: userId
                                        }
                              }],
                              // order: [
                              //           [sortModel, orderColumn, orderDirection]
                              // ],
                              order: [
                                        [sequelize.literal('(SELECT MAX(`messages_drivers`.`DATE_INSERTION`) FROM `messages_drivers` WHERE `messages_drivers`.`ID_DRIVER` = `drivers`.`ID_DRIVER`)'), 'DESC'],
                              ],
                              where: {
                                        [Op.and]: [
                                                  globalSearchWhereLike,
                                                  { IS_OTP_CONFIRMED: true }
                                        ]
                              },
                    })
                    res.status(RESPONSE_CODES.OK).json({
                              statusCode: RESPONSE_CODES.OK,
                              httpStatus: RESPONSE_STATUS.OK,
                              message: "Message envoyé au chauffeur",
                              result: result
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

/**
 * Permet de recuperer les mesages entre le chauffeur et l'utilisateu
 * @author Dukizwe Darcie <darcy@mediabox.bi>
 * @date 29/09/2023
 * @param {express.Request} req
 * @param {express.Response} res
 */
const getMessages = async (req, res) => {
          try {
                    const { rows = 10, first = 0, sortField, sortOrder, search, userId } = req.query
                    const { idDriver } = req.params
                    const defaultSortField = "DATE_INSERTION"
                    const defaultSortDirection = "DESC"
                    const sortColumns = {
                              messages_drivers: {
                                        as: "messages_drivers",
                                        fields: {
                                                  DATE_INSERTION: "DATE_INSERTION",
                                                  MESSAGE: "MESSAGE"
                                        }
                              },
                    }

                    var orderColumn, orderDirection

                    // sorting
                    var sortModel
                    if (sortField) {
                              for (let key in sortColumns) {
                                        if (sortColumns[key].fields.hasOwnProperty(sortField)) {
                                                  sortModel = {
                                                            model: key,
                                                            as: sortColumns[key].as
                                                  }
                                                  orderColumn = sortColumns[key].fields[sortField]
                                                  break
                                        }
                              }
                    }
                    if (!orderColumn || !sortModel) {
                              orderColumn = sortColumns.messages_drivers.fields.DATE_INSERTION
                              sortModel = {
                                        model: 'messages_drivers',
                                        as: sortColumns.messages_drivers.as
                              }
                    }
                    // ordering
                    if (sortOrder == 1) {
                              orderDirection = 'ASC'
                    } else if (sortOrder == -1) {
                              orderDirection = 'DESC'
                    } else {
                              orderDirection = defaultSortDirection
                    }

                    // searching
                    const globalSearchColumns = [
                              'MESSAGE'
                    ]
                    var globalSearchWhereLike = {}
                    if (search && search.trim() != "") {
                              const searchWildCard = {}
                              globalSearchColumns.forEach(column => {
                                        searchWildCard[column] = {
                                                  [Op.substring]: search
                                        }
                              })
                              globalSearchWhereLike = {
                                        [Op.or]: searchWildCard
                              }
                    }
                    const result = await Messages_drivers.findAll({
                              limit: parseInt(rows),
                              offset: parseInt(first),
                              order: [
                                        [sortModel, orderColumn, orderDirection]
                              ],
                              where: {
                                        [Op.and]: [
                                                  globalSearchWhereLike,
                                                  {
                                                            [Op.and]: [{
                                                                      ID_DRIVER: idDriver
                                                            }, {
                                                                      ID_UTILISATEUR: userId
                                                            }]
                                                  }
                                        ]
                              },
                    })
                    res.status(RESPONSE_CODES.OK).json({
                              statusCode: RESPONSE_CODES.OK,
                              httpStatus: RESPONSE_STATUS.OK,
                              message: "Message envoyé au chauffeur",
                              result
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

/**
 * Permet de marquer les messges d'un chaffeur comme lus
 * @author Dukizwe Darcie <darcy@mediabox.bi>
 * @date 02/11/2023
 * @param {express.Request} req
 * @param {express.Response} res
 */
const readDriverMessages = async (req, res) => {
          try {
                    const { idDriver } = req.params
                    const { userId } = req.query
                    await Messages_drivers.update({
                              IS_READED: 1,
                    }, {
                              where: {
                                        [Op.and]: [{
                                                  ID_DRIVER: idDriver,
                                        }, {
                                                  ID_UTILISATEUR: userId
                                        }, {
                                                  IS_DRIVER: 1
                                        }]
                              }
                    })
                    res.status(RESPONSE_CODES.OK).json({
                              statusCode: RESPONSE_CODES.OK,
                              httpStatus: RESPONSE_STATUS.OK,
                              message: "Messages lus avec succes",
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

/**
 * Permet de recuperer le nombre des messages non lus d'un chauffeur
 * @author Dukizwe Darcie <darcy@mediabox.bi>
 * @date 29/09/2023
 * @param {express.Request} req
 * @param {express.Response} res
 */
const getUnreadDrivers = async (req, res) => {
          try {
                    const count = await Messages_drivers.findAll({
                              attributes: [
                                        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('ID_DRIVER'))), 'count'],
                              ],
                              where: {
                                        [Op.and]: [
                                                  { IS_READED: 0 },
                                                  { IS_DRIVER: 1 }
                                        ]
                              },
                    })
                    res.status(RESPONSE_CODES.OK).json({
                              statusCode: RESPONSE_CODES.OK,
                              httpStatus: RESPONSE_STATUS.OK,
                              message: "Nombre de conversations non lus",
                              result: count[0].toJSON().count
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
module.exports = {
          sendDriverMessage,
          getConversations,
          getMessages,
          readDriverMessages,
          getUnreadDrivers
}
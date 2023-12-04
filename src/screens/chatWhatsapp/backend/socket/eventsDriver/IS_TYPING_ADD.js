const IS_TYPING_ADD = data => {
        const { userType, idAdmin, idDriver } = data
        if (userType == 'rider') {
                  io.to(`d_${idDriver}`).emit('IS_TYPING_ADD', { ...data })
        } else {
                //   io.to(`r_${idAdmin}`).emit('IS_TYPING_ADD', { ...data })
        }
}

module.exports = IS_TYPING_ADD
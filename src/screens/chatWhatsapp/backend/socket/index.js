const IS_TYPING = require("./events/IS_TYPING")
const IS_TYPING_ADD = require("./eventsDriver/IS_TYPING_ADD")
const UPDATE_DRIVER_LOCATION = require("./events/UPDATE_DRIVER_LOCATION")

const handleSocketEvents = io => {
        io.on('connection', socket => {
                socket.on('join', (data) => {
                        console.log(data.userType, data.userId, "Connect to a socket")
                        socket.join(data.userId)
                })
                socket.on('UPDATE_DRIVER_LOCATION', data => UPDATE_DRIVER_LOCATION(data, io))
                socket.on('IS_TYPING', IS_TYPING)
                socket.on('IS_TYPING_ADD', IS_TYPING_ADD)
        })
        io.on('disconnect', () => {
                console.log('user disconnected')
        })
}

module.exports =  handleSocketEvents 
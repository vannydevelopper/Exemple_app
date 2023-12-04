const { updateDriverLocation } = require("../../controllers/driver/drivers.controller")

const UPDATE_DRIVER_LOCATION = (data, io) => {
          const { locations, driverId } = data
          //         console.log(data)
          if (driverId) {
                    io.emit("UPDATE_DRIVER_LOCATION", data)
                    updateDriverLocation(driverId, locations.timestamp, locations.coords)
          }
}

module.exports = UPDATE_DRIVER_LOCATION
var Ecobici = require('ecobici')

var client = new Ecobici({
  clientId: '',
  clientSecret: ''
})

client.getStations('status').then((response) => {
  console.log('status', response)
}).catch((err) => {
  console.log(err)
})

client.getStations('info').then((response) => {
  console.log('Info', response)
}).catch((err) => {
  console.log(err)
})

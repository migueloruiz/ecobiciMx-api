'use strict'

var request = require('request')
var extend = require('deep-extend')
var moment = require('moment')

function Ecobici (options) {
  if (!(this instanceof Ecobici)) { return new Ecobici(options) }

  this.options = extend({
    clientId: '',
    clientSecret: '',
    accessToken: '',
    refreshToken: '',
    expireTimestamp: '',
    oauthBase: 'https://pubsbapi.smartbike.com/oauth/v2/token',
    infoBase: 'https://pubsbapi.smartbike.com/api/v1/stations.json',
    statusBase: 'https://pubsbapi.smartbike.com/api/v1/stations/status.json'
  }, options)
}

Ecobici.prototype.__isAccessTokenValid = function () {
  let now = moment()
  try {
    return this.options.accessToken !== '' && this.options.expireTimestamp.isAfter(now)
  } catch (err) {
    return false
  }
}

Ecobici.prototype.__buildEndpointOptions = function (type) {
  if (type === undefined) throw new Error('Endpoint Type Not Valid')

  const endpointTypes = {
    'info': this.options.infoBase,
    'status': this.options.statusBase,
    'oauth': this.options.oauthBase,
    'refresh': this.options.oauthBase
  }

  let requestOptions = {
    method: 'get',
    url: ''
  }

  if (endpointTypes.hasOwnProperty(type)) {
    requestOptions.url = endpointTypes[type]
  } else {
    throw new Error('Endpoint Type Not Valid: ' + type)
  }

  if (type === 'oauth') {
    requestOptions.qs = {
      client_id: this.options.clientId,
      client_secret: this.options.clientSecret,
      grant_type: 'client_credentials'
    }
  } else if (type === 'refresh') {
    requestOptions.qs = {
      client_id: this.options.clientId,
      client_secret: this.options.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: this.options.refreshToken
    }
  } else {
    requestOptions.headers = {
      'Authorization': 'Bearer ' + this.options.accessToken
    }
  }
  return requestOptions
}

Ecobici.prototype.__request = function (type) {
  let options = this.__buildEndpointOptions(type)

  return new Promise(function (resolve, reject) {
    request(options, function (error, response, data) {
      if (error) return reject(error)

      try {
        data = (data === '') ? {} : JSON.parse(data)
      } catch (parseError) {
        return reject(new Error(`JSON parseError with HTTP Status: ${response.statusCode} ${response.statusMessage}`))
      }

      if (response.statusCode !== 200) {
        let error = (data.hasOwnProperty('error')) ? data : new Error(`HTTP Error: ${response.statusCode} ${response.statusMessage}`)
        reject(error)
      }

      resolve(data)
    })
  })
}

Ecobici.prototype.__updateAccessTokenData = function () {
  var _this = this
  return new Promise(function (resolve, reject) {
    if (_this.__isAccessTokenValid()) resolve()
    let type = (_this.options.accessToken === '') ? 'oauth' : 'refresh'
    _this.__request(type).then((response) => {
      _this.options.expireTimestamp = moment().add(response.expires_in, 'seconds')
      _this.options.accessToken = response.access_token
      _this.options.refreshToken = response.refresh_token
      resolve()
    }).catch((error) => {
      reject(error)
    })
  })
}

Ecobici.prototype.getStations = function (type) {
  if (type !== 'info' && type !== 'status') throw new Error(`Sations Type Sholud be 'info' or 'status'`)

  let _this = this
  return this.__updateAccessTokenData()
  .then(() => {
    return _this.__request(type)
  })
  .catch((error) => {
    return new Promise(function (resolve, reject) {
      reject(error)
    })
  })
}

module.exports = Ecobici

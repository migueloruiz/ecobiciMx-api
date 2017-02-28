'use strict'

var assert = require('assert')
var nock = require('nock')
var moment = require('moment')
var Ecobici = require('../lib/ecobici')

describe('Ecobici', function () {
  describe('Constructor', function () {
    var defaults = {}
    before(function () {
      defaults = {
        clientId: null,
        clientSecret: null,
        accessToken: null,
        refreshToken: null,
        expireTimestamp: null,
        oauthBase: 'https://pubsbapi.smartbike.com/oauth/v2/token',
        infoBase: 'https://pubsbapi.smartbike.com/api/v1/stations.json',
        statusBase: 'https://pubsbapi.smartbike.com/api/v1/stations/status.json'
      }
    })

    it('create new instance', function () {
      var client = new Ecobici()
      assert(client instanceof Ecobici)
    })

    it('auto constructs', function () {
      var client = Ecobici()
      assert(client instanceof Ecobici)
    })

    it('has default options', function () {
      var client = new Ecobici()
      assert.deepEqual(
        Object.keys(defaults),
        Object.keys(client.options)
      )
    })

    it('accepts and overrides options', function () {
      var options = {
        clientId: 'clientId',
        clientSecret: 'clientSecret'
      }
      var client = new Ecobici(options)
      assert.equal(client.options.clientId, options.clientId)
      assert.equal(client.options.clientSecret, options.clientSecret)
    })
  })

  describe('Methods', function () {
    describe('__isAccessTokenValid()', function () {
      var client

      before(function () {
        client = new Ecobici()
      })

      it('no accessToken', function () {
        assert.equal(client.__isAccessTokenValid(), false)
      })

      it('access token with out timestamp', function () {
        client.options.accessToken = 'XXXXXX'
        assert.equal(client.__isAccessTokenValid(), false)
      })

      it('access token with not valid timestamp', function () {
        client.options.accessToken = 'XXXXXX'
        client.options.expireTimestamp = moment().subtract(1, 'h')
        assert.equal(client.__isAccessTokenValid(), false)
      })

      it('access token with valid timestamp', function () {
        client.options.expireTimestamp = moment().add(1, 'h')
        client.options.accessToken = 'XXXXXX'
        assert.equal(client.__isAccessTokenValid(), true)
      })
    })

    describe('__buildEndpointOptions()', function () {
      var client

      before(function () {
        client = new Ecobici({
          clientId: 'clientId',
          clientSecret: 'clientSecret',
          accessToken: 'accessToken',
          refreshToken: 'refreshToken'
        })
      })

      it('method exists', function () {
        assert.equal(typeof client.__buildEndpointOptions, 'function')
      })

      it('no valid types', function () {
        assert.throws(
          client.__buildEndpointOptions,
          Error
        )

        assert.throws(
          function () { client.__buildEndpointOptions() },
          function (err) {
            return (err instanceof Error) && /Endpoint Type Not Valid/.test(err)
          },
          'Unexpected Error'
        )

        assert.throws(
          function () { client.__buildEndpointOptions('xxxxx') },
          function (err) {
            return (err instanceof Error) && /Endpoint Type Not Valid/.test(err)
          },
          'Unexpected Error'
        )
      })

      it('build options', function () {
        assert.deepEqual(
          client.__buildEndpointOptions('status'),
          {
            method: 'get',
            url: 'https://pubsbapi.smartbike.com/api/v1/stations/status.json',
            headers: {
              'Authorization': 'Bearer ' + client.options.accessToken
            }
          }
        )

        assert.deepEqual(
          client.__buildEndpointOptions('info'),
          {
            method: 'get',
            url: 'https://pubsbapi.smartbike.com/api/v1/stations.json',
            headers: {
              'Authorization': 'Bearer ' + client.options.accessToken
            }
          }
        )

        assert.deepEqual(
          client.__buildEndpointOptions('oauth'),
          {
            method: 'get',
            url: 'https://pubsbapi.smartbike.com/oauth/v2/token',
            qs: {
              client_id: client.options.clientId,
              client_secret: client.options.clientSecret,
              grant_type: 'client_credentials'
            }
          }
        )

        assert.deepEqual(
          client.__buildEndpointOptions('refresh'),
          {
            method: 'get',
            url: 'https://pubsbapi.smartbike.com/oauth/v2/token',
            qs: {
              client_id: client.options.clientId,
              client_secret: client.options.clientSecret,
              grant_type: 'refresh_token',
              refresh_token: client.options.refreshToken
            }
          }
        )
      })
    })

    describe('__request()', function () {
      before(function () {
        this.nock = nock('https://pubsbapi.smartbike.com')
        this.ecobici = new Ecobici()
      })

      it('accepts any 2xx response', function (done) {
        var jsonResponse = { stations: [] }
        this.nock.get(/.*/).reply(200, jsonResponse)
        this.ecobici.__request('status').then((data) => {
          assert.deepEqual(data, jsonResponse)
          done()
        })
      })

      it('errors when there is a bad http status code with error object', function (done) {
        var jsonResponse = {error: 'algo'}
        this.nock.get(/.*/).reply(400, jsonResponse)
        this.ecobici.__request('status').then((data) => {
          done()
        }).catch((error) => {
          assert.deepEqual(error, jsonResponse)
          done()
        })
      })

      it('errors when there is a bad http status', function (done) {
        this.nock.get(/.*/).reply(500, '{}')
        this.ecobici.__request('status').then((data) => {
          done()
        }).catch((error) => {
          assert(error instanceof Error)
          done()
        })
      })

      it('errors on bad json', function (done) {
        this.nock.get(/.*/).reply(200, 'fail whale')
        this.ecobici.__request('status').then((data) => {
          done()
        }).catch((error) => {
          assert(error instanceof Error)
          done()
        })
      })

      it('allows an empty response', function (done) {
        this.nock.get(/.*/).reply(200, '')
        this.ecobici.__request('status').then((data) => {
          assert.deepEqual(data, {})
          done()
        })
      })

      it('errors on a request or network error', function (done) {
        this.nock.get(/.*/).replyWithError('something bad happened')
        this.ecobici.__request('status').then((data) => {
          done()
        }).catch((error) => {
          assert(error instanceof Error)
          assert.equal(error.message, 'something bad happened')
          done()
        })
      })
    })

    // TODO
    // describe('__updateAccessTokenData', function () {
      // token not init
      // token timestamp not valid
      // test refresh
    // })
    // describe('getStations(type)', function () {
    // })
  })
})

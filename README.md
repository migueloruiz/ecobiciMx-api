# Ecobici for Node.js

Cliente Asyncrono para la el API publica de [Ecobici de la Ciudad de México](https://www.ecobici.cdmx.gob.mx/es/informacion-del-servicio/open-data)

[![npm version](https://badge.fury.io/js/ecobicimx.svg)](https://badge.fury.io/js/ecobicimx)

```javascript
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
```

## Instalación

`npm install ecobicimx`

## Quick Start

Se requieren de credenciales validas para accesar a los datos abiertos de Ecobici. Puedes obtenener estos llaves/token [aquí](https://www.ecobici.cdmx.gob.mx/es/informacion-del-servicio/open-data).

## Autenticacion:

```javascript
var client = new Ecobici({
  clientId: 'CLIENT_ID_TOKEN',
  clientSecret: 'CLIENT_SECRET_TOKEN'
})
```

Añade tus credenciales segun correspondan. Por seguridad utiliza variables de entorno para mantener sus credenciales privadas seguras:

```javascript
var client = new Ecobici({
  clientId: process.env.ECOBICI_CLIENT_ID_TOKEN,
  clientSecret: process.env.ECOBICI_CLIENT_SECRET_TOKEN
})
```

## Endpoint
Segun la [documnetacion oficial de Ecobici](https://www.ecobici.cdmx.gob.mx/sites/default/files/pdf/manual_api_opendata_esp_final.pdf) existen 3 endpoint:

| Enpoint | Funcion | Decripcion |
|-----------------------------------|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Autenticación | ------------ | El manejo del token de autenticacción y su renovación se manejan automaticamente por el esta liberia, se renueva el token cada 3600 segundos según lo estipulado por la [documentación](https://www.ecobici.cdmx.gob.mx/sites/default/files/pdf/manual_api_opendata_esp_final.pdf)   |
| Información General de Estaciones | getStations('info') | Devuelve una lista con la información general de las estaciones |
| Disponivilidad de Estaciones | getStations('status') | Devuelve una lista con la informacion de disponivilidad de cada estación |

const express = require('express')
const serveStatic = require('serve-static')

module.exports = new Promise(function (resolve, reject) {
  const app = express()

  app.use('/test/site', serveStatic(__dirname));
  const server = app.listen(8080)

  resolve(server);
});

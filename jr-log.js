// 3rd party
var bunyan = require('bunyan');
var PrettyStream = require('bunyan-prettystream');
// Application

function createLogger(options) {
  var options = options || {};
  var pretty = (options.pretty === undefined) ? false : options.pretty;

  function errorSerializer(err) {
    var json = {
      message: err.message,
      stack: err.stack
    };
    return json;
  }


  // This is used to filter out only the properties we care about in the request
  // object. When the object is passed like
  // log.info({ "req": req }, 'message')
  function reqSerializer(req) {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    var json = {
      method: req.method,
      url: req.url,
      headers: {
        'user-agent': req.headers['user-agent']
      },
      body: req.body,
      ip: ip
    };
    // Only add the header if it is defined
    function addHeaderIfDefined(key) {
      if (req.headers[key]) {
        json.headers[key] = req.headers[key];
      }
    }
    // Add optional headers to serializer
    addHeaderIfDefined('host');
    addHeaderIfDefined('content-type');
    addHeaderIfDefined('accept');
    if (req.user) {
      json.userid = req.user.id;
      json.username = req.user.username;
    }
    return json;
  }

  var loggerOptions = {
    name: 'partners',
    serializers: {
      req: reqSerializer,
      error: errorSerializer
    }
  };

  // If this is development environment, we want it to be pretty log files and
  // bypass bunyan's javascript based logs. This can also be done by piping output
  // to bunyan like node server.js | bunyan.  This just enables the nodemon
  // functionality in gulp to have pretty output by default
  if (pretty) {
  // Create a pretty formatter for development
    var prettyStdOut = new PrettyStream();
    prettyStdOut.pipe(process.stdout);
    loggerOptions.streams = [ {
      level: 'debug',
      type: 'raw',
      stream: prettyStdOut
    } ];
  }

  var log = bunyan.createLogger(loggerOptions);
  var logger = {};
  logger.info = log.info.bind(log);
  logger.error = log.error.bind(log);

  return logger;
}

module.exports = createLogger;
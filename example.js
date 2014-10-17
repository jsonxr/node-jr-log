var jrlog = require('./jr-log');

var log = jrlog({pretty: true});
log.info("Jason was here");
log.error("example error");

var log = jrlog(  );
log.info("Jason was here");

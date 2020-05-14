const debug = require('debug')('app:error');

module.exports = (err, request, response, next) => {
  // wait a second before displaying the error
  setTimeout(() => {
    // extract the error message
    const errorMessage = err.isJoi
      ? err.details.map((x) => x.message).join()
      : err.message || err.error || err;
    // log the error message
    debug(errorMessage);
    // send the error messsage to the client
    response.type('text/plain').status(500).send(errorMessage);
  }, 1000);
};

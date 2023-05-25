class ServerError extends Error {
  /**
   * Server error to handle internally thrown errors so we can more easily trace them back
   * @param {number} status The HTTP error status to throw
   * @param {string} message The message to display with the error
   * @param {string} log Traceback information for where the error occurred
   * @constructor
   */
  constructor(status, message, log) {
    super(message);
    if (!log) {
      this.log = message;
    } else {
      this.log = log;
    }
    this.status = status;
  }
}

module.exports = ServerError;

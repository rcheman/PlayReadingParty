class ServerError extends Error {
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

class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.type = "AuthenticationError"
  }
}

class RejectionError extends Error {
  constructor(message) {
    super(message);
    this.type = "RejectionError";
  }
}

module.exports =  { AuthenticationError, RejectionError }

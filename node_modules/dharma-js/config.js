const config = {
  development: {
    provider: 'http://localhost:8546',
  },
  test: {
    provider: 'http://localhost:8546',
  }
}

module.exports = config[process.env.ENV]

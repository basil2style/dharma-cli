const ENV = process.env.ENV || 'production';

const CONFIG =  {
  development: {
    WEB3_RPC_PROVIDER: 'https://localhost:8546',
    RAA_API_ROOT: 'http://localhost:8080/api'
  },

  production: {
    WEB3_RPC_PROVIDER: 'https://localhost:8546',
    RAA_API_ROOT: 'http://localhost:8080/api'
  }
}

 module.exports = CONFIG[ENV];

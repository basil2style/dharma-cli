'use strict';

var ENV = process.env.ENV || 'production';

var CONFIG = {
  development: {
    WEB3_RPC_PROVIDER: 'http://ec2-34-213-32-77.us-west-2.compute.amazonaws.com:8545',
    RAA_API_ROOT: 'http://localhost:8080/api'
  },

  production: {
    WEB3_RPC_PROVIDER: 'http://ec2-34-213-32-77.us-west-2.compute.amazonaws.com:8545',
    RAA_API_ROOT: 'http://localhost:8080/api'
  }
};

module.exports = CONFIG[ENV];
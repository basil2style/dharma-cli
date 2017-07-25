'use strict'

var observer = require('./src/observer'),
    facade = require('./src/facade'),
    prototype = require('./src/prototype'),
    flyweight = require('./src/flyweight');


module.exports = {
      observerPattern: observerPattern,
      facadePattern: facadePattern,
      prototypePattern: prototypePattern,
      flyweightPattern: flyweightPattern
};

function observerPattern(){
      return observer;
}

function facadePattern(){
      return facade;
}

function prototypePattern(){
      return prototype;
}

function flyweightPattern(){
      return flyweight;
}

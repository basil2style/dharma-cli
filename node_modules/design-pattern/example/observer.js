var designPatterns = require('../index'), /* change to "var designPatterns = require('design-pattern');" for using outside the module */
    observerPattern =  designPatterns.observerPattern(),
    subject = observerPattern.createSubject();


var MyObserverClass = function(id){
	this.id = id;
	this.update = function(context){
	  console.log('Observer(' + this.id + ') context',context);
	};
};

var observer1 = new MyObserverClass(1);
var observer2 = new MyObserverClass(2);

subject.addObserver(observer1);
subject.addObserver(observer2);

var context = {data: 'data'};
subject.notify(context);

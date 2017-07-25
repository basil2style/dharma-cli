(function(exports){

	exports.stuff = function(){
		return new Stuff();
	};

	var Stuff = function(){
	};

}(typeof exports === 'undefined' ? this.namedPattern = {} : exports));

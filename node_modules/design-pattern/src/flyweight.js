
(function(exports){

      var flyweightFactory = new FlyweightFactory(); 

      exports.add = function(userContextJson){
            return flyweightFactory.add(userContextJson);
      };

      exports.get = function(uniqueValue){
            return flyweightFactory.get(uniqueValue);
      };

      exports.count = function(){
            return flyweightFactory.count();
      };

      function Flyweight(context) {
            this.context = context;
      };

      function FlyweightFactory(){
            var flyweights = {},
                numOfFlyweights = 0;  

            return {

                  add: function (userContextJson) {
                        var contextJson = userContextJson || {},
                            value = contextJson.value || JSON.stringify(contextJson)   
                            key = value;
                        
                        if (!flyweights[key]) {
                              flyweights[key] = new Flyweight(contextJson);
                              numOfFlyweights++;
                        }

                        return flyweights[key].context;
                  },

                  get: function (key) {
                        return flyweights[key].context;
                  },
             
                  count: function () {
                        return numOfFlyweights;
                  }
            };
      }


}(typeof exports === 'undefined' ? this.flyweightPattern = {} : exports));


(function(exports){

    exports.moduleA = function(){
        return new ModuleA();
    };

    exports.moduleB = function(){
        return new ModuleB();
    };

    var ModuleA = function() {
        var name = 'ModuleA',
            _private = {
                pre: function(context) {
                    console.log(name + ' pre',context);
                },
                op1: function(context) {
                    console.log(name + ' op1',context);
                },
                op2: function(context) {
                    console.log(name + ' op2',context);
                },
                op3: function(context) {
                    console.log(name + ' op3',context);
                },
                op4: function(context){
                    console.log(name + ' op4',context);
                },
                op5: function(context){
                    console.log(name + ' op5',context);
                },
                post: function(context) {
                    console.log(name + ' post',context);
                },
            };
     
        return {
     
            facade: function(context) {
                _private.pre(context);
                if (context.param1) _private.op1({data: context.param1});
                if (context.param2) _private.op2({data: context.param2});
                if (context.param3) _private.op3({data: context.param3});
                if (context.param4) _private.op4({data: context.param4});
                if (context.param4 > context.param3) {
                    var total = context.param1 + context.param2 +  
                                context.param3 + context.param4;
                    _private.op5({data: total});
                };
                _private.post(context);
            }
        };
    };

    var ModuleB = function() {
        var name = 'ModuleB',
            _private = {
                pre: function(context) {
                    console.log(name + ' pre',context);
                },
                op1: function(context) {
                    console.log(name + ' op1',context);
                },
                op2: function(context) {
                    console.log(name + ' op2',context);
                },
                op3: function(context) {
                    console.log(name + ' op3',context);
                },
                op4: function(context) {
                    console.log(name + ' op4',context);
                },
                post: function(context) {
                    console.log(name + ' post',context);
                },
            };
     
        return {
     
            facade: function(context) {
                _private.pre(context);

                if (context.param1){
                     _private.op1({data: context.param1});
                };

                if (context.param2){
                     _private.op2({data: context.param2});
                };

                if (context.param3){
                     _private.op3({data: context.param3});
                };

                if (context.param1 && context.param2 && context.param3){
                    var data = context.param1 + context.param2 + context.param3;
                     _private.op4({data: data});
                };

                _private.post(context);
            }
        };
    };


}(typeof exports === 'undefined' ? this.facadePattern = {} : exports));

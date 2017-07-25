var designPatterns = require('../index'), /* change to "var designPatterns = require('design-pattern');" for using outside the module */
    facadePattern =  designPatterns.facadePattern(),
    moduleA = facadePattern.moduleA(),
    contextA = {param1: 10, param2: 20, param3: 30, param4: 40},
    moduleB = facadePattern.moduleB(),
    contextB = {param1: 'A', param2: 'B', param3: 'C'};

moduleA.facade(contextA);
moduleB.facade(contextB);

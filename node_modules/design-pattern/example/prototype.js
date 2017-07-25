var designPatterns = require('../index'), /* change to "var designPatterns = require('design-pattern');" for using outside the module */
    prototypePattern =  designPatterns.prototypePattern();

var validPhone = prototypePattern.getPrototypeBuilder().createPhonePrototype('validPhone'),
    validSWConf = {appStoreUserId: 'u0001'},
    validHWConf = {simCard: 'nano'},
    validAppInstallRequest = { appStoreUserId: 'u0001',appId: 'app001'},
    validAppUninstallRequest = { appStoreUserId: 'u0001',appId: 'app001'},

    invalidSimCardPhone = prototypePattern.getPrototypeBuilder()
                          .createPhonePrototype('invalidSimCard'),
    invalidSimCardHWConf = {simCard: 'micro'},

    invalidAppStoreUserPhone = prototypePattern.getPrototypeBuilder()
                          .createPhonePrototype('invalidAppStoreUser'),
    invalidAppStoreUserSWConf = {appStoreUserId: 'unknown'},
    invalidAppStoreUserHWConf = {simCard: 'nano'},
    invalidAppStoreUserAppInstallRequest =
        { appStoreUserId: 'unknown', appId: 'app001'},
    invalidAppStoreUserAppUninstallRequest =
        { appStoreUserId: 'unknown', appId: 'app001'};

validPhone.specifications();
validPhone.installSimCard(validHWConf);
validPhone.listAvailableApps(validSWConf);
validPhone.installApp(validAppInstallRequest);
validPhone.uninstallApp(validAppUninstallRequest);

invalidSimCardPhone.specifications();
invalidSimCardPhone.installSimCard(invalidSimCardHWConf);

invalidAppStoreUserPhone.specifications();
invalidAppStoreUserPhone.installSimCard(invalidAppStoreUserHWConf);
invalidAppStoreUserPhone.listAvailableApps(invalidAppStoreUserSWConf);
invalidAppStoreUserPhone.installApp(invalidAppStoreUserAppInstallRequest);
invalidAppStoreUserPhone.uninstallApp(invalidAppStoreUserAppUninstallRequest);

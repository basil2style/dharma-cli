(function(exports){

	exports.getPrototypeBuilder = function(){
		return prototypeBuilder;
	};

  var GLOBAL_MANUFACTURING_SERIAL_CODE = '2015000000',
      GLOBAL_MANUFACTURING_SERIAL = 0,
      GLOBAL_USER_DB = {
                    u0001: 'MyAccount',
                    u0002: 'HerAccount',
                    u0003: 'HisAccount'
                  },
      GLOBAL_APP_DB = {
                    app001: 'NewsReaderApp',
                    app002: 'CameraApp',
                    app003: 'CalculatorApp'
                  },
      GLOBAL_MANUFACTURING_DATABASE = {
         nextPhoneManufacturingSerial: function(){
           GLOBAL_MANUFACTURING_SERIAL++;
           return GLOBAL_MANUFACTURING_SERIAL_CODE +
                  GLOBAL_MANUFACTURING_SERIAL;
         },
         standardPhoneConfigurations: function(){
           return {
              manufacturer: 'DreamPhoneProduction',
              serial: GLOBAL_MANUFACTURING_SERIAL_CODE +
                      GLOBAL_MANUFACTURING_SERIAL,
              model: 'DreamPhone',
              simCard: 'nano',
              width: 400,
              height: 600,
              color: 'white'
            };
         }
     };

var prototypeBuilder = {

  createPhonePrototype: function(userInstanceName){

    var instanceSerial = GLOBAL_MANUFACTURING_DATABASE
                         .nextPhoneManufacturingSerial(),
        instanceStandardContext = GLOBAL_MANUFACTURING_DATABASE
                                    .standardPhoneConfigurations(),
        instanceName = userInstanceName || '';

    console.log('[prototypeBuilder] created phonePrototype instanceSerial=' +
                instanceSerial + ' with standardContext=',
                instanceStandardContext);

    return Object.create(phonePrototype, {
                'serial': {
                  value: instanceSerial,
                  writable: false,
                  enumerable: false,
                  configurable: false
                },
                'standardContext': {
                  value: instanceStandardContext,
                  writable: false,
                  enumerable: false,
                  configurable: false
                },
                'name': {
                  value: instanceName,
                  writable: false,
                  enumerable: false,
                  configurable: false
                },
            });

  }
};

var phonePrototype = {
  specifications: function() {
    var model = this.standardContext.model,
        manufacturer = this.standardContext.manufacturer,
        simCard = this.standardContext.simCard,
        width = this.standardContext.width,
        height = this.standardContext.height,
        specs = {
          serial: this.serial,
          model: model,
          manufacturer: manufacturer,
          simCard: simCard,
          weight: 129, /* gram */
          width: 138, /* mm */
          height: 67 /* mm */
        };

    console.log('[' + this.serial + '] specifications() : ',specs);
    return specs;
  },
  installSimCard: function (specificContext) {
    var simCard = specificContext.simCard || 'undefined',
        processStatus = '';

        if (simCard !== this.standardContext.simCard){
            console.error('[' + this.name + ' ' + this.serial +
                          '] installSimCard() : ' +
                          '  Sim card type = ' +
                          simCard + ' is not supported.');
            processStatus = 'failure';
        }else{
            console.log('[' + this.name + ' ' + this.serial +
                        '] installSimCard() : ' +
                        'Sim card (type=' +
                        simCard + ') has been installed');
            processStatus = 'success';
        }

        return processStatus;
  },
  installApp: function (specificContext) {
    var appStoreUserId = specificContext.appStoreUserId || '',
        appId = specificContext.appId || '',
        processStatus = '',
        appDB = { app001: 'NewsReaderApp' };

    if (!GLOBAL_USER_DB[appStoreUserId]){
        console.error('[' + this.name + ' ' + this.serial +
                      '] installApp() : appStoreUserId = ' +
                      appStoreUserId + ' is not a valid account id.');
        processStatus = 'failure';

    } else if (!GLOBAL_APP_DB[appId]){
        console.error('[' + this.name + ' ' + this.serial +
                      '] installApp() : appId = ' +
                      appId + ' cannot be found in App Store');
        processStatus = 'failure';

    } else {
        console.log('[' + this.name + ' ' + this.serial +
                    '] installApp() : ' +
                    GLOBAL_APP_DB.app001 + ' has been installed');
        processStatus = 'success';
    }

    return processStatus;
  },
  uninstallApp: function (specificContext) {
    var appId = specificContext.appId || '',
        appStoreUserId = specificContext.appStoreUserId || '',
        processStatus = '';

  if (!GLOBAL_USER_DB[appStoreUserId]){
        console.error('[' + this.name + ' ' + this.serial +
                      '] uninstallApp() : appStoreUserId = ' +
                      appStoreUserId + ' is not a valid account id.');
        processStatus = 'failure';

    } else if (!GLOBAL_APP_DB[appId]){
        console.error('[' + this.name + ' ' + this.serial +
                      '] uninstallApp() : appId = ' +
                      appId + ' cannot be found in App Store');
        processStatus = 'failure';

    } else {
        console.log('[' + this.name + ' ' + this.serial +
                    '] uninstallApp() : ' +
                    GLOBAL_APP_DB.app001 + ' has been uninstalled');
        processStatus = 'success';
    }
    return processStatus;
  },
  listAvailableApps: function (specificContext) {
    var appStoreUserId = specificContext.appStoreUserId || '',
        availableApps = {apps: []};

    if (!GLOBAL_USER_DB[appStoreUserId]){
        console.error('[' + this.name + ' ' + this.serial +
                      '] listAvailableApps() : appStoreUserId = ' +
                      appStoreUserId + ' is not a valid account id.');

    } else{
        availableApps = {apps: GLOBAL_APP_DB};
        console.log('[' +this.name + ' ' + this.serial +
                    '] listAvailableApps() : availableApps = ',availableApps);
    }

    return availableApps;
  }
};


}(typeof exports === 'undefined' ? this.prototypePattern = {} : exports));

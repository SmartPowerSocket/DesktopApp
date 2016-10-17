'use strict';

console.log('Particle Setup is included!');

var path = require('path');
var Interpreter = require('./lib/interpreter.js');
var crypto = require('crypto');
var fs = require('fs');

var cli = null;

global.particleEnhancement = {
	photonSetupFailed: null,
	photonSetupSuccess: null,
	photonNetworkList: null,
	setPhotonNetwork: null,
	setPhotonNetworkManually: null,

	photonDeviceId: null,
	photonApiKey: null,
	apiUrl: "http://api.smartpowersocket.xyz",
	deviceName: crypto.randomBytes(64).toString('hex')
};

global.particleEnhancement.choosePhotonNetwork = function (networksDetails, __networkChoice) {
	var networks = [];
	for (var key in networksDetails) {
		if (key === 'length' || !networksDetails.hasOwnProperty(key)) {
			continue;
		}
		networks.push(networksDetails[key].ssid);
	}

	global.particleEnhancement.photonNetworkList = networks;

	global.particleEnhancement.setPhotonNetwork = function (selectedNetwork, networkPassword) {
		__networkChoice({network: selectedNetwork, password: networkPassword});
	};

};

global.particleEnhancement.wifiValidationFailed = function(recheck) {
	global.particleEnhancement.photonSetupFailed = "The provided wifi password is invalid!";
	recheck({recheck: false});
}

global.particleEnhancement.noWifiWithInternet = function() {
	global.particleEnhancement.photonSetupFailed = "Connect your computer to a wifi spot with internet!";
};

global.particleEnhancement.firmwareSetupDone = function() {
	global.particleEnhancement.photonSetupSuccess = true;
}

global.particleEnhancement.flashFirmware = function() {

	var firmwarePath = path.join(__dirname, 'firmware', 'setup.ino');
	var customFirmwarePath = path.join(__dirname, 'firmware', global.particleEnhancement.photonDeviceId + '.ino');

	// Remove custom firmware file if it exists
	if (fs.existsSync(customFirmwarePath)) {
		fs.unlinkSync(customFirmwarePath);
	}

	var firmwareFile = fs.readFileSync(firmwarePath).toString();
	var customFirmwareFile = firmwareFile.replace(/{{{apiKey}}}/g, global.particleEnhancement.photonApiKey);

	fs.writeFileSync(customFirmwarePath, customFirmwareFile);

	// Flash Photon with initial firmware
	cli.handle(['node',
				'app.js',
				'flash',
				global.particleEnhancement.deviceName,
				customFirmwarePath
			], false);
};

global.particleEnhancement.setup = function() {

	cli = new Interpreter();
	cli.supressWarmupMessages = true;
	cli.startup();
	// Setup Photon Wifi and authentication
	cli.handle(['node',
				'app.js',
				'setup'], true);
};

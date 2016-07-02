/**
 ******************************************************************************
 * @file    js/app.js
 * @author  David Middlecamp (david@particle.io)
 * @company Particle ( https://www.particle.io/ )
 * @source https://github.com/spark/particle-cli
 * @version V1.0.0
 * @date    27-December-2013
 * @brief   Main program body.
 ******************************************************************************
	Copyright (c) 2016 Particle Industries, Inc.  All rights reserved.

	This program is free software; you can redistribute it and/or
	modify it under the terms of the GNU Lesser General Public
	License as published by the Free Software Foundation, either
	version 3 of the License, or (at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
	Lesser General Public License for more details.

	You should have received a copy of the GNU Lesser General Public
	License along with this program; if not, see <http://www.gnu.org/licenses/>.
	******************************************************************************
 */
'use strict';

console.log('Particle Setup is included!');

var path = require('path');
var updateCheck = require('./lib/update-check');
var Interpreter = require('./lib/interpreter.js');
var crypto = require('crypto');
var fs = require('fs');

var cli = null;

global.particleEnhancement = {};

global.particleEnhancement.photonSetupFailed = null;
global.particleEnhancement.photonSetupSuccess = null;
global.particleEnhancement.photonNetworkList = null;
global.particleEnhancement.setPhotonNetwork = null;
global.particleEnhancement.photonDeviceId = null;
global.particleEnhancement.photonApiKey = null;

global.particleEnhancement.apiUrl = "https://200259ff.ngrok.io";
global.particleEnhancement.deviceName = crypto.randomBytes(64).toString('hex');


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

	console.log("DEBUG: CUSTOM FIRMWARE: ", customFirmwareFile);

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

	updateCheck(function () {
		cli = new Interpreter();
		cli.supressWarmupMessages = true;
		cli.startup();
		// Setup Photon Wifi and authentication
		cli.handle(['node',
					'app.js',
					'setup'], true);
	});

};

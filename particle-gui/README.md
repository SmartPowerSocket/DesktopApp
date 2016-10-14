[![npm](https://img.shields.io/npm/v/particle-cli.svg?style=flat-square)](https://www.npmjs.com/package/particle-cli)[![Build Status](https://img.shields.io/travis/spark/particle-cli.svg?style=flat-square)](https://travis-ci.org/spark/particle-cli)[![Code Coverage](https://img.shields.io/coveralls/spark/particle-cli.svg?style=flat-square)](https://coveralls.io/github/spark/particle-cli)[![License](https://img.shields.io/badge/license-LGPL-blue.svg?style=flat-square)](https://github.com/spark/particle-cli/blob/master/LICENSE)

# Important note
This is a modified version of particle-cli (https://github.com/spark/particle-cli) that
enables an automatic setup without any CLI input. Check index.js for further information.

## Setup and execution

* Reset any previous WiFi configuration on your Photon:

You can reset previous Wi-Fi networks by holding the SETUP button and tapping RESET, then continuing to hold SETUP until the light on the Photon turns white. (This differs from the Core. Doing this action on the Core will result in a factory reset.)

* Set Photon to Listening mode:

To put your Photon in Listening Mode, hold the SETUP button for three seconds, until the RGB LED begins blinking blue.

On the terminal:

* git clone https://github.com/danielmapar/particle-gui
* npm install
* node index.js // Remember to modify index.js to supply your needs

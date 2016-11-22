# Smart Power Socket - Desktop app

## To run the app in dev mode:
1) Install node 4.4.4: ```nvm install 4.4.4```

2) Update NPM to version 3: ```sudo npm install npm@latest -g```

3) Configure the SMP RESTfulAPI (https://github.com/SmartPowerSocket/RESTfulAPI)

4) Run NGROK: ```ngrok http 3000```

5) Edit app/actions/types.js with the NGROK URL

6) Edit particle-gui/index.js with the NGROK URL

7) [WINDOWS ONLY] Install Python 2.7 and add to environment variables

8) [MAC ONLY] Remove .particle from ($HOME, $HOMEPATH, $USERPROFILE, or $home) if you used particle-cli previously

6) Run: ```npm install```

7) Run: ```npm rebuild --runtime=electron --target=1.4.7 --disturl=https://atom.io/download/atom-shell --build-from-source```. Check electron package version by doing: ```npm ls electron```

8) Run the app in dev mode: ```npm run dev```

## To pack the app in a executable:

1) For all platforms do: ```npm run package-all```

2) For your current platforms do: ```npm run package```

3) Run after packaging: ```npm rebuild --runtime=electron --target=1.4.6 --disturl=https://atom.io/download/atom-shell --build-from-source```. Check electron package version by doing: ```npm ls electron```

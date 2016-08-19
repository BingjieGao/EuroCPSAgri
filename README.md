 1. Run npm install
 2. Run npm install git "nqm-iot-http-sync" and "nqm-iot-file-cache" if these are not installed
 3. replace the 'fileCache.js' file in node\_module with the fileCache.js in directory hub
 4. change the driver file if it is necessary when the COM port or /dev/tty\* port is different, uncomment driver.start when starting the app with the STM32F4
 5. start the app going to the directory 'hub' and node router/index.js

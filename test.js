const log = require('./logger/index.js');

log.setDebugLevel('MUTE');
log(`Server is Running...`, 600);

log.setDebugLevel('TRACE');
log.setPrintSpeed(5);
log('Hello, Wooooooooooooo{{ green:ooooooooooooo }}oooooooooooooooooooooooooooooooooooooorld!', 200, 'INFO');
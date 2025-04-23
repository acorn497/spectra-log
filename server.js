import log from './log.lib.js';
log(`Server is Running...`, 600);
log('Hello, Woooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooorld!', 200, 'INFO');
log('Hello, World!', 100, 'TRACE');
log('Hello, World!', 201, 'INFO');
log('Hello, World!', 401, 'ERROR');
log('Hello, World!', 500, 'FATAL');
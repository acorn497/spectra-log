import log from './log.lib.js';

log.setDebugLevel('MUTE', { silent: true });

log(`Server is Running...`, 600);
log('Hello, Woooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooorld!', 200, 'INFO');
log('Hello, World!', 100, 'TRACE');
log('Hello, World!', 201, 'INFO');
log('Hello, World!', 201, 'DEBUG');
log('Hello, World!', 401, 'ERROR');
log('Hello, World!', 500, 'FATAL');

log.setDebugLevel('TRACE');
log.setPrintSpeed(50)
log('Hello, Wooooooooooooo{{green:ooooooooooooo}}oooooooooooooooooooooooooooooooooooooorld!', 200, 'INFO');
log('Hello, World!', 100, 'TRACE');
log('Hello, World!', 201, 'INFO');
log('Hello, World!', 201, 'DEBUG');
log('Hello, World!', 401, 'ERROR');
log('Hello, World!', 500, 'FATAL');

setTimeout(() => {
  log.setSmoothPrint(false);
  log('Hello, World!', 201, 'INFO');
  log('Hello, World!', 201, 'DEBUG');
  log('Hello, World!', 401, 'ERROR');
  log('Hello, World!', 500, 'FATAL');
}, 3000);
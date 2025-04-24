import log from './log.lib.js';

log.setDebugLevel('MUTE');

log(`Server is Running...`, 600);
log('Hello, Woooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooorld!', 200, 'INFO');
log('Hello, World!', 100, 'TRACE');
log('Hello, World!', 201, 'INFO');
log('Hello, World!', 201, 'DEBUG');
log('Hello, World!', 401, 'ERROR');
log('Hello, World!', 500, 'FATAL');

log('Hello, Wooooooooooooo{{green:ooooooooooooo}}oooooooooooooooooooooooooooooooooooooorld!', 200, 'INFO');
log('Hello, World!', 100, 'TRACE');
log('Hello, World!', 201, 'INFO');
log('Hello, World!', 201, 'DEBUG');
log('Hello, World!', 401, 'ERROR');
log('Hello, World!', 500, 'FATAL');

setTimeout(() => {
  log.setDebugLevel('TRACE');
  log('Hello, \u001b[38;5;123mTEXT\u001b[0m World!', 100, 'INFO'); 
  log('Hello, \u001b[38;5;12mTEXT\u001b[0m World!', 100, 'INFO'); 
  log('Hello, \u001b[38;5;1mTEXT\u001b[0m World!', 100, 'INFO'); 
  
  log('Hello, World!', 201, 'INFO');
  log('Hello, World!', 201, 'DEBUG');
  log('Hello, World!', 401, 'ERROR');
  log('Hello, World!', 500, 'FATAL');
}, 3000);
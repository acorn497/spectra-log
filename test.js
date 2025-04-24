const log = require('./logger/index.js');

/* TODO
  Setter들 전부 작동하게 하기.
  현재 문제: constants에서 가져온 변수가 전역으로 바뀌지 않아서 queueProcessor에서 처리하지 못함. => index.js에서 변수 값을 업데이트 하면
  constants에 저장되도록 한다.
  내 생각: constants 파일에 setter를 정의, exports 해서 변수 값을 외부에서 바꿀 수 있게 한다.
*/

log.setDebugLevel('MUTE');
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
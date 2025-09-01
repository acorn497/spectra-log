import log from './dist/index.js';

async function main() {
  log.setPrintSpeed(1);
  log.setSmoothPrint(false);
  log.setDebugLevel("DEBUG");
  log.setDisplayStandBy(true);

  log("This is a TRACE message", 200, "TRACE");
  log("This is a DEBUG message", 200, "DEBUG");
  log.setDebugLevel("ERROR");
  log("This is an INFO message", 200, "INFO");
  log("This is an ERROR message", 200, "ERROR");
  log("This is a FATAL message", 200, "FATAL");

  log({"id": "AGH"});
}

main();

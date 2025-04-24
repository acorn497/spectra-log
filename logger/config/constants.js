
// >  DIR | /config/constants.js

// --- < smoothPrint, interval 등 기본 설정 값 > ---


let smoothPrint = true;
let interval = 5;
let processLevel = 2;

let isProcessing = false;
let isStandbyActive = false;
const messageQueue = [];

module.exports = {
  smoothPrint,
  interval,
  processLevel,
  
  isProcessing,
  isStandbyActive,
  messageQueue
}
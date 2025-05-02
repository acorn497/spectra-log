// >  DIR | /config/constants.js

// --- < smoothPrint, interval 등 기본 설정 값 > ---

let smoothPrint = false;
let interval = 5;
let processLevel = 2;

let isProcessing = false;
let displayStandby = false;
const messageQueue = [];

const getIsProcessing = () => isProcessing;
const setIsProcessing = (value) => {
  isProcessing = value;
};

const getSmoothPrint = () => smoothPrint;
const setSmoothPrint = (value) => {
  smoothPrint = value;
};

const getProcessLevel = () => processLevel;
const setProcessLevel = (value) => {
  processLevel = value;
};

const getPrintSpeed = () => interval;
const setPrintSpeed = (value) => {
  interval = value;
};

const getDisplayStandby = () => displayStandby;
const setDisplayStandby = (value) => {
  displayStandby = value;
};

export {
  getIsProcessing,
  setIsProcessing,
  getSmoothPrint,
  setSmoothPrint,
  getProcessLevel,
  setProcessLevel,
  getPrintSpeed,
  setPrintSpeed,
  getDisplayStandby,
  setDisplayStandby,
  messageQueue,
};

export const _init = {
  isProcessing,
  smoothPrint,
  processLevel,
};

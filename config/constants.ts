// >  DIR | /config/constants.ts

let smoothPrint: boolean = false;
let interval: number = 5;
let processLevel: number = 2;

let isProcessing: boolean = false;
let displayStandby: boolean = false;

export type DebugLevelString = "MUTE" | "TRACE" | "DEBUG" | "INFO" | "ERROR" | "FATAL" | "NOTLVL";

const messageQueue: {message: string, type: any, timestamp: number, level: DebugLevelString}[] = [];

export const DebugLevelOrder = {
  "MUTE": -1,
  "TRACE": 0,
  "DEBUG": 1,
  "INFO": 2,
  "ERROR": 3,
  "FATAL": 4,
  "NOTLVL": 5,
}

const getIsProcessing = () => isProcessing;
const setIsProcessing = (value: boolean) => {
  isProcessing = value;
};

const getSmoothPrint = () => smoothPrint;
const setSmoothPrint = (value: boolean) => {
  smoothPrint = value;
};

const getProcessLevel = () => processLevel;
const setProcessLevel = (value: DebugLevelString) => {
  processLevel = DebugLevelOrder[value];
};

const getPrintSpeed = () => interval;
const setPrintSpeed = (value: number) => {
  interval = value;
};

const getDisplayStandby = () => displayStandby;
const setDisplayStandby = (value: boolean) => {
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
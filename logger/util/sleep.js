
// >  DIR | /util/sleep.js

// --- < sleep 비동기 함수 > ---


const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = sleep;
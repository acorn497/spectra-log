// >  DIR | /util/sleep.js

// --- < sleep 비동기 함수 > ---

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default sleep;

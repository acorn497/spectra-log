// >  DIR | /util/stripAnsi.js

// --- < stripAnsi > ---

const stripAnsi = (str) => str.replace(/\x1b\[[0-9;]*m/g, "");

export default stripAnsi;

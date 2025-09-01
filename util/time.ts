// >  DIR | /util/time.js

// --- < Time formatter > ---

const getFormattedTime = (timestamp: number): string => {
  const time = new Date(timestamp);
  return `${String(time.getHours()).padStart(2, "0")}:${String(
    time.getMinutes()
  ).padStart(2, "0")}:${String(time.getSeconds()).padStart(2, "0")}`;
};

export default getFormattedTime;

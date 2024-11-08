export const get = (key) => {
  try {
    return window.localStorage.getItem(key);
  } catch {}
};
export const save = (key, val) => {
  try {
    return window.localStorage.setItem(key, val);
  } catch {}
};


export const playMp3 = (path) => {
  const audio = new Audio(path); // Replace with your audio file path
  return audio;
}
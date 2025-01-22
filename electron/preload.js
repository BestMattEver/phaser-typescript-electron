// All the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const { ipcRenderer } = require('electron');

window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ["chrome", "node", "electron"]) {
    replaceText(`${dependency}-version`, process.versions[dependency]);
  }
});

const writeGamesToFile = (csv) => {
  //this sends a command 'writeToFile' to the server process of electron
  //where all the regular node fs stuff is available
  ipcRenderer.send('writeToFile', csv);
};
const textInput = document.getElementById('gamesToSave');
window.addEventListener('click', (event) => {
  writeGamesToFile(event.target.value);
});


// renderer.js
// This file is intentionally left blank.
// All renderer process code is in preload.js.
const { ipcRenderer } = require('electron');
const axios = require('axios');
const vis = require('vis-network');

window.addEventListener('DOMContentLoaded', () => {
  const selectFolderBtn = document.getElementById('selectFolderBtn');

  selectFolderBtn.addEventListener('click', () => {
    ipcRenderer.send('open-folder-dialog');
  });

  ipcRenderer.on('selected-folder', (_event, folderPath) => {
    axios.post('http://localhost:8000/', { folderPath })
      .then(response => {
        console.log('Folder path sent to API:');
        console.log(response.data);
        const container = document.getElementById('visualization');
        const data = {
          nodes: response.data.nodes,
          edges: response.data.edges,
        };
        const options = {
          nodes: {
            shape: "dot",
            size: 10,
          },
        }; // Add any visualization options here
        const network = new vis.Network(container, data, options);
      })
      .catch(error => {
        console.error('Error sending folder path to API:', error);
      });
  });
});
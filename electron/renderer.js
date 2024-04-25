// renderer.js
// This file is intentionally left blank.
// All renderer process code is in preload.js.
const { ipcRenderer } = require('electron');
const axios = require('axios');
const vis = require('vis-network');

window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('visualization');

  const selectFolderBtn = document.getElementById('selectFolderBtn');

  selectFolderBtn.addEventListener('click', () => {
    ipcRenderer.send('open-folder-dialog');
  });

  ipcRenderer.on('selected-folder', (_event, folderPath) => {
    axios.post('http://localhost:8000/', { folderPath })
      .then(response => {
        console.log('Folder path sent to API:');
        console.log(response.data);
        populateGraphView(container, response.data);
        populateClassSelect(container, response.data);
        populateImageSelect(container, response.data);
      })
      .catch(error => {
        console.error('Error sending folder path to API:', error);
      });
  });
});

const populateGraphView = (container, graph_data) => {
  const data = {
    nodes: graph_data.nodes,
    edges: graph_data.edges,
  };
  const options = {
    nodes: {
      shape: "dot",
      size: 10,
      font: {
        size: 12,
      },
      borderWidth: 2,
      shadow: true,
    },
    edges: {
      color: {
        inherit: "both",
      },
      shadow: true,
    }
  }; // Add any visualization options here
  const network = new vis.Network(container, data, options);
}

const populateClassSelect = (container, class_res_data) => {
  const classSelect = document.getElementById('classSelect');
  classSelect.innerHTML = '';
  const class_nodes = class_res_data.nodes.filter(node => !node.image)
  console.log(class_nodes)

  class_nodes.forEach((node) => {
    const option = document.createElement('option');
    option.value = node['id'];
    option.text = node['label'];
    classSelect.appendChild(option);
  })

  document.getElementById('single-node-visualization').style.display = 'block';

  document.getElementById('single-node-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const classId = document.getElementById('classSelect').value;
    axios.post('http://localhost:8000/nodes/', { classId })
      .then(response => {
        console.log('Class name sent to API:');
        console.log(response.data);
        populateGraphView(container, response.data);
      })
      .catch(error => {
        console.error('Error sending class name to API:', error);
      });
  })
}

const populateImageSelect = (container, img_res_data) => {
  const imageSelect = document.getElementById('imageSelect');
  imageSelect.innerHTML = '';
  const image_nodes = img_res_data.nodes.filter(node => node.image)

  image_nodes.forEach((node) => {
    const option = document.createElement('option');
    option.value = node['id'];
    option.text = node['label'];
    imageSelect.appendChild(option);
  })

  document.getElementById('single-image-visualization').style.display = 'block';

  document.getElementById('single-image-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const imageId = document.getElementById('imageSelect').value;
    axios.post('http://localhost:8000/images/', { imageId })
      .then(response => {
        console.log('Image name sent to API:');
        console.log(response.data);
        populateGraphView(container, response.data);
      })
      .catch(error => {
        console.error('Error sending image name to API:', error);
      });
  })
}

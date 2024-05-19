// renderer.js
// This file is intentionally left blank.
// All renderer process code is in preload.js.
const { ipcRenderer } = require('electron');
const axios = require('axios');
const vis = require('vis-network');

window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('visualization');

  const selectFolderBtn = document.getElementById('selectFolderBtn');
  const yoloWeightSelect = document.getElementById('yoloWeightSelector');
  const resetGraphBtn = document.getElementById('resetGraphBtn');

  selectFolderBtn.addEventListener('click', () => {
    ipcRenderer.send('open-folder-dialog');
  });

  ipcRenderer.on('selected-folder', (_event, folderPath) => {
    yoloWeight = yoloWeightSelect.value;
    const start = performance.now();
    axios.post('http://localhost:8000/', { folderPath, yoloWeight })
      .then(response => {
        resetGraphBtn.disabled = false;
        populateGraphView(container, response.data);
        populateClassSelect(container, response.data);
        populateImageSelect(container, response.data);
        const timeItTook = performance.now() - start;
        const imageCount = response.data.nodes.filter(node => node.image).length;
        const classesCount = response.data.nodes.filter(node => !node.image).length;
        console.log(`| ${yoloWeight} | ${imageCount} | ${timeItTook} | ${timeItTook / imageCount} | ${classesCount} | `);
      })
      .catch(error => {
        console.error('Error sending folder path to API:', error);
      });
  });
});

document.getElementById('resetGraphBtn').addEventListener('click', () => {
  const container = document.getElementById('visualization');
  axios.get('http://localhost:8000/reset/')
    .then(response => {
      resetGraphBtn.disabled = false;
      populateGraphView(container, response.data);
    })
    .catch(error => {
      console.error('Error resetting graph through API:', error);
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
  const classOptions = document.getElementById('classOptions');
  classOptions.innerHTML = '';
  const class_nodes = class_res_data.nodes.filter(node => !node.image)

  class_nodes.forEach((node) => {
    const optionDiv = document.createElement('div');
    optionDiv.id = 'class-' + node['id'];
    optionDiv.className = 'option-div';

    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'className';
    radio.value = node['id'];

    const label = document.createElement('label');
    label.textContent = node['label'];

    label.htmlFor = 'class-' + node['id'];

    optionDiv.appendChild(radio);
    optionDiv.appendChild(label);

    classOptions.appendChild(optionDiv);
  });

  document.getElementById('single-node-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const classId = classOptions.querySelector('input[name="className"]:checked').value;
    axios.post('http://localhost:8000/nodes/', { classId })
      .then(response => {
        populateGraphView(container, response.data);
      })
      .catch(error => {
        console.error('Error sending class name to API:', error);
      });
  });
}

const populateImageSelect = (container, img_res_data) => {
  const imageOptions = document.getElementById('imageOptions');
  imageOptions.innerHTML = '';
  const image_nodes = img_res_data.nodes.filter(node => node.image);
  image_nodes.forEach((node) => {
    const optionDiv = document.createElement('div');
    optionDiv.id = 'image-' + node['id'];
    optionDiv.imageName = 'option-div';

    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'imageName';
    radio.value = node['id'];

    const label = document.createElement('label');
    label.textContent = node['label'];

    label.htmlFor = 'image-' + node['id'];

    optionDiv.appendChild(radio);
    optionDiv.appendChild(label);

    imageOptions.appendChild(optionDiv);
  });

  document.getElementById('single-image-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const imageId = imageOptions.querySelector('input[name="imageName"]:checked').value;
    axios.post('http://localhost:8000/images/', { imageId })
      .then(response => {
        populateGraphView(container, response.data);
      })
      .catch(error => {
        console.error('Error sending image name to API:', error);
      });
  });
}

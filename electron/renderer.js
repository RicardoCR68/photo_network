const vis = require('vis');

// Create a network visualization
const container = document.getElementById('visualization');
const data = {
  nodes: [
    { id: 1, label: 'Node 1' },
    { id: 2, label: 'Node 2' },
    { id: 3, label: 'Node 3' }
  ],
  edges: [
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 3, to: 1 }
  ]
};
const options = {};
const network = new vis.Network(container, data, options);

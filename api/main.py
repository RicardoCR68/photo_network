from fastapi import FastAPI
from pydantic import BaseModel
import os
from ultralytics import YOLO
import json

app = FastAPI()

class FolderPath(BaseModel):
    folderPath: str

@app.post("/")
async def receive_folder_path(folder_path: FolderPath):
    received_path = folder_path.folderPath
    folder_results = generate_graphs(received_path)
    folder_json = json.dumps(folder_results)
    return folder_results

@app.get("/")
async def root():
    return {
        "nodes": [
            {
                'id': 1,
                'value': 2,
                'label': "Algie"
            },
            {
                'id': 2,
                'value': 31,
                'label': "Alston"
            },
            {
                'id': 3,
                'value': 12,
                'label': "Barney"
            },
            {
                'id': 4,
                'value': 16,
                'label': "Coley"
            },
            {
                'id': 5,
                'value': 17,
                'label': "Grant"
            },
            {
                'id': 6,
                'value': 15,
                'label': "Langdon"
            },
            {
                'id': 7,
                'value': 6,
                'label': "Lee"
            },
            {
                'id': 8,
                'value': 5,
                'label': "Merlin"
            },
            {
                'id': 9,
                'value': 30,
                'label': "Mick"
            },
            {
                'id': 10,
                'value': 18,
                'label': "Tod"
            },
        ],
        'edges': [
            {
                'from': 2,
                'to': 8,
                'value': 3,
                'label': "3 emails per week"
            },
            {
                'from': 2,
                'to': 9,
                'value': 5,
                'label': "5 emails per week"
            },
            {
                'from': 2,
                'to': 10,
                'value': 1,
                'label': "1 emails per week"
            },
            {
                'from': 4,
                'to': 6,
                'value': 8,
                'label': "8 emails per week"
            },
            {
                'from': 5,
                'to': 7,
                'value': 2,
                'label': "2 emails per week"
            },
            {
                'from': 4,
                'to': 5,
                'value': 1,
                'label': "1 emails per week"
            },
            {
                'from': 9,
                'to': 10,
                'value': 2,
                'label': "2 emails per week"
            },
            {
                'from': 2,
                'to': 3,
                'value': 6,
                'label': "6 emails per week"
            },
            {
                'from': 3,
                'to': 9,
                'value': 4,
                'label': "4 emails per week"
            },
            {
                'from': 5,
                'to': 3,
                'value': 1,
                'label': "1 emails per week"
            },
            {
                'from': 2,
                'to': 7,
                'value': 4,
                'label': "4 emails per week"
            },
        ]
    }

def generate_image_graph(image_file):
    model = YOLO('yolov8m.pt')

    results = model(image_file)
    nodes = [
        {
            'id' : image_file,
            'label' : image_file.split('/')[-1],
            'value' : 15,
            'shape' : 'image',
            'image' : image_file,
            'group': 1
        }
    ]

    edges = []
    confidence_threshold = 0.6
    for result in results:
        parent_path = os.path.join(os.getcwd(), os.pardir)
        result.save(filename=f'{parent_path}/results/{nodes[0]['label']}_result.png')
        res_arr = json.loads(result.tojson())
        for res in res_arr:
            if res['confidence'] < confidence_threshold:
                continue

            found_node = False
            for stored_node in nodes:
                if stored_node['id'] == res['class']:
                    stored_node['value'] += 1
                    found_node = True
                    break

            if not found_node:
                nodes.append({
                    'id' : res['class'],
                    'label' : res['name'],
                    'value' : 1,
                    'group' : 2
                })

            found_edge = False
            for edge in edges:
                if edge['to'] == image_file and edge['from'] == res['class']:
                    edge['label'] = str(int(edge['label']) + 1)
                    edge['value'] = max([edge['value'], res['confidence']])
                    found_edge = True
                    break

            if not found_edge:
                edges.append({
                    'to' : image_file,
                    'from' : res['class'],
                    'label' : '1',
                    'value' : res['confidence']
                })
    return [nodes, edges]

def generate_graphs(folder_path):
    results = {
        'nodes' : [],
        'edges' : [],
    }
    for root, dirs, files in os.walk(folder_path):
        for file in files:
            if file.endswith((".jpg", ".jpeg", ".png", ".webp", ".gif")):
                res = generate_image_graph(os.path.join(root, file))
                for node in res[0]:
                    if not results['nodes'] or not any(stored_node['id'] == node['id'] for stored_node in results['nodes']):
                        results['nodes'].append(node)
                    else:
                        for stored_node in results['nodes']:
                            if stored_node['id'] == node['id']:
                                stored_node['value'] += node['value']
                results['edges'] += res[1]
    return results

from fastapi import FastAPI
from pydantic import BaseModel
import os
from ultralytics import YOLO
import json

app = FastAPI()

class FolderPath(BaseModel):
    folderPath: str

class ClassSelect(BaseModel):
    classId: str

class ImageSelect(BaseModel):
    imageId: str

@app.post("/")
async def receive_folder_path(folder_path: FolderPath):
    received_path = folder_path.folderPath
    global folder_results
    folder_results = generate_graphs(received_path)

    return folder_results

@app.get("/")
async def root():
    return {}

@app.post("/nodes/")
async def get_node(class_name: ClassSelect):
    id = int(class_name.classId)
    node_ids = []
    response = {
        'nodes' : []
    }

    for edge in folder_results['edges']:
        if edge['from'] == id:
            node_ids.append(edge['to'])

    for node_id in node_ids:
        for node in folder_results['nodes']:
            if node['id'] == node_id:
                response['nodes'].append(node)

    return response

@app.post("/images/")
async def get_node(image_path: ImageSelect):
    id = image_path.imageId
    node_ids = []
    response = {
        'nodes' : []
    }

    for edge in folder_results['edges']:
        if edge['to'] == id:
            node_ids.append(edge['from'])

    for node_id in node_ids:
        for node in folder_results['nodes']:
            if node['id'] == node_id:
                response['nodes'].append(node)

    return response

def generate_image_graph(image_file):
    model = YOLO('yolov8n.pt')

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
    confidence_threshold = 0.5
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

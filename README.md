# Photo Network
Repo for the latest implementation of our TCC

# How to Run the App:

## Dependencies:

- Python 3.12
  - YoloV8
  - FastAPI
- Node.js > 20
  - ElectronJS
  - Vis-network

## Instructions:

1. Clone the project;
2. Run the API:
   1. move to the `/api` folder;
   2. run the api with: `uvicorn main:app --reload`
3. in a different terminal, run the fontend:
   1. Move to the `/electron` folder
   2. run the frontend with `npm start`
4. Choose a folder!

# App Features

## Required Features

- [x] Process picture and output it's identified tags
- [x] Visualize picture's tags
  - [ ] Preferably with confidence ratios
- [x] Visualize multiple tags and their images
- [x] Relate images through common tags
  - [x] Nº of identical tags could represent edge weight
- [x] Make every execution local
- [x] "Good enough" user interface
  - [X] No obvious missing features
  - [X] Consistent Design Patterns
    - [ ] Bootstrap/Tailwind/Material/...
- [x] Execution instructions

## Nice-to-Have Features

- [ ] No reload between requests
- [x] YoloV8
- [~] Self-Contained Executable

## Optional Features

- [x] Electron (web)App

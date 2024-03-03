from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {
        "roles": [
            {"role" : "Gamer"},
            {"role" : "Cook"},
            {"role" : "Knight"},
            {"role" : "Cancer"},
            {"role" : "Testing"},
        ]
    }

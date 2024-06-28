from fastapi import FastAPI, File, UploadFile, Request, HTTPException
from fastapi.responses import HTMLResponse, FileResponse
import shutil
import cv2
import os
import logging
from track import run_tracking

app = FastAPI()

# Initialize the variable to hold the filename globally
f_name = None

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Ensure the 'uploads' directory exists
os.makedirs("uploads", exist_ok=True)

STATIC_DIR = "."

@app.get("/")
def read_index():
    return FileResponse(os.path.join(STATIC_DIR, 'index.html'))

@app.post("/upload_video")
async def upload_video(file: UploadFile = File(...)):
    global f_name  # Use the global variable
    try:
        video_path = os.path.join("uploads", file.filename)
        
        # Save the uploaded video file
        with open(video_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        logger.info(f"Video '{file.filename}' uploaded successfully.")
        
        # Store the filename in a variable
        f_name = file.filename
        
        # Take a snapshot of the first frame using OpenCV
        vidcap = cv2.VideoCapture(video_path)
        success, image = vidcap.read()
        if success:
            snapshot_filename = f"{file.filename}_snapshot.jpg"
            snapshot_path = os.path.join("uploads", snapshot_filename)
            cv2.imwrite(snapshot_path, image)
            logger.info(f"Snapshot for video '{file.filename}' saved successfully.")
            return {"info": f"Video '{file.filename}' saved at '{video_path}' and snapshot saved at '{snapshot_path}'", "snapshot": snapshot_filename}
        else:
            logger.error(f"Failed to read the video file '{file.filename}'.")
            raise HTTPException(status_code=400, detail="Failed to read video file")
    except Exception as e:
        logger.error(f"Error uploading video '{file.filename}': {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.post("/process_line")
async def process_line(request: Request):
    global f_name  # Use the global variable
    try:
        data = await request.json()
        start_x = int(data.get('startX'))
        start_y = int(data.get('startY'))
        end_x = int(data.get('endX'))
        end_y = int(data.get('endY'))

        # Validate input
        if not all([start_x, start_y, end_x, end_y]):
            raise HTTPException(status_code=400, detail="Invalid input data")
        
        # Call the run_tracking function with the received coordinates and initial count value
        video_path = os.path.join("uploads", f_name)  # Use the global filename
        output_video_path = run_tracking(start_x, start_y, end_x, end_y, video_path, count=0)
        
        logger.info(f"Line data received and processed: ({start_x}, {start_y}) to ({end_x}, {end_y}).")
        return {"message": "Line data received and processed", "output_video_path": output_video_path}
    except Exception as e:
        logger.error(f"Error processing line data: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/{file_path:path}")
def get_static_file(file_path: str):
    file_location = os.path.join(STATIC_DIR, file_path)
    if os.path.isfile(file_location):
        return FileResponse(file_location)
    else:
        raise HTTPException(status_code=404, detail="File not found")

# Run the FastAPI app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


#to start : uvicorn main:app --reload
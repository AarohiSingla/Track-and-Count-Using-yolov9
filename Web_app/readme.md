# CarFlow - Vehicle Tracking and Counting Web App

CarFlow is a web application that utilizes computer vision technology to facilitate vehicle tracking, vehicle counting, and the detection and identification of speeding vehicles.

## Features

- Upload video files (MP4, MOV) for processing
- Draw detection lines on the first frame of the uploaded video
- Detect and count vehicles crossing the detection line
- Process the video with the drawn detection line
- Download the processed video with vehicle counting information

## Technologies Used

- Frontend: HTML, CSS, JavaScript
- Backend: Python, FastAPI
- Computer Vision: OpenCV, Ultralytics YOLO

## Installation

1. Clone the repository:

2. Navigate to the project directory:

3. Install the required Python packages: 

pip install -r requirements.txt

4. Download the YOLO model weights and add it in main directory:

gdown https://github.com/ultralytics/yolov5/releases/download/v6.2/yolov9c.pt

## Usage

1. Start the FastAPI server: uvicorn main:app --reload

2. Open your web browser and navigate to `http://localhost:8000`.

3. Follow the on-screen instructions to upload a video, draw a detection line, and process the video.

4. Once the video is processed, you can download the output video with vehicle counting information.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgements

- [FastAPI](https://fastapi.tiangolo.com/)
- [OpenCV](https://opencv.org/)
- [Ultralytics YOLO](https://github.com/ultralytics/ultralytics)
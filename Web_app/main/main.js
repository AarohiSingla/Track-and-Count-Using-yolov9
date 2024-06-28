function openFileExplorer() {
    document.getElementById('fileInput').click();
}

function handleFileInput(event) {
    const file = event.target.files[0];
    if (file) {
        uploadVideo(file);
    }
}

function dragoverHandler(event) {
    event.preventDefault();
}

function dropHandler(event) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
        uploadVideo(file);
    }
}

let startX, startY, endX, endY; // Declare the variables globally

function processLine() {
    // Get the starting and ending coordinates of the line
    const lineData = {
        startX: startX,
        startY: startY,
        endX: endX,
        endY: endY
    };

    // Send the line data to the backend using fetch
    fetch('/process_line', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(lineData)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        // Handle the response from the backend
        if (data.output_video_path) {
            const downloadLinkContainer = document.createElement('div');
            downloadLinkContainer.style.textAlign = 'center';
            downloadLinkContainer.style.marginTop = '20px';
        
            const downloadLink = document.createElement('a');
            downloadLink.href = data.output_video_path;
            downloadLink.download = data.output_video_path.split('/').pop();
            downloadLink.textContent = 'Download Processed Video';
            downloadLink.classList.add('button');
            downloadLink.id = 'download'; // Added id attribute to the download link
        
            downloadLinkContainer.appendChild(downloadLink);
            document.body.appendChild(downloadLinkContainer);
        }
    })
    .catch(error => {
        console.error('Error processing line:', error);
        // Optionally, handle errors
    });
}

document.addEventListener("DOMContentLoaded", function() {
    // Add event listener for the Process button
    const processButton = document.getElementById("processButton");
    processButton.addEventListener("click", processLine);
});

function uploadVideo(file) {
    const formData = new FormData();
    formData.append('file', file);

    fetch('/upload_video', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            alert('Video uploaded successfully!');
            const snapshotImg = document.createElement('img');
            snapshotImg.src = `/uploads/${data.snapshot}`;
            snapshotImg.alt = 'Video Snapshot';
            snapshotImg.onload = () => {
                drawOnImage(snapshotImg);
            };
        }
    })
    .catch(error => {
        console.error('Error uploading video:', error);
    });
}

const sizeElement = document.querySelector("#sizeRange");
let size = sizeElement.value;
sizeElement.oninput = (e) => {
    size = e.target.value;
};

const colorOptions = document.querySelectorAll('.color-option');
let selectedColor = '#000000'; // Default selected color

colorOptions.forEach(option => {
    option.addEventListener('click', () => {
        const color = option.dataset.color;
        deselectAllColors();
        option.classList.add('selected');
        selectedColor = color;
        handleColorSelection(selectedColor);
    });
});

function deselectAllColors() {
    colorOptions.forEach(option => {
        option.classList.remove('selected');
    });
}

function handleColorSelection(color) {
    console.log(`Selected color: ${color}`);
    updateBrushColor(color);
}

function updateBrushColor(color) {
    const canvasElement = document.getElementById("canvas");
    const context = canvasElement.getContext("2d");
    context.strokeStyle = color;
    context.lineWidth = size;
}

function drawOnImage(image) {
    const canvasElement = document.getElementById("canvas");
    const context = canvasElement.getContext("2d");

    if (image) {
        const imageWidth = image.width;
        const imageHeight = image.height;

        canvasElement.width = imageWidth;
        canvasElement.height = imageHeight;

        context.drawImage(image, 0, 0, imageWidth, imageHeight);
    }

    const clearElement = document.getElementById("clear");
    clearElement.onclick = () => {
        context.clearRect(0, 0, canvasElement.width, canvasElement.height);
        if (image) {
            context.drawImage(image, 0, 0, canvasElement.width, canvasElement.height);
        }
    };

    const exportElement = document.getElementById("export");
    exportElement.onclick = () => {
        const dataURL = canvasElement.toDataURL("image/png");
        const tempLink = document.createElement("a");
        tempLink.href = dataURL;
        tempLink.download = "drawing.png";
        tempLink.click();
    };

    let isDrawing = false;

    canvasElement.onmousedown = (e) => {
        isDrawing = true;
        context.beginPath();
        context.lineWidth = size;
        context.strokeStyle = selectedColor;
        context.lineJoin = "round";
        context.lineCap = "round";
        const rect = canvasElement.getBoundingClientRect();
        const scaleX = canvasElement.width / rect.width;
        const scaleY = canvasElement.height / rect.height;
        startX = (e.clientX - rect.left) * scaleX;
        startY = (e.clientY - rect.top) * scaleY;
        context.moveTo(startX, startY);
    };

    canvasElement.onmousemove = (e) => {
        if (isDrawing) {
            const rect = canvasElement.getBoundingClientRect();
            const scaleX = canvasElement.width / rect.width;
            const scaleY = canvasElement.height / rect.height;
            endX = (e.clientX - rect.left) * scaleX;
            endY = startY; // Keep the y-coordinate constant for a horizontal line
            context.lineTo(endX, endY);
            context.stroke();
        }
    };

    canvasElement.onmouseup = () => {
        isDrawing = false;
        context.closePath();
        console.log(`Line drawn from (${startX}, ${startY}) to (${endX}, ${endY})`);
    };        
}

// Initialize canvas for drawing
drawOnImage();

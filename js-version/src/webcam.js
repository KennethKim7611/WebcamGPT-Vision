// Initialize the webcam and set event listeners
function initializeWebcam() {
    const video = document.getElementById('webcam');
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(error => {
            console.error('getUserMedia error:', error);
        });
}

// Function to capture image from webcam and process it
function captureImage() {
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas image to a base64 URL
    const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];
    
    // Process the image
    processImage(base64Image);
}

// Function to send the image to the server for processing
function processImage(base64Image) {
    fetch('/.netlify/functions/process_image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Image }),
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        // Add additional code here to handle the response data
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

// Handle the server response
function handleResponse(data) {
    const chatbox = document.getElementById('chatbox');
    console.log("handleResponse - chatbox content:", chatbox.innerHTML);

    if(data.error) {
        console.error(data.error);
        appendToChatbox("Error - Rate limit Reached");
        return;
    }
    appendToChatbox(data.choices[0].message.content);
}

// Handle any errors during fetch
function handleError(error) {
    toggleLoader(false);
    console.error('Fetch error:', error);
    appendToChatbox(`Error: ${error.message}`, true);
}

// Toggle the visibility of the loader
function toggleLoader(show) {
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.style.display = show ? 'block' : 'none';
    }
}

// Append messages to the chatbox
function appendToChatbox(message, isUserMessage = false) {
    const chatbox = document.getElementById('chatbox');
    chatbox.innerHTML = ''; // Clear existing content

    if (!isUserMessage) {
        const messageElement = document.createElement('div');
        messageElement.className = 'assistant-message';
        messageElement.innerText = message;
        chatbox.appendChild(messageElement);
    }
}

// Function to switch the camera source
function switchCamera() {
    const video = document.getElementById('webcam');
    let usingFrontCamera = true; // This assumes the initial camera is the user-facing one

    return function() {
        // Toggle the camera type
        usingFrontCamera = !usingFrontCamera;
        const constraints = {
            video: { facingMode: (usingFrontCamera ? 'user' : 'environment') }
        };
        
        // Stop any previous stream
        if (video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
        }
        
        // Start a new stream with the new constraints
        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                video.srcObject = stream;
            })
            .catch(error => {
                console.error('Error accessing media devices.', error);
            });
    };
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    initializeWebcam();
    const captureButton = document.getElementById('capture');
    const switchCameraButton = document.getElementById('switch-camera');

    if (captureButton && switchCameraButton) {
        captureButton.addEventListener('click', captureImage);
        switchCameraButton.addEventListener('click', switchCamera());
    }
});

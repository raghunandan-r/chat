window.location.replace("https://www.raghu.fyi");

// Rest of your main.js code (this will NOT be executed if the redirect above is uncommented) ...
console.log("This won't be reached if redirect is active.");
import './style.css';
const messageBox = document.getElementById('message-box');
const sendButton = document.getElementById('send-button');
const chatOutput = document.querySelector('.chat-output');

// Access environment variables
// const API_KEY = import.meta.env.VITE_API_KEY;
// const API_URL = import.meta.env.VITE_API_URL;

// Function to generate thread ID using crypto-secure random values
function generateThreadId() {
    
    const randomBytes = new Uint8Array(8);
    crypto.getRandomValues(randomBytes);
    
    // Convert to base64 and clean up any URL-unsafe characters
    const randomChars = btoa(String.fromCharCode(...randomBytes))
        .replace(/[+/]/g, '') // Remove + and /
        .substring(0, 8);     // Take first 8 chars
    
    // Add timestamp
    const timestamp = new Date().toISOString()
        .replace(/[-:]/g, '')
        .replace('T', '')
        .replace(/\..+/, '');
    
    return `${randomChars}-${timestamp}`;
}

// Store thread ID in session storage
let threadId = sessionStorage.getItem('threadId');
if (!threadId) {
    threadId = generateThreadId();
    sessionStorage.setItem('threadId', threadId);
}


sendButton.addEventListener('click', sendMessage);

const placeholderImg = document.querySelector('.gif-placeholder img');

function setLoadingState(isLoading) {
    if (isLoading) {
        placeholderImg.src = placeholderImg.dataset.loading;
    } else {
        placeholderImg.src = placeholderImg.dataset.static;
    }
}

async function sendMessage() {
    try {
        setLoadingState(true);  // Show loading GIF
        
        const message = messageBox.value;
        
        // Basic validations
        if (!message || message.trim() === '') {
            displayMessage('Message cannot be empty', 'system');
            return;
        }

        // Check for minimum length
        if (message.trim().length < 2) {
            displayMessage('Message too short', 'system');
            return;
        }

        // Check for maximum length
        if (message.length > 100) {
            displayMessage('Message too long (max 100 characters)', 'system');
            return;
        }

        // Sanitize message to prevent prompt hacking and XSS
        const sanitizedMessage = message
            .replace(/[<>{}]/g, '') // Remove HTML tags and curly braces            
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();

            //.replace(/(?:system|assistant|ai|prompt|instruction|\[.*?\]|\{.*?\}|\$.*?\$|`.*?`|\\[nrt])/gi, '') // Remove prompt hacking attempts

        // Additional validation after sanitization
        if (sanitizedMessage.length < 2) {
            displayMessage('Invalid input message', 'system');
            return;
        }

        // Rate limiting (basic)
        const lastMessageTime = sessionStorage.getItem('lastMessageTime');
        const now = Date.now();
        if (lastMessageTime && now - parseInt(lastMessageTime) < 1000) { // 1 second cooldown
            displayMessage('Please wait before sending another message', 'system');
            return;
        }
        sessionStorage.setItem('lastMessageTime', now.toString());

        // Proceed with sending message
        displayMessage(sanitizedMessage, 'user');
        messageBox.value = '';

        // API call to backend development
        // const response = await fetch(`${API_URL}/api/chat`, {
        // API call to backend production
        const response = await fetch(`https://satisfied-fulfillment-production.up.railway.app/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                //'X-API-KEY': API_KEY
            },
            credentials: 'include', // Important for CORS with authentication
            body: JSON.stringify({
                message: sanitizedMessage,
                thread_id: threadId
            })
        });
        
        if (response.status === 401) {
            throw new Error('Unauthorized');
        }
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        // Process response
        const data = await response.json();
        displayMessage(data.response, 'bot');
    } catch (error) {
        console.error('Error:', error);
        displayMessage(
            error.message === 'Unauthorized' 
            ? 'Unauthorized' 
            : 'An error occurred. Please try again later.', 
        'bot'
        );
        
    } finally {
        setLoadingState(false);  // Return to static image
    }
}

function displayMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add(sender + '-message');
    messageElement.innerHTML = `
        <div class="message-text">${message}</div>
    `;
    chatOutput.appendChild(messageElement);
    chatOutput.scrollTop = chatOutput.scrollHeight;
}

messageBox.addEventListener('keyup', function(event) {
  if (event.key === 'Enter') {
      sendMessage();
  }
});
messageBox.maxLength = 100;

const messageBoxElement = document.getElementById('message-box');
const charCount = document.getElementById('char-count');

messageBox.addEventListener('input', function() {
    charCount.textContent = messageBoxElement.value.length + "/100";
});
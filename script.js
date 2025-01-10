const messageBox = document.getElementById('message-box');
const sendButton = document.getElementById('send-button');
const chatOutput = document.querySelector('.chat-output');


// Function to generate thread ID (same logic as backend)
function generateThreadId() {
    const randomChars = Array(8).fill(0)
        .map(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        .charAt(Math.floor(Math.random() * 62))).join('');
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

function sendMessage() {
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

    // Check for special characters or potential XSS
    const sanitizedMessage = message
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .trim();

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

    // API call to backend
    fetch('http://localhost:8080/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: sanitizedMessage,
            thread_id: threadId
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        displayMessage(data.response, 'bot');
    })
    .catch(error => {
        console.error('Error:', error);
        displayMessage('An error occurred. Please try again later.', 'bot');
    });
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
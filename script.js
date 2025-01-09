const messageBox = document.getElementById('message-box');
const sendButton = document.getElementById('send-button');
const chatOutput = document.querySelector('.chat-output');

sendButton.addEventListener('click', sendMessage);

function sendMessage() {
    const message = messageBox.value;
    if (message.trim() !== '') {
        displayMessage(message, 'user');
        messageBox.value = '';

        // API call to backend
        fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message })
        })
        .then(response => response.json())
        .then(data => {
            displayMessage(data.response, 'bot');
        })
        .catch(error => {
            console.error('Error:', error);
            displayMessage('An error occurred.', 'bot');
        });
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
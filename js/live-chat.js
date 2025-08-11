<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Us - My Real Surveys</title>
    <style>
        /* Global Styles */
        body {
            font-family: Arial, sans-serif;
            background-color: #2e8b57;
            margin: 0;
            padding: 0;
            color: #fff;
        }

        /* Chat Window Styles */
        .chat-window {
            display: none;
            position: fixed;
            bottom: 80px;
            right: 20px;
            background-color: #333;
            color: #fff;
            width: 350px;
            height: 400px;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
            z-index: 101;
            overflow: hidden;
        }

        .chat-window .header {
            background-color: #2e8b57;
            padding: 15px;
            font-size: 18px;
            text-align: center;
            font-weight: bold;
        }

        .chat-window .body {
            height: calc(100% - 100px);
            overflow-y: auto;
            padding: 10px;
            background-color: #444;
        }

        .chat-window .footer {
            padding: 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background-color: #333;
        }

        .chat-window input {
            width: 80%;
            padding: 10px;
            border-radius: 5px;
            border: 1px solid #ddd;
            background-color: #555;
            color: #fff;
        }

        .chat-window button {
            width: 15%;
            padding: 10px;
            background-color: #2e8b57;
            color: #fff;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }

        .chat-window button:hover {
            background-color: #3a9f6f;
        }

        .user-message { color: #4caf50; padding: 8px 12px; margin: 4px 0; }
        .support-message { color: #3498db; padding: 8px 12px; margin: 4px 0; }
        .timestamp { color: #888; font-size: 0.8em; margin-left: 8px; }
        #typingIndicator { font-style: italic; color: #999; }
    </style>
</head>
<body>

<!-- Chat Button -->
<div class="chat-button" id="chatButton">💬</div>

<!-- Chat Window -->
<div class="chat-window" id="chatWindow">
    <div class="header">Live Chat</div>
    <div class="body" id="chatBody">
        <div><strong>Support:</strong> Hello! How can we assist you today?</div>
    </div>
    <div class="footer">
        <input type="text" id="chatInput" placeholder="Type your message..." />
        <button id="sendMessage">Send</button>
    </div>
</div>

<script>
    // Toggle the chat window visibility
    document.getElementById('chatButton').addEventListener('click', toggleChatWindow);

    function toggleChatWindow() {
        const chatWindow = document.getElementById('chatWindow');
        chatWindow.style.display = chatWindow.style.display === 'none' || chatWindow.style.display === '' ? 'block' : 'none';
    }

    // Chat Elements
    const chatBody = document.getElementById('chatBody');
    const chatInput = document.getElementById('chatInput');
    const sendMessageButton = document.getElementById('sendMessage');

    // Event listeners for sending messages
    sendMessageButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') sendMessage();
    });

    // Send message function
    function sendMessage() {
        const userInput = chatInput.value.trim();
        if (userInput === '') return;

        // Add user message to the chat
        addMessageToChat('You', userInput);
        chatInput.value = ''; // Clear input field

        // Show typing indicator
        showTypingIndicator(true);

        // Simulate AI or agent response delay
        setTimeout(() => {
            showTypingIndicator(false);
            processUserInput(userInput);
        }, getRandomDelay());
    }

    // Add message to the chat with timestamp
    function addMessageToChat(sender, message) {
        const messageContainer = document.createElement('div');
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        messageContainer.classList.add(sender === 'You' ? 'user-message' : 'support-message');
        messageContainer.innerHTML = `<strong>${sender}:</strong> ${message} <span class="timestamp">${timestamp}</span>`;
        chatBody.appendChild(messageContainer);
        chatBody.scrollTop = chatBody.scrollHeight; // Auto-scroll to the latest message
    }

    // Show or hide typing indicator
    function showTypingIndicator(isTyping) {
        let typingIndicator = document.getElementById('typingIndicator');

        if (isTyping) {
            if (!typingIndicator) {
                typingIndicator = document.createElement('div');
                typingIndicator.id = 'typingIndicator';
                typingIndicator.classList.add('support-message');
                typingIndicator.innerHTML = `<em>Support is typing...</em>`;
                chatBody.appendChild(typingIndicator);
            }
        } else if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // Process user input and generate response
    function processUserInput(userMessage) {
        let response;

        // Detect keywords and simulate agent response
        if (/agent|live chat|help/i.test(userMessage)) {
            response = "Connecting you to an agent. Please wait a moment...";
            addMessageToChat('Support', response);
            showTypingIndicator(true);

            // Simulate agent connection
            setTimeout(() => {
                showTypingIndicator(false);
                response = 'Agent: Hello, how can I assist you today?';
                addMessageToChat('Support', response);
            }, getRandomDelay());
        } else {
            // AI response simulation
            response = generateAIResponse(userMessage);
            addMessageToChat('Support', response);
        }
    }

    // AI mock response logic
    function generateAIResponse(userMessage) {
        let response;

        if (userMessage.toLowerCase().includes('hello')) {
            response = 'Hello! How can I help you today?';
        } else if (userMessage.toLowerCase().includes('survey')) {
            response = 'Our surveys help gather valuable feedback. How can I assist you with our surveys?';
        } else {
            response = "I'm here to assist you. Let me know if you need help with anything specific.";
        }

        return response;
    }

    // Random delay for response simulation
    function getRandomDelay() {
        return Math.floor(Math.random() * 2000) + 1000;
    }
</script>

</body>
</html>
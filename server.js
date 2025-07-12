// User data with customizable username and avatar color
const currentUser = {
    id: generateUserId(),
    username: localStorage.getItem('username') || 'You',
    avatarColor: localStorage.getItem('avatarColor') || getRandomColor(),
    status: 'online'
};

// Function to generate a random user ID
function generateUserId() {
    return localStorage.getItem('userId') || 'user_' + Math.random().toString(36).substring(2, 10);
}

// Function to generate a random color for avatar
function getRandomColor() {
    const colors = [
        '#5865F2', // Discord Blue
        '#57F287', // Discord Green
        '#FEE75C', // Discord Yellow
        '#EB459E', // Discord Pink
        '#ED4245', // Discord Red
        '#9B59B6', // Purple
        '#3498DB', // Blue
        '#2ECC71', // Green
        '#F1C40F', // Yellow
        '#E74C3C'  // Red
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Save user data to localStorage
if (!localStorage.getItem('userId')) {
    localStorage.setItem('userId', currentUser.id);
    localStorage.setItem('username', currentUser.username);
    localStorage.setItem('avatarColor', currentUser.avatarColor);
}

// Get messages from localStorage or use welcome message if none exist
let savedMessages = JSON.parse(localStorage.getItem('messages') || '[]');
const welcomeMessage = {
    id: Date.now(),
    author: {
        id: 'system',
        username: 'System',
        avatarColor: '#5865F2'
    },
    content: 'Welcome to your personal chat app! This is your private space. All messages are stored locally on your device.',
    timestamp: new Date()
};

// If no saved messages, add welcome message
if (savedMessages.length === 0) {
    savedMessages.push(welcomeMessage);
    localStorage.setItem('messages', JSON.stringify(savedMessages));
}

// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');

// Initialize the chat
function initChat() {
    // Update user info in the UI
    updateUserInfo();
    
    // Load saved messages from localStorage
    savedMessages.forEach(message => {
        appendMessage(message);
    });

    // Add event listeners
    messageInput.addEventListener('keypress', handleMessageSubmit);
    
    // Add click event listeners to channels
    const channels = document.querySelectorAll('.channel');
    channels.forEach(channel => {
        channel.addEventListener('click', () => {
            // Remove active class from all channels
            channels.forEach(c => c.classList.remove('active'));
            // Add active class to clicked channel
            channel.classList.add('active');
            
            // Update chat header
            const channelName = channel.querySelector('span').textContent;
            document.querySelector('.chat-header-left span').textContent = channelName;
            messageInput.placeholder = `Message #${channelName}`;
            
            // For a real multi-channel app, we would load different messages
            // For this simplified version, we keep the same messages
        });
    });
    
    // Add click event listeners to server icons
    const serverIcons = document.querySelectorAll('.server-icon');
    serverIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            // Remove active class from all server icons
            serverIcons.forEach(i => i.classList.remove('active'));
            // Add active class to clicked server icon
            icon.classList.add('active');
        });
    });
    
    // Add settings button functionality
    const settingsButton = document.querySelector('.user-controls .fa-cog');
    settingsButton.addEventListener('click', openUserSettings);
}

// Update user info in the UI
function updateUserInfo() {
    // Update username
    document.querySelector('.user-details .username').textContent = currentUser.username;
    
    // Update avatar with color instead of image
    const userAvatar = document.querySelector('.user-info .user-avatar');
    const userInitial = currentUser.username.charAt(0).toUpperCase();
    
    // Clear existing avatar content
    userAvatar.innerHTML = '';
    
    // Create avatar with initial
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'avatar-initial';
    avatarDiv.style.backgroundColor = currentUser.avatarColor;
    avatarDiv.textContent = userInitial;
    
    // Add status indicator
    const statusIndicator = document.createElement('span');
    statusIndicator.className = 'status-indicator ' + currentUser.status;
    
    // Add elements to avatar
    userAvatar.appendChild(avatarDiv);
    userAvatar.appendChild(statusIndicator);
}

// Format timestamp
function formatTimestamp(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMins > 0) {
        return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else {
        return 'Just now';
    }
}

// Append a message to the chat
function appendMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    
    // Convert timestamp string back to Date object if needed
    const timestamp = message.timestamp instanceof Date ? 
        message.timestamp : new Date(message.timestamp);
    
    const formattedTimestamp = formatTimestamp(timestamp);
    
    // Create avatar element with initial and color
    const avatarHTML = message.author.id === 'system' ?
        `<div class="message-avatar system-avatar">
            <i class="fas fa-cog" style="color: white;"></i>
        </div>` :
        `<div class="message-avatar">
            <div class="avatar-initial" style="background-color: ${message.author.avatarColor || currentUser.avatarColor}">
                ${message.author.username.charAt(0).toUpperCase()}
            </div>
        </div>`;
    
    // Format message content with emoji support and link detection
    const formattedContent = formatMessageContent(message.content);
    
    messageElement.innerHTML = `
        ${avatarHTML}
        <div class="message-content">
            <div class="message-header">
                <span class="message-author">${message.author.username}</span>
                <span class="message-timestamp">${formattedTimestamp}</span>
            </div>
            <div class="message-text">${formattedContent}</div>
        </div>
    `;
    
    // Add delete button for user's own messages
    if (message.author.id === currentUser.id) {
        const deleteButton = document.createElement('div');
        deleteButton.className = 'message-delete';
        deleteButton.innerHTML = '<i class="fas fa-times"></i>';
        deleteButton.addEventListener('click', () => deleteMessage(message.id));
        messageElement.appendChild(deleteButton);
    }
    
    chatMessages.appendChild(messageElement);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Format message content with emoji support and link detection
function formatMessageContent(content) {
    // Convert URLs to clickable links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    content = content.replace(urlRegex, url => `<a href="${url}" target="_blank">${url}</a>`);
    
    // Simple emoji conversion
    content = content.replace(/:smile:/g, '😊');
    content = content.replace(/:laugh:/g, '😂');
    content = content.replace(/:sad:/g, '😢');
    content = content.replace(/:heart:/g, '❤️');
    content = content.replace(/:thumbsup:/g, '👍');
    
    return content;
}

// Delete a message
function deleteMessage(messageId) {
    // Remove from savedMessages array
    savedMessages = savedMessages.filter(msg => msg.id !== messageId);
    
    // Update localStorage
    localStorage.setItem('messages', JSON.stringify(savedMessages));
    
    // Refresh messages display
    chatMessages.innerHTML = '';
    savedMessages.forEach(message => {
        appendMessage(message);
    });
}

// Handle message submission
function handleMessageSubmit(event) {
    if (event.key === 'Enter' && messageInput.value.trim() !== '') {
        const newMessage = {
            id: Date.now(),
            author: {
                id: currentUser.id,
                username: currentUser.username,
                avatarColor: currentUser.avatarColor
            },
            content: messageInput.value.trim(),
            timestamp: new Date()
        };
        
        // Add to saved messages
        savedMessages.push(newMessage);
        
        // Save to localStorage
        localStorage.setItem('messages', JSON.stringify(savedMessages));
        
        // Display the message
        appendMessage(newMessage);
        
        // Clear input
        messageInput.value = '';
    }
}

// Open user settings modal
function openUserSettings() {
    // Create modal if it doesn't exist
    let modal = document.getElementById('settings-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'settings-modal';
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>User Settings</h2>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="settings-group">
                        <label for="username-input">Username</label>
                        <input type="text" id="username-input" value="${currentUser.username}">
                    </div>
                    <div class="settings-group">
                        <label>Avatar Color</label>
                        <div class="color-picker">
                            <div class="color-option" style="background-color: #5865F2" data-color="#5865F2"></div>
                            <div class="color-option" style="background-color: #57F287" data-color="#57F287"></div>
                            <div class="color-option" style="background-color: #FEE75C" data-color="#FEE75C"></div>
                            <div class="color-option" style="background-color: #EB459E" data-color="#EB459E"></div>
                            <div class="color-option" style="background-color: #ED4245" data-color="#ED4245"></div>
                            <div class="color-option" style="background-color: #9B59B6" data-color="#9B59B6"></div>
                            <div class="color-option" style="background-color: #3498DB" data-color="#3498DB"></div>
                            <div class="color-option" style="background-color: #2ECC71" data-color="#2ECC71"></div>
                            <div class="color-option" style="background-color: #F1C40F" data-color="#F1C40F"></div>
                            <div class="color-option" style="background-color: #E74C3C" data-color="#E74C3C"></div>
                        </div>
                    </div>
                    <div class="settings-group">
                        <button id="save-settings">Save Changes</button>
                        <button id="clear-messages">Clear All Messages</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        document.querySelector('.close-modal').addEventListener('click', closeModal);
        document.getElementById('save-settings').addEventListener('click', saveUserSettings);
        document.getElementById('clear-messages').addEventListener('click', clearAllMessages);
        
        // Add color picker functionality
        const colorOptions = document.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remove selected class from all options
                colorOptions.forEach(opt => opt.classList.remove('selected'));
                // Add selected class to clicked option
                option.classList.add('selected');
            });
            
            // Mark current color as selected
            if (option.getAttribute('data-color') === currentUser.avatarColor) {
                option.classList.add('selected');
            }
        });
    }
    
    // Show the modal
    modal.style.display = 'block';
}

// Close the modal
function closeModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Save user settings
function saveUserSettings() {
    const usernameInput = document.getElementById('username-input');
    const selectedColor = document.querySelector('.color-option.selected');
    
    if (usernameInput && usernameInput.value.trim() !== '') {
        // Update username
        currentUser.username = usernameInput.value.trim();
        localStorage.setItem('username', currentUser.username);
        
        // Update color if selected
        if (selectedColor) {
            currentUser.avatarColor = selectedColor.getAttribute('data-color');
            localStorage.setItem('avatarColor', currentUser.avatarColor);
        }
        
        // Update UI
        updateUserInfo();
        
        // Update message avatars for this user
        updateUserMessagesAvatars();
        
        // Close modal
        closeModal();
    }
}

// Clear all messages
function clearAllMessages() {
    if (confirm('Are you sure you want to delete all messages? This cannot be undone.')) {
        // Keep only the welcome message
        savedMessages = [welcomeMessage];
        localStorage.setItem('messages', JSON.stringify(savedMessages));
        
        // Refresh messages display
        chatMessages.innerHTML = '';
        savedMessages.forEach(message => {
            appendMessage(message);
        });
        
        // Close modal
        closeModal();
    }
}

// Update all message avatars for the current user
function updateUserMessagesAvatars() {
    // Get all messages from the current user
    const userMessages = document.querySelectorAll('.message');
    
    userMessages.forEach(messageElement => {
        // Check if this is the current user's message
        const authorName = messageElement.querySelector('.message-author');
        if (authorName && authorName.textContent === currentUser.username) {
            // Update the avatar color
            const avatarInitial = messageElement.querySelector('.avatar-initial');
            if (avatarInitial) {
                avatarInitial.style.backgroundColor = currentUser.avatarColor;
            }
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initChat);

// Toggle online/offline status for demo purposes
function toggleStatus() {
    const statusIndicator = document.querySelector('.user-info .status-indicator');
    const statusText = document.querySelector('.user-info .status');
    
    if (statusIndicator.classList.contains('online')) {
        statusIndicator.classList.remove('online');
        statusIndicator.classList.add('offline');
        statusText.textContent = 'Offline';
        currentUser.status = 'offline';
    } else {
        statusIndicator.classList.remove('offline');
        statusIndicator.classList.add('online');
        statusText.textContent = 'Online';
        currentUser.status = 'online';
    }
}

// Add click event to user avatar to toggle status (for demo)
document.addEventListener('DOMContentLoaded', () => {
    const userAvatar = document.querySelector('.user-info .user-avatar');
    userAvatar.addEventListener('click', toggleStatus);
});

// We don't need this hover effect as it's now handled by CSS
// Removing this code to avoid conflicts with CSS hover effects

// Add emoji picker functionality (simplified for demo)
document.addEventListener('DOMContentLoaded', () => {
    const emojiButton = document.querySelector('.message-input-buttons .fa-smile');
    
    emojiButton.addEventListener('click', () => {
        // In a real app, we would show an emoji picker
        // For demo, we'll just add a smiley face to the input
        messageInput.value += ' 😊';
        messageInput.focus();
    });
});

// Add attachment functionality (simplified for demo)
document.addEventListener('DOMContentLoaded', () => {
    const attachmentButton = document.querySelector('.attachment-btn');
    
    attachmentButton.addEventListener('click', () => {
        // In a real app, we would show a file picker
        alert('File upload would open here in a real app!');
    });
});

// Add image upload functionality (simplified for demo)
document.addEventListener('DOMContentLoaded', () => {
    const imageButton = document.querySelector('.message-input-buttons .fa-file-image');
    
    imageButton.addEventListener('click', () => {
        // In a real app, we would show an image picker
        alert('Image upload would open here in a real app!');
    });
});

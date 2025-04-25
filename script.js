// Initialize particles.js
particlesJS('particles-js', {
    particles: {
        number: {
            value: 80,
            density: {
                enable: true,
                value_area: 800
            }
        },
        color: {
            value: '#6c5ce7'
        },
        shape: {
            type: 'circle'
        },
        opacity: {
            value: 0.5,
            random: true
        },
        size: {
            value: 3,
            random: true
        },
        line_linked: {
            enable: true,
            distance: 150,
            color: '#6c5ce7',
            opacity: 0.4,
            width: 1
        },
        move: {
            enable: true,
            speed: 2,
            direction: 'none',
            random: true,
            straight: false,
            out_mode: 'out',
            bounce: false
        }
    },
    interactivity: {
        detect_on: 'canvas',
        events: {
            onhover: {
                enable: true,
                mode: 'grab'
            },
            onclick: {
                enable: true,
                mode: 'push'
            },
            resize: true
        }
    },
    retina_detect: true
});

// Theme toggle functionality
const themeToggle = document.querySelector('.theme-toggle');
const body = document.body;

themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    
    // Update theme icon
    const icon = themeToggle.querySelector('i');
    icon.className = newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
});

// Chat history management
let chatHistory = [];
let currentChatId = null;

// DOM Elements
const chatHistoryContainer = document.getElementById('chat-history');
const newChatButton = document.getElementById('new-chat');
const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');
const sidebarToggle = document.querySelector('.sidebar-toggle');
const deleteChatButton = document.getElementById('delete-chat');
const shareChatButton = document.getElementById('share-chat');

// Initialize chat
function initializeChat() {
    loadChatHistory();
    if (chatHistory.length === 0) {
        createNewChat();
    } else {
        // Load the most recent chat without showing welcome message
        const mostRecentChat = chatHistory[0];
        loadChat(mostRecentChat.id);
    }
}

// Create new chat
function createNewChat() {
    const chatId = Date.now().toString();
    const chat = {
        id: chatId,
        title: 'New Chat',
        messages: [],
        timestamp: new Date()
    };
    chatHistory.push(chat);
    currentChatId = chatId;
    saveChatHistory();
    updateChatHistoryUI();
    clearChatMessages();
    // Add welcome message for new chats
    addMessage("Hello! I'm your AI assistant. How can I help you today?", false);
}

// Save chat history to localStorage with timestamp
function saveChatHistory() {
    // Sort chats by timestamp (newest first)
    chatHistory.sort((a, b) => b.timestamp - a.timestamp);
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

// Load chat history from localStorage
function loadChatHistory() {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
        chatHistory = JSON.parse(savedHistory);
        if (chatHistory.length > 0) {
            currentChatId = chatHistory[0].id;
            loadChat(currentChatId);
        } else {
            createNewChat();
        }
    } else {
        createNewChat();
    }
    updateChatHistoryUI();
}

// Update chat history UI with enhanced share options
function updateChatHistoryUI() {
    chatHistoryContainer.innerHTML = '';
    chatHistory.forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.className = `chat-history-item ${chat.id === currentChatId ? 'active' : ''}`;
        
        let previewText = 'New Chat';
        if (chat.messages.length > 0) {
            const firstUserMessage = chat.messages.find(msg => msg.isUser);
            if (firstUserMessage) {
                previewText = firstUserMessage.text.substring(0, 30) + (firstUserMessage.text.length > 30 ? '...' : '');
            }
        }
        
        chatItem.innerHTML = `
            <i class="fas fa-comment"></i>
            <div class="chat-preview">
                <div class="chat-title">${chat.title}</div>
                <div class="chat-preview-text">${previewText}</div>
            </div>
            <div class="item-actions">
                <button class="item-action share" onclick="shareChat('${chat.id}')">
                    <i class="fas fa-share-alt"></i>
                </button>
                <button class="item-action download" onclick="downloadAsPDF('${chat.id}')">
                    <i class="fas fa-file-pdf"></i>
                </button>
                <button class="item-action delete" onclick="deleteChat('${chat.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        chatItem.addEventListener('click', () => loadChat(chat.id));
        chatHistoryContainer.appendChild(chatItem);
    });
}

// Load a specific chat
function loadChat(chatId) {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
        currentChatId = chatId;
        clearChatMessages();
        chat.messages.forEach(msg => {
            addMessage(msg.text, msg.isUser);
        });
        updateChatHistoryUI();
    }
}

// Clear chat messages
function clearChatMessages() {
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';
}

// Configure marked for markdown parsing
marked.setOptions({
    highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
    },
    breaks: true,
    gfm: true
});

// Add message with markdown support
function addMessage(text, isUser = false) {
    const chat = chatHistory.find(c => c.id === currentChatId);
    if (chat) {
        chat.messages.push({
            text,
            isUser,
            timestamp: new Date()
        });
        
        // Update chat title if it's the first user message
        if (isUser && chat.title === 'New Chat') {
            chat.title = text.substring(0, 30) + (text.length > 30 ? '...' : '');
        }
        
        saveChatHistory();
        updateChatHistoryUI();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Parse markdown and handle code blocks
    const formattedText = marked.parse(text);
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <div class="message-text">${formattedText}</div>
            <div class="message-time">${timeString}</div>
        </div>
    `;
    
    // Apply syntax highlighting to code blocks and add copy buttons
    const codeBlocks = messageDiv.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
        hljs.highlightElement(block);
        
        // Create copy button
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.innerHTML = '<i class="fas fa-copy"></i>';
        copyButton.title = 'Copy code';
        
        // Add click event to copy code
        copyButton.addEventListener('click', () => {
            const code = block.textContent;
            navigator.clipboard.writeText(code).then(() => {
                // Show copied feedback
                copyButton.innerHTML = '<i class="fas fa-check"></i>';
                copyButton.title = 'Copied!';
                setTimeout(() => {
                    copyButton.innerHTML = '<i class="fas fa-copy"></i>';
                    copyButton.title = 'Copy code';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy code:', err);
                copyButton.innerHTML = '<i class="fas fa-times"></i>';
                copyButton.title = 'Failed to copy';
                setTimeout(() => {
                    copyButton.innerHTML = '<i class="fas fa-copy"></i>';
                    copyButton.title = 'Copy code';
                }, 2000);
            });
        });
        
        // Add copy button to code block
        const pre = block.parentElement;
        pre.style.position = 'relative';
        pre.appendChild(copyButton);
    });
    
    document.getElementById('chat-messages').appendChild(messageDiv);
    document.getElementById('chat-messages').scrollTop = document.getElementById('chat-messages').scrollHeight;
}

// Toggle sidebar
function toggleSidebar() {
    sidebar.classList.toggle('collapsed');
    const icon = sidebarToggle.querySelector('i');
    if (sidebar.classList.contains('collapsed')) {
        icon.className = 'fas fa-chevron-right';
    } else {
        icon.className = 'fas fa-chevron-left';
    }
}

// Event Listeners
newChatButton.addEventListener('click', createNewChat);
sidebarToggle.addEventListener('click', toggleSidebar);
menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && 
        !sidebar.contains(e.target) && 
        !menuToggle.contains(e.target) &&
        sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
    }
});

// Chat functionality
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

async function handleUserInput() {
    const message = userInput.value.trim();
    if (message) {
        addMessage(message, true);
        userInput.value = '';
        
        try {
            const API_KEY = 'AIzaSyBducvKo11LPuLZRnwlVF1ED1LsFCExPM0';
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: message
                        }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            
            if (data.candidates && data.candidates[0]) {
                addMessage(data.candidates[0].content.parts[0].text);
            } else {
                throw new Error('Invalid response from Gemini API');
            }
        } catch (error) {
            console.error('Error:', error);
            addMessage(`Error: ${error.message}. Please try again.`);
        }
    }
}

// Event listeners
sendButton.addEventListener('click', handleUserInput);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleUserInput();
    }
});

// Auto-resize textarea
userInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// Delete current chat
function deleteCurrentChat() {
    if (confirm('Are you sure you want to delete this chat?')) {
        const index = chatHistory.findIndex(chat => chat.id === currentChatId);
        if (index !== -1) {
            chatHistory.splice(index, 1);
            saveChatHistory();
            
            if (chatHistory.length > 0) {
                currentChatId = chatHistory[0].id;
                loadChat(currentChatId);
            } else {
                createNewChat();
            }
            
            updateChatHistoryUI();
        }
    }
}

// Initialize variables for share functionality
const shareModal = document.getElementById('share-modal');
const closeModal = document.querySelector('.close-modal');
const copyLinkButton = document.getElementById('copy-link');
const downloadTxtButton = document.getElementById('download-txt');
const downloadPdfButton = document.getElementById('download-pdf');
const shareEmailButton = document.getElementById('share-email');
const sharePreview = document.getElementById('share-preview');

// Share current chat
function shareCurrentChat() {
    showShareModal();
}

// Share specific chat
function shareChat(chatId) {
    showShareModal(chatId);
}

// Show share modal with specific chat
function showShareModal(chatId = null) {
    const chat = chatId ? 
        chatHistory.find(c => c.id === chatId) : 
        chatHistory.find(c => c.id === currentChatId);
        
    if (chat) {
        updateSharePreview(chat);
        shareModal.classList.add('active');
    }
}

// Hide share modal
function hideShareModal() {
    shareModal.classList.remove('active');
}

// Update share preview
function updateSharePreview(chat) {
    let previewContent = `<h4>${chat.title}</h4>`;
    chat.messages.forEach(msg => {
        previewContent += `
            <div class="preview-message ${msg.isUser ? 'user' : 'ai'}">
                <strong>${msg.isUser ? 'You' : 'AI'}:</strong>
                <p>${msg.text}</p>
            </div>
        `;
    });
    sharePreview.innerHTML = previewContent;
}

// Copy chat link
function copyChatLink() {
    const chat = chatHistory.find(c => c.id === currentChatId);
    if (chat) {
        const chatData = {
            id: chat.id,
            title: chat.title,
            messages: chat.messages
        };
        const chatString = JSON.stringify(chatData);
        const base64String = btoa(chatString);
        const link = `${window.location.origin}${window.location.pathname}?chat=${base64String}`;
        
        navigator.clipboard.writeText(link).then(() => {
            alert('Chat link copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy link:', err);
            alert('Failed to copy link. Please try again.');
        });
    }
}

// Download as text
function downloadAsText() {
    const chat = chatHistory.find(c => c.id === currentChatId);
    if (chat) {
        let textContent = `${chat.title}\n\n`;
        chat.messages.forEach(msg => {
            textContent += `${msg.isUser ? 'You' : 'AI'}: ${msg.text}\n\n`;
        });
        
        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${chat.title.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// PDF Generation
function generatePDF(chat) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text(chat.title, 20, 20);
    
    // Add messages
    let y = 40;
    doc.setFontSize(12);
    
    chat.messages.forEach((msg, index) => {
        // Add sender name
        doc.setFont(undefined, 'bold');
        doc.text(`${msg.isUser ? 'You' : 'AI'}:`, 20, y);
        
        // Add message text
        doc.setFont(undefined, 'normal');
        const splitText = doc.splitTextToSize(msg.text, 170);
        doc.text(splitText, 30, y + 5);
        
        // Add timestamp if available
        if (msg.timestamp) {
            const date = new Date(msg.timestamp);
            const timeString = date.toLocaleString();
            doc.setFontSize(8);
            doc.text(timeString, 170, y, { align: 'right' });
            doc.setFontSize(12);
        }
        
        y += (splitText.length * 7) + 15;
        
        // Add new page if needed
        if (y > 250 && index < chat.messages.length - 1) {
            doc.addPage();
            y = 20;
        }
    });
    
    return doc;
}

// Download as PDF
function downloadAsPDF(chatId = null) {
    const chat = chatId ? 
        chatHistory.find(c => c.id === chatId) : 
        chatHistory.find(c => c.id === currentChatId);
        
    if (chat) {
        try {
            const doc = generatePDF(chat);
            doc.save(`${chat.title.replace(/\s+/g, '_')}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        }
    }
}

// Share via email
function shareViaEmail() {
    const chat = chatHistory.find(c => c.id === currentChatId);
    if (chat) {
        let emailContent = `${chat.title}\n\n`;
        chat.messages.forEach(msg => {
            emailContent += `${msg.isUser ? 'You' : 'AI'}: ${msg.text}\n\n`;
        });
        
        const subject = encodeURIComponent(chat.title);
        const body = encodeURIComponent(emailContent);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }
}

// Event Listeners
deleteChatButton.addEventListener('click', deleteCurrentChat);
shareChatButton.addEventListener('click', shareCurrentChat);
closeModal.addEventListener('click', hideShareModal);
copyLinkButton.addEventListener('click', copyChatLink);
downloadTxtButton.addEventListener('click', downloadAsText);
downloadPdfButton.addEventListener('click', () => downloadAsPDF());
shareEmailButton.addEventListener('click', shareViaEmail);

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    if (e.target === shareModal) {
        hideShareModal();
    }
});

// Update share button click handler
shareChatButton.addEventListener('click', () => showShareModal());

// Add event listeners for share functionality
function initializeShareFunctionality() {
    // Share button in chatbox
    if (shareChatButton) {
        shareChatButton.addEventListener('click', shareCurrentChat);
    }
    
    // Share modal close button
    if (closeModal) {
        closeModal.addEventListener('click', hideShareModal);
    }
    
    // Share options buttons
    if (copyLinkButton) {
        copyLinkButton.addEventListener('click', copyChatLink);
    }
    
    if (downloadTxtButton) {
        downloadTxtButton.addEventListener('click', downloadAsText);
    }
    
    if (downloadPdfButton) {
        downloadPdfButton.addEventListener('click', () => downloadAsPDF());
    }
    
    if (shareEmailButton) {
        shareEmailButton.addEventListener('click', shareViaEmail);
    }
    
    // Close modal when clicking outside
    if (shareModal) {
        document.addEventListener('click', (e) => {
            if (e.target === shareModal) {
                hideShareModal();
            }
        });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeChat();
    initializeShareFunctionality();
    // ... other initializations ...
}); 
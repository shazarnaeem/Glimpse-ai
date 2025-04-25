const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Root endpoint
app.get('/', (req, res) => {
    console.log('Root endpoint hit');
    res.json({ message: 'Server is running' });
});

// Gemini API endpoint
app.post('/api/gemini', async (req, res) => {
    console.log('Gemini endpoint hit');
    try {
        const { message } = req.body;
        console.log('Request body:', req.body);
        
        if (!message) {
            console.log('No message provided');
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log('Received message:', message);
        const API_KEY = 'AIzaSyBducvKo11LPuLZRnwlVF1ED1LsFCExPM0';

        console.log('Making request to Gemini API...');
        const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
            contents: [{
                parts: [{
                    text: message
                }]
            }]
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Received response from Gemini API:', response.data);

        if (!response.data || !response.data.candidates || !response.data.candidates[0]) {
            console.error('Invalid response format:', response.data);
            throw new Error('Invalid response format from Gemini API');
        }

        const geminiResponse = response.data.candidates[0].content.parts[0].text;
        console.log('Extracted response:', geminiResponse);
        
        res.json({
            content: [{
                text: geminiResponse
            }]
        });
    } catch (error) {
        console.error('Detailed error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            stack: error.stack
        });

        if (error.response) {
            console.error('API Error Response:', error.response.data);
            res.status(error.response.status).json({
                error: 'Gemini API error',
                details: error.response.data
            });
        } else if (error.request) {
            console.error('No response received:', error.message);
            res.status(500).json({
                error: 'No response from Gemini API',
                details: error.message
            });
        } else {
            console.error('Request setup error:', error.message);
            res.status(500).json({
                error: 'Error setting up request to Gemini API',
                details: error.message
            });
        }
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    console.log('Health check endpoint hit');
    res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Test the server at http://localhost:${port}`);
    console.log(`Health check at http://localhost:${port}/health`);
}); 
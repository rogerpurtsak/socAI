# socAI - AI-Powered Social Media Content Generator

A modern web application that generates engaging social media posts with AI-powered captions and images using xAI Grok.

## Features

- **Single Post Generation**: Create Twitter/Meme style or Regular social media posts
- **Story to Multiple Posts**: Convert any text/article into multiple viral posts
- **Post Type Options**:
  - Twitter/Meme: Text overlay on images with viral-worthy captions
  - Regular Post: Clean images with separate engaging captions
- **Modern Glassmorphism UI**: Beautiful dark theme with gradient accents
- **Post History**: Keep track of all generated posts
- **Download & Copy**: Easy export options for images and captions

## Tech Stack

### Frontend
- React + Vite
- Tailwind CSS
- Radix UI Components
- Lucide React Icons

### Backend
- Node.js + Express
- xAI Grok API (Text & Image Generation)
- Sharp (Image Processing)

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- xAI Grok API Key

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```
GROK_API_KEY=your_xai_grok_api_key_here
PORT=4000
```

4. Start the backend server:
```bash
node index.js
```

The backend will run on `http://localhost:4000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or next available port)

## Usage

### Single Post Generation

1. Select **Single Post** tab
2. Choose post type (Twitter/Meme or Regular Post)
3. Describe the image you want to generate
4. Select tone (Friendly, Humorous, Professional, Youth-oriented)
5. Click "Generate Post"
6. View, copy caption, or download image

### Story to Multiple Posts

1. Select **Story to Posts** tab
2. Paste your story, article, or analysis
3. Choose number of posts to generate (2-5)
4. Select tone
5. Click "Generate Multiple Posts"
6. AI will create multiple unique posts from different angles

## Project Structure

```
socAI/
├── backend/
│   ├── index.js           # Express server & API endpoints
│   ├── package.json
│   └── .env              # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── GenerationForm.jsx
│   │   │   ├── LivePreview.jsx
│   │   │   ├── PostCard.jsx
│   │   │   └── PostsGallery.jsx
│   │   ├── components/ui/   # Reusable UI components
│   │   ├── hooks/
│   │   │   └── use-toast.js
│   │   ├── lib/
│   │   │   └── utils.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── jsconfig.json
│
└── README.md
```

## API Endpoints

### POST /api/generate-post
Generate a single social media post.

**Request Body:**
```json
{
  "description": "Image description",
  "tone": "humoorikas",
  "postType": "twitter"
}
```

**Response:**
```json
{
  "postType": "twitter",
  "caption": "Generated caption",
  "imageBase64": "base64_image_data",
  "style": "bottom-only",
  "topText": "",
  "bottomText": "Caption text"
}
```

### POST /api/story-to-posts
Generate multiple posts from a story/article.

**Request Body:**
```json
{
  "storyText": "Your story or article text",
  "numberOfPosts": 3,
  "tone": "humoorikas"
}
```

**Response:**
```json
{
  "success": true,
  "totalGenerated": 3,
  "posts": [
    {
      "id": 1234567890,
      "postType": "twitter",
      "caption": "Generated caption",
      "imageBase64": "base64_image_data",
      "angle": "What makes this engaging"
    }
  ]
}
```

## Customization

### Color Scheme
Edit `frontend/src/index.css` to customize the HSL color variables:

```css
:root {
  --primary: 142 71% 45%;      /* Green */
  --secondary: 271 91% 65%;    /* Purple */
  --accent: 199 89% 48%;       /* Cyan */
  --pink: 330 81% 60%;         /* Pink */
}
```

### Tones
Modify tone options in `backend/index.js` and `frontend/src/components/GenerationForm.jsx`

## Troubleshooting

### Port Already in Use
If port 5173 or 4000 is in use, the servers will automatically try the next available port.

### API Key Issues
Make sure your GROK_API_KEY in `.env` is valid and has sufficient credits.

### Image Generation Fails
Check backend logs for API errors. Grok may have rate limits or content restrictions.

## Future Features

- Multi-platform post optimization
- Viral score prediction
- Hashtag generation
- Post scheduling
- A/B testing generator
- Brand voice customization
- Analytics dashboard

## License

MIT

## Contributors

Built for hackathon by socAI team

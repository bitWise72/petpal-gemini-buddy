# AI Pet Assistant Widget 🐾

An embeddable, AI-powered pet assistant that can be added to any website with just a few lines of code.

## 🚀 Quick Start

### For Website Owners

1. **View the Demo**
   - Open `http://localhost:8080/embed-demo.html` in your browser
   - Configure the widget settings
   - Copy the generated embed code

2. **Add to Your Website**
   ```html
   <!-- Add this where you want the assistant to appear -->
   <div id="ai-pet-assistant"></div>
   <script src="YOUR_API_URL/widget.js"></script>
   <script>
     window.AIAssistant.init({
       containerId: 'ai-pet-assistant',
       apiUrl: 'YOUR_API_URL',
       primaryColor: '#8B5CF6',
       mascotImage: '/your-mascot.jpg',
       enableVoice: true
     });
   </script>
   ```

## ⚙️ Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiUrl` | string | Required | Your deployed backend API URL |
| `primaryColor` | string | `#8B5CF6` | Brand color for the widget |
| `mascotImage` | string | `/pettry-mascot.jpg` | URL to your mascot image |
| `enableVoice` | boolean | `true` | Enable/disable voice interaction |

## 🏗️ Architecture

### Frontend Widget (This Project)
- Self-contained React components
- Configurable via props
- Can be embedded in any website
- Uses your backend API

### Backend Requirements
The widget expects these API endpoints:

#### 1. POST `/functions/v1/analyze-pet-photo`
Analyzes pet photos using AI vision.

**Request:**
```json
{
  "imageData": "data:image/jpeg;base64,..."
}
```

**Response:**
```json
{
  "analysis": "What a beautiful husky!",
  "petDetails": {
    "type": "dog",
    "breed": "husky",
    "age": "adult",
    "size": "medium"
  }
}
```

#### 2. POST `/functions/v1/chat-assistant`
Generates AI chat responses with product recommendations.

**Request:**
```json
{
  "messages": [
    {"role": "user", "content": "I need a bed for my dog"}
  ],
  "petAnalysis": "Your husky is...",
  "petDetails": {...}
}
```

**Response:**
```json
{
  "reply": "I recommend the Orthopedic Dog Bed...",
  "recommendedProducts": [
    {
      "id": "uuid",
      "name": "Dog Bed",
      "price": 79.99,
      "image_url": "...",
      "description": "..."
    }
  ]
}
```

## 🔧 Development

### Running Locally
```bash
npm install
npm run dev
```

Visit `http://localhost:8080/embed-demo.html` to test the widget.

### Building for Production
```bash
npm run build
```

## 🌐 Deployment

### Option 1: Use Existing Supabase Backend
The current implementation uses Supabase Edge Functions. Deploy your own:
1. Create a Supabase project
2. Deploy the edge functions from `supabase/functions/`
3. Use your Supabase URL as the `apiUrl`

### Option 2: Custom Backend
Create your own API server that implements the required endpoints.

## 📦 Features

- ✅ **AI Vision**: Analyzes pet photos to identify breed, age, health
- ✅ **Conversational AI**: Natural chat interface with personality
- ✅ **Voice Interface**: Automatic voice detection and natural TTS
- ✅ **Product Recommendations**: AI-powered product matching
- ✅ **Shopping Cart**: Full checkout flow
- ✅ **Responsive Design**: Works on mobile and desktop
- ✅ **Customizable**: Brand colors, mascot, features

## 🔒 Security

- API keys stay on your backend
- CORS-enabled for cross-origin embedding
- No sensitive data stored in frontend
- All AI processing on your secure backend

## 📄 License

Open source - use freely for any project!

## 🤝 Contributing

This is a reusable component. Feel free to:
- Report issues
- Submit improvements
- Create custom themes
- Share feedback

## 💡 Use Cases

- Pet store websites
- Veterinary clinics
- Pet adoption platforms
- Pet care services
- Animal shelters
- Pet product e-commerce

## 📞 Support

For questions or issues, check the documentation or open an issue.

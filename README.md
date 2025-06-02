# 📚 PrepAI - AI-Powered Quiz Generator

[![React Native](https://img.shields.io/badge/React%20Native-0.79.2-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-53.0.9-000000.svg)](https://expo.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-green.svg)](https://mongodb.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-AI-orange.svg)](https://ai.google.dev/)

PrepAI is an intelligent quiz generation platform that transforms PDF documents into interactive quizzes using AI. Upload any PDF, and our system automatically generates multiple-choice questions and open-ended text questions based on the content.

## Features

### Core Functionality
- **PDF to Quiz Conversion**: Upload PDF documents and automatically generate quizzes using Google Gemini AI
- **Dual Question Types**: 
  - Multiple Choice Questions (MCQs) with 4 options each
  - Open-ended text questions for deeper understanding
- **Intelligent Answer Validation**: AI-powered validation for text answers with detailed feedback
- **Quiz Sharing**: Generate unique codes to share quizzes with others
- **Personal Quiz Library**: Manage and access all your created quizzes

### User Management
- **Secure Authentication**: User registration and login with encrypted token-based authentication
- **Profile Management**: Personal dashboard with quiz history
- **Cross-platform Access**: Web, iOS, and Android support

### User Experience
- **Modern UI**: Dark theme with intuitive design
- **Real-time Feedback**: Instant scoring for MCQs and AI feedback for text answers
- **Copy & Share**: Easy quiz code sharing with clipboard integration
- **Responsive Design**: Optimized for all screen sizes

## Architecture

### Frontend (React Native + Expo)
```
frontend/
├── app/
│   ├── _layout.js          # Root layout component
│   ├── index.js            # Home page with quiz management
│   ├── login.js            # User authentication
│   ├── register.js         # User registration
│   └── quiz/
│       └── [code].js       # Dynamic quiz page
├── assets/                 # App icons and images
└── package.json
```

### Backend (Node.js + Express)
```
backend/
├── controllers/
│   ├── AuthCheck.js        # Token validation
│   ├── SignIn.js           # User login
│   ├── SignUp.js           # User registration
│   ├── PdfToQuiz.js        # PDF processing & AI quiz generation
│   ├── GetQuizByCode.js    # Quiz retrieval
│   ├── GetAllQuizzes.js    # User's quiz list
│   └── ValidateAnswer.js   # AI answer validation
├── models/
│   ├── UserModel.js        # User schema
│   ├── QuizModel.js        # Quiz schema
│   └── PdfContentModel.js  # PDF content cache
├── routes/                 # API route definitions
├── utils/
│   ├── hashUnhash.js       # Encryption utilities
│   └── resolveTokens.js    # Token processing
└── index.js               # Express server setup
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB database
- Google Gemini API key
- Expo CLI (for mobile development)

### Environment Variables

Create `.env` files in both frontend and backend directories:

**Backend `.env`:**
```env
MONGODB_URI=mongodb://localhost:27017/prepai
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
HASH_TOKEN=your_secure_hash_token_here
```

**Frontend `.env`:**
```env
BACKEND_URL=http://localhost:3000
```

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd PrepAI
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   npm start
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   expo start
   ```

4. **Mobile Development:**
   - Install Expo Go app on your device
   - Scan the QR code from `expo start`

## 📋 API Endpoints

### Authentication
- `POST /signup` - Create new user account
- `POST /signin` - User login
- `POST /authcheck` - Validate authentication token

### Quiz Management
- `POST /pdf-to-quiz` - Upload PDF and generate quiz
- `POST /get-quiz-by-code` - Retrieve quiz by sharing code
- `POST /get-all-quizzes` - Get user's quiz list
- `POST /validate-answer` - AI-powered answer validation

## 🛠️ Technology Stack

### Frontend Technologies
- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and build tools
- **Expo Router**: File-based routing system
- **AsyncStorage**: Local data persistence
- **Axios**: HTTP client for API requests
- **Document Picker**: PDF file selection

### Backend Technologies
- **Node.js**: Runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **Multer**: File upload handling
- **PDF-Parse**: PDF text extraction
- **Google Gemini AI**: Quiz generation and answer validation

### Security & Utilities
- **Custom Encryption**: AES-256-CBC for secure token management
- **CORS**: Cross-origin resource sharing
- **Nanoid**: Unique quiz code generation
- **Crypto**: Built-in encryption utilities

## 🎮 How to Use

1. **Create Account**: Register with email, username, and password
2. **Upload PDF**: Select any PDF document from your device
3. **Generate Quiz**: Add a title and let AI create the quiz
4. **Share Quiz**: Copy the generated code to share with others
5. **Take Quiz**: 
   - Answer multiple choice questions
   - Submit for instant scoring
   - Answer text questions for AI feedback
6. **Manage Quizzes**: View and access all your created quizzes

## 🧠 AI Integration

### Quiz Generation
- **Content Analysis**: Extracts and analyzes PDF text content
- **Question Generation**: Creates relevant MCQs and text questions
- **Smart Formatting**: Ensures consistent question structure
- **Content Optimization**: Focuses on key concepts and facts

### Answer Validation
- **Context-Aware**: Validates answers against original PDF content
- **Intelligent Feedback**: Provides constructive feedback for improvements
- **Flexible Scoring**: Recognizes multiple correct answer variations

## 🗄️ Database Schema

### User Model
```javascript
{
  email: String (unique),
  username: String,
  password: String (encrypted),
  quizIds: [ObjectId],
  createdAt: Date
}
```

### Quiz Model
```javascript
{
  pdfContentId: ObjectId,
  Title: String,
  author: ObjectId,
  quizContent: [{
    question: String,
    options: [String],
    answer: String
  }],
  textQuestions: [String],
  link_code: String (unique),
  createdAt: Date
}
```

### PDF Content Model
```javascript
{
  hashedKey: String (unique),
  content: String,
  createdAt: Date
}
```

## 🔒 Security Features

- **Token-based Authentication**: Secure user sessions with 7-day expiry
- **Password Encryption**: AES-256-CBC encryption for user passwords
- **File Validation**: PDF-only upload restrictions
- **Input Sanitization**: Protection against malicious inputs
- **CORS Protection**: Controlled cross-origin access

## 🎨 UI/UX Features

- **Dark Theme**: Modern dark interface for better user experience
- **Responsive Design**: Works seamlessly across all devices
- **Intuitive Navigation**: Simple and clean user interface
- **Real-time Feedback**: Instant visual feedback for user actions
- **Accessibility**: Designed with accessibility best practices

## 🚧 Future Enhancements

- [ ] **Multiple File Formats**: Support for DOCX, TXT, and other document types
- [ ] **Advanced Analytics**: Detailed quiz performance statistics
- [ ] **Collaborative Features**: Team quiz creation and sharing
- [ ] **Question Banks**: Reusable question libraries
- [ ] **Custom Themes**: User-customizable UI themes
- [ ] **Offline Support**: Local quiz storage and offline access
- [ ] **Social Features**: Quiz ratings and comments
- [ ] **Export Options**: PDF and Word quiz exports

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- **Google Gemini AI** for powerful quiz generation capabilities
- **Expo** for excellent cross-platform development tools
- **MongoDB** for flexible data storage solutions
- **React Native** community for extensive library support

**Made with ❤️ by Aditya Belgaonkar**
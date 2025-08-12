# AI Resume Gap Analyzer

An intelligent resume analysis tool that uses AI to compare resumes against job descriptions and provide actionable insights for improving match scores.

## 🚀 Features

- **PDF Resume Upload**: Extract text from PDF resumes automatically
- **AI-Powered Analysis**: Uses Groq's LLaMA models for intelligent resume evaluation
- **Match Scoring**: Get precise percentage match scores with detailed breakdowns
- **Gap Analysis**: Identify missing keywords and qualifications
- **ATS Optimization**: Get suggestions for improving ATS compatibility
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS

## 🏗️ Project Structure

```
ai-resume-analyzer/
├── app/              # FastAPI backend
├── frontend/         # React frontend (Vite + Tailwind)
├── .env              # Environment variables
├── README.md         # This file
└── requirements.txt  # Python dependencies
```

## 🛠️ Tech Stack

### Frontend
- **React** with Vite
- **Tailwind CSS** for styling
- **Lucide Icons** for UI elements
- **Recharts** for data visualization

### Backend
- **FastAPI** for API framework
- **PDFplumber** for PDF text extraction
- **Groq API** for AI analysis (LLaMA models)
- **Pydantic** for data validation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Groq API key ([Get one here](https://console.groq.com))

### 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/ai-resume-analyzer.git
cd ai-resume-analyzer
```

### 2. Backend Setup

```bash
cd app
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # Linux/Mac
# OR
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r ../requirements.txt

# Create .env file in root directory
cd ..
echo "GROQ_API_KEY=your_groq_api_key_here" > .env

# Start backend server
cd app
python main.py
```

Backend will run on `http://localhost:8001`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:5173`

## 📝 Usage

1. **Upload Resume**: Select a PDF resume file
2. **Add Job Description**: Paste the job posting requirements
3. **Analyze**: Click "Analyze with AI" to get insights
4. **Review Results**: Get match score, gaps, and improvement suggestions

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
GROQ_API_KEY=your_groq_api_key_here
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### API Endpoints

- `POST /analyze` - Analyze resume against job description
- `POST /extract-text` - Extract text from PDF
- `GET /health` - Health check

## 🧪 Development

### Running Tests

```bash
# Backend tests
cd app
pytest

# Frontend tests
cd frontend
npm run test
```

### Code Formatting

```bash
# Backend (Python)
cd app
black .
isort .

# Frontend (JavaScript)
cd frontend
npm run format
```

## 📦 Deployment

### Using Docker (Recommended)

```bash
docker-compose up -d
```

### Manual Deployment

1. Build frontend: `cd frontend && npm run build`
2. Deploy backend to your preferred platform (Railway, Heroku, etc.)
3. Deploy frontend to Vercel/Netlify
4. Update CORS settings in backend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- [Create an Issue](https://github.com/YOUR_USERNAME/ai-resume-analyzer/issues) for bug reports
- ⭐ Star this repo if you find it helpful!

## 🔮 Roadmap

- [ ] Batch resume analysis
- [ ] Resume template suggestions
- [ ] Integration with job boards
- [ ] Chrome extension
- [ ] Resume builder integration

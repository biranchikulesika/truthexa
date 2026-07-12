# 🛡️ Truthexa: Intelligent Regional Fake News Detection Using TF-IDF and Logistic Regression

## 📌 Overview

**Truthexa** is an AI-powered **Regional Fake News Detection System** that helps users verify the authenticity of regional news articles using **Natural Language Processing (NLP)** and **Machine Learning**.

The application transforms textual news into numerical features using **TF-IDF (Term Frequency–Inverse Document Frequency)** and classifies them with a **Logistic Regression** model. Built with **FastAPI** and a responsive web interface, Truthexa delivers fast, lightweight, and reliable predictions.

---

## 🎯 Objectives

- Detect fake and genuine regional news using Machine Learning.
- Help reduce the spread of misinformation.
- Provide fast and reliable news verification.
- Demonstrate the practical application of NLP in real-world scenarios.
- Deliver an intuitive and accessible user experience.

---

## ✨ Features

- 🔍 Regional Fake News Detection
- 🤖 Machine Learning-Based Classification
- 📊 TF-IDF Text Vectorization
- ⚡ Logistic Regression Model
- 🚀 FastAPI REST API
- 📱 Responsive Web Application (Desktop + Mobile)
- ⚡ Fast Prediction with Low Latency
- 🌐 Cloud Deployment (Vercel + Hugging Face Spaces)

---

# 🏗️ System Architecture

```text
                 User
                   │
                   ▼
        Enter News Article/Text
                   │
                   ▼
         Text Preprocessing (NLP)
                   │
                   ▼
      TF-IDF Feature Extraction
                   │
                   ▼
     Logistic Regression Model
                   │
                   ▼
      Prediction Generation
                   │
          ┌────────┴────────┐
          ▼                 ▼
      ✅ Real News      ❌ Fake News
```

---

# 🛠️ Technology Stack

### Programming Language
- Python (Backend)
- JavaScript (Frontend)

### Backend
- FastAPI
- Uvicorn

### Machine Learning
- Scikit-learn
- TF-IDF Vectorizer
- Logistic Regression

### Frontend
- HTML5
- CSS3
- JavaScript (Vanilla)

### Deployment
- **Frontend**: Vercel
- **Backend API**: Hugging Face Spaces

---

# 📂 Project Structure

```text
Truthexa/
│
├── backend/
│   ├── app.py                 # FastAPI server
│   ├── augment.py             # Data augmentation
│   ├── train_now.py           # Model training script
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── Procfile
│   ├── fake_news_model.pkl    # Trained model
│   ├── tfidf_vectorizer.pkl   # TF-IDF vectorizer
│   ├── train.csv
│   └── train_expanded.csv
│
├── frontend/
│   ├── index.html             # 🚪 Router — entry point (served by Vercel)
│   ├── style.css              # Original stylesheet (kept for reference)
│   ├── script.js              # Original script (kept for reference)
│   │
│   ├── desktop/
│   │   ├── index.html         # Desktop-optimized UI (≥768px)
│   │   ├── style.css
│   │   └── script.js
│   │
│   └── mobile/
│       ├── index.html         # Mobile-optimized UI (<768px)
│       ├── style.css
│       └── script.js
│
├── notebook.ipynb
├── README.md
└── .gitignore
```

---

# 🌐 Frontend Routing: How Desktop & Mobile Versions Are Served

Truthexa uses a **client-side router** strategy (no build tools needed) to serve separate optimized UIs for desktop and mobile.

### How it works

1. **Entry point**: `frontend/index.html` is the only page Vercel serves.
2. **On page load**, the router detects the viewport width:
   - **> 768px** → loads the **desktop** version (`desktop/index.html`, `desktop/style.css`, `desktop/script.js`)
   - **≤ 768px** → loads the **mobile** version (`mobile/index.html`, `mobile/style.css`, `mobile/script.js`)
3. Each version is fully self-contained — its HTML, CSS, and JS are fetched dynamically and injected into the page.
4. **On resize** that crosses the 768px breakpoint, the page automatically reloads to switch versions.
5. **Session storage** prevents infinite reload loops during rapid resizing.

### Why two separate versions?

Instead of a single responsive page that hides/shows elements with CSS `@media` queries, Truthexa serves **completely separate HTML, CSS, and JS** per viewport. This means:
- No unused desktop code is downloaded on mobile (and vice versa)
- Each version can have its own layout, interactions, and UX paradigm
- Desktop uses a workspace grid with a gauge UI; mobile uses a chat-bubble interface

### Required for Vercel

No special configuration is needed. Vercel automatically:
- Serves `frontend/index.html` as the root page
- Treats the `desktop/` and `mobile/` directories as static assets accessible via `/desktop/...` and `/mobile/...`

---

# ☁️ Deployment Architecture

```text
              User
                │
                ▼
      Vercel Frontend (index.html)
        │              │
    ┌────┴────┐   ┌────┴────┐
    │ Desktop │   │  Mobile │
    │ (≥768px)│   │ (<768px)│
    └────┬────┘   └────┬────┘
         │             │
         └──────┬──────┘
                │
        Sends API Request
                │
                ▼
    Hugging Face Spaces
      (FastAPI Backend)
                │
                ▼
      TF-IDF + Logistic Regression
                │
                ▼
        Prediction Response
                │
                ▼
      Display Result to User
```

The frontend communicates with the backend API via `POST /analyze`. The API URL is determined automatically:
- **Local development** → `http://localhost:8000`
- **Production** → `https://sruti2006-fake-news-detector-api.hf.space`

You can change the API URL in `frontend/desktop/script.js` and `frontend/mobile/script.js` by modifying the `BASE_URL` constant at the top of each file.

---

# ⚙️ Local Development Setup

### Prerequisites
- Python 3.10+
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/Truthexa.git
cd Truthexa
```

### 2. Backend Setup

```bash
# Install dependencies
pip install -r backend/requirements.txt

# Start the FastAPI server
uvicorn backend.app:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

### 3. Frontend Setup

The frontend is pure HTML/CSS/JS — no build tools needed. Simply open `frontend/index.html` in your browser:

```bash
# Option A: Open directly
open frontend/index.html

# Option B: Serve with Python (for proper fetch behavior)
cd frontend
python -m http.server 3000
```

Then visit `http://localhost:3000` in your browser.

> **Note**: When opened as a local file (`file://` protocol), `fetch()` may be blocked by CORS. Use a local HTTP server (Option B) for testing.

### 4. Verify It Works

1. Type or paste Odia news content in the input area
2. Click "Analyze" (desktop) or the send button (mobile)
3. View the REAL/FAKE prediction with confidence score

---

# 🚀 Deploying to Vercel (Frontend)

### Option A: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from the frontend directory
cd frontend
vercel --prod
```

### Option B: Vercel Dashboard (Git)

1. Push the repository to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Set the **Root Directory** to `frontend`
4. Leave all other settings as default — Vercel will detect the static HTML
5. Click **Deploy**

### Configuring the API URL

After deployment, the frontend will automatically detect whether it's running locally or in production and use the correct backend API URL. If you need to change the backend URL:

- Edit `frontend/desktop/script.js` → change the `BASE_URL` constant
- Edit `frontend/mobile/script.js` → change the `BASE_URL` constant

The URL detection logic:

```javascript
const BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? window.location.origin
    : "https://sruti2006-fake-news-detector-api.hf.space";
```

---

# 🧠 Machine Learning Workflow

```text
Dataset Collection
        │
        ▼
Data Cleaning & Preprocessing
        │
        ▼
TF-IDF Vectorization
        │
        ▼
Model Training
(Logistic Regression)
        │
        ▼
Model Evaluation
        │
        ▼
Prediction
```

---

# 📊 Model Details

```text
Domain        : Regional Fake News Detection
Problem       : Binary Text Classification
Input         : News Article / News Headline
Preprocessing : Text Cleaning & Tokenization
Feature Extr. : TF-IDF Vectorization
Algorithm     : Logistic Regression
Backend       : FastAPI
Frontend      : HTML • CSS • JavaScript
Deployment    : Frontend → Vercel | Backend → Hugging Face Spaces
Output        : ✅ Real News | ❌ Fake News
```

---

# 🚀 Future Enhancements

- 🌍 Support for additional regional languages
- 🤖 Transformer-based models (BERT/RoBERTa)
- 📈 Improved model accuracy
- 📊 Explainable AI predictions
- 🔄 Real-time news verification
- 🧩 Browser extension

---

# 🤝 Contributing

Contributions are welcome!

If you have ideas for improvements, feel free to fork the repository, create a feature branch, and submit a pull request.
# 🛡️ Truthexa: Intelligent Regional Fake News Detection Using TF-IDF and Logistic Regression

## 📌 Overview

**Truthexa** is an AI-powered **Regional Fake News Detection System** that helps users verify the authenticity of regional news articles using **Natural Language Processing (NLP)** and **Machine Learning**.

The application transforms textual news into numerical features using **TF-IDF (Term Frequency–Inverse Document Frequency)** and classifies them with a **Logistic Regression** model. Built with **FastAPI** and a responsive web interface, Truthexa delivers fast, lightweight, and reliable predictions. The project also includes a browser extension for convenient news verification.

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
- 💻 Responsive Web Application
- 🧩 Browser Extension Support
- ⚡ Fast Prediction with Low Latency
- 🌐 Cloud Deployment

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
- Python

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
- JavaScript

### Deployment
- Hugging Face Spaces (Backend API)
- Vercel (Frontend)

### Tools
- Git
- GitHub
- Visual Studio Code

---

# ☁️ Deployment Architecture

```text
              User
                │
                ▼
      Vercel Frontend
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

---

# 📂 Project Structure

```text
Truthexa/
│
├── backend/
│   ├── app.py
│   ├── augment.py
│   ├── train_now.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── Procfile
│   ├── fake_news_model.pkl
│   ├── tfidf_vectorizer.pkl
│   ├── train.csv
│   ├── train_expanded.csv
│   └── venv311/
│
├── frontend/
│   ├── index.html
│   └── extension/
│       ├── manifest.json
│       ├── popup.html
│       ├── popup.js
│       └── background.js
│
├── notebook.ipynb
├── README.md
└── .gitignore
```

---

# ⚙️ Installation

### Clone the Repository

```bash
git clone https://github.com/your-username/Truthexa.git
```

### Navigate to the Project Directory

```bash
cd Truthexa
```

### Install Dependencies

```bash
pip install -r backend/requirements.txt
```

### Run the FastAPI Server

```bash
uvicorn backend.app:app --reload
```

Open your browser and visit the local development URL displayed by Uvicorn.

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
Domain
│
└──► Regional Fake News Detection

Problem
│
└──► Binary Text Classification

Input
│
└──► News Article / News Headline

Preprocessing
│
└──► Text Cleaning & Tokenization

Feature Extraction
│
└──► TF-IDF Vectorization

Machine Learning Algorithm
│
└──► Logistic Regression

Backend Framework
│
└──► FastAPI

Frontend
│
└──► HTML • CSS • JavaScript

Deployment
│
├──► Frontend → Vercel
└──► Backend → Hugging Face Spaces

Output
│
├──► ✅ Real News
└──► ❌ Fake News
```

---

# 🚀 Future Enhancements

- 🌍 Support for additional regional languages
- 🤖 Transformer-based models (BERT/RoBERTa)
- 📈 Improved model accuracy
- 📊 Explainable AI predictions
- ☁️ Scalable cloud deployment
- 📱 Mobile application
- 🔄 Real-time news verification

---

# 🤝 Contributing

Contributions are welcome!

If you have ideas for improvements, feel free to fork the repository, create a feature branch, and submit a pull request.

---

## 👩‍💻 Author

**Sruti Swarupa Mahapatra**

## 🤝 Acknowledgements

This project was developed as part of a college group project. Thanks to my teammates for their contributions during the project.

---

# 📜 License

This project is developed for **educational, research, and learning purposes**.

---

## ⭐ Support

If you found this project useful, consider giving it a **⭐ Star** on GitHub. Your support is greatly appreciated!
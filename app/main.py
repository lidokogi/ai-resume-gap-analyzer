from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import pdfplumber
import re
import os
from dotenv import load_dotenv
from typing import Dict, Any
import uvicorn

load_dotenv()

app = FastAPI(title="Resume Gap Analyzer API", version="1.0.0")

# Add CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

groq_api_key = os.getenv("GROQ_API_KEY")

class JobDescriptionRequest(BaseModel):
    job_description: str

class AnalysisResponse(BaseModel):
    match_percentage: int
    overall_assessment: str
    ai_full_analysis: str
    error: str = None

def extract_text_from_pdf(pdf_file) -> str:
    """Extract text from uploaded PDF file"""
    text = ""
    try:
        with pdfplumber.open(pdf_file) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error extracting PDF: {str(e)}")

def analyze_resume_with_groq(resume_text: str, job_description: str, groq_token: str) -> Dict[str, Any]:
    """AI analysis using Groq's models"""
    
    API_URL = "https://api.groq.com/openai/v1/chat/completions"
    
    models_to_try = ["llama3-8b-8192", "llama3-70b-8192"]
    
    system_prompt = """You are an expert ATS recruiter and career coach with 10+ years of experience. Your job is to analyze resumes against job requirements with laser precision, focusing on what actually gets candidates past initial screening."""
    
    user_prompt = f"""Analyze this resume against the job requirements with brutal honesty:

RESUME CONTENT:
{resume_text[:4000]}

JOB REQUIREMENTS:
{job_description[:2500]}

ANALYSIS FRAMEWORK - Provide exactly this format:

**MATCH SCORE: X%** (Be precise - 0-100%)

**MATCHING QUALIFICATIONS:**
- [List 5-8 specific skills/experiences that directly match]
- [Be specific about WHERE in resume you found this]

**CRITICAL GAPS:**
- [List 3-6 requirements the candidate clearly lacks]  
- [Focus on dealbreakers that would get resume rejected]

**EXPERIENCE LEVEL FIT:**
[Analyze if candidate's seniority matches job level - junior/mid/senior]

**ATS OPTIMIZATION ISSUES:**
- [Keywords missing that ATS would scan for]
- [Formatting/structure issues that hurt ATS parsing]

**IMMEDIATE ACTIONS TO IMPROVE MATCH:**
1. [Most critical change needed]
2. [Second priority improvement]  
3. [Third priority improvement]

**LIKELIHOOD ASSESSMENT:**
[Would this resume make it past initial screening? Why/why not?]

Be brutally honest and specific. Reference exact phrases from both documents. Focus on what recruiters and ATS systems actually look for."""

    headers = {
        "Authorization": f"Bearer {groq_token}",
        "Content-Type": "application/json"
    }

    for model in models_to_try:
        try:
            payload = {
                "model": model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.2,
                "max_tokens": 1500,
                "top_p": 0.9
            }
            
            response = requests.post(API_URL, headers=headers, json=payload, timeout=60)
            
            if response.status_code == 200:
                result = response.json()
                ai_analysis = result["choices"][0]["message"]["content"]
                
                if len(ai_analysis) > 100:
                    return parse_ai_analysis(ai_analysis)
                        
            elif response.status_code == 401:
                return {"error": "Invalid API token"}
                
        except Exception as e:
            continue
    
    return {"error": "All models failed"}

def parse_ai_analysis(ai_text: str) -> Dict[str, Any]:
    """Parse the AI analysis response"""
    
    # Extract match percentage
    match_percentage = 50  # default
    percentage_match = re.search(r'MATCH SCORE:\s*(\d{1,3})%', ai_text, re.IGNORECASE)
    if percentage_match:
        match_percentage = int(percentage_match.group(1))
    
    # Overall assessment based on percentage
    if match_percentage >= 80:
        assessment = "Excellent match - likely to pass initial screening"
    elif match_percentage >= 65:
        assessment = "Strong candidate with minor gaps to address"
    elif match_percentage >= 50:
        assessment = "Moderate fit - several improvements needed"
    else:
        assessment = "Significant gaps - major revisions recommended"
    
    return {
        "match_percentage": match_percentage,
        "overall_assessment": assessment,
        "ai_full_analysis": ai_text
    }

@app.get("/")
async def root():
    return {"message": "Resume Gap Analyzer API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_resume(
    resume_file: UploadFile = File(...),
    job_description: str = Form(...)
):
    """
    Analyze resume against job description
    """
    
    # Validate file type
    if resume_file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    # Validate API key
    if not groq_api_key:
        raise HTTPException(status_code=500, detail="Groq API key not configured")
    
    # Extract text from PDF
    try:
        resume_text = extract_text_from_pdf(resume_file.file)
        if not resume_text:
            raise HTTPException(status_code=400, detail="No text could be extracted from PDF")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Validate inputs
    if len(resume_text) < 50:
        raise HTTPException(status_code=400, detail="Resume text too short")
    
    if len(job_description) < 50:
        raise HTTPException(status_code=400, detail="Job description too short")
    
    # Analyze with Groq
    try:
        analysis = analyze_resume_with_groq(resume_text, job_description, groq_api_key)
        
        if "error" in analysis:
            raise HTTPException(status_code=500, detail=analysis["error"])
        
        return AnalysisResponse(**analysis)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/extract-text")
async def extract_text(resume_file: UploadFile = File(...)):
    """
    Extract text from PDF for preview
    """
    if resume_file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    try:
        text = extract_text_from_pdf(resume_file.file)
        word_count = len(text.split())
        char_count = len(text)
        
        return {
            "text": text,
            "preview": text[:1000] + ("..." if len(text) > 1000 else ""),
            "stats": {
                "characters": char_count,
                "words": word_count,
                "lines": len(text.split('\n'))
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)
// API configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.com' 
  : 'http://localhost:8001';

class ResumeAnalyzerAPI {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async analyzeResume(pdfFile, jobDescription) {
    const formData = new FormData();
    formData.append('resume_file', pdfFile);
    formData.append('job_description', jobDescription);

    try {
      const response = await fetch(`${this.baseUrl}/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Analysis failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing resume:', error);
      throw error;
    }
  }

  async extractText(pdfFile) {
    const formData = new FormData();
    formData.append('resume_file', pdfFile);

    try {
      const response = await fetch(`${this.baseUrl}/extract-text`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Text extraction failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error extracting text:', error);
      throw error;
    }
  }

  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'unhealthy' };
    }
  }
}

export default ResumeAnalyzerAPI;
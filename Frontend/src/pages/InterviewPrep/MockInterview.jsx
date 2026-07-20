import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';
import './MockInterview.css';

const MockInterview = ({ onExit }) => {
  const [step, setStep] = useState('interviewing'); // interviewing, feedback
  const [stream, setStream] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // Auto-start media on mount
  useEffect(() => {
    startMedia();
    return () => stopMedia();
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript(finalTranscript || interimTranscript);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startMedia = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStep('interviewing');
      startInterview();
    } catch (err) {
      console.error("Media error:", err);
      alert("Please allow camera and microphone access to start the mock interview.");
    }
  };

  const stopMedia = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const speak = (text) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    // Ensure voices are loaded
    const voices = synthRef.current.getVoices();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Prefer a professional-sounding male/female voice if available
    const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Premium')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.rate = 0.95; // Slightly slower for clarity
    utterance.pitch = 1.0;

    utterance.onend = () => {
      if (step === 'interviewing') {
        setIsListening(true);
        try {
          recognitionRef.current?.start();
        } catch (e) {
          console.warn("Recognition already started or failed:", e);
        }
      }
    };

    utterance.onerror = (e) => {
      console.error("Speech synthesis error:", e);
      // Fallback: still start listening even if speech fails
      setIsListening(true);
      recognitionRef.current?.start();
    };

    synthRef.current.speak(utterance);
  };

  const startInterview = async () => {
    setIsProcessing(true);
    const initialPrompt = `You are a Senior Technical Recruiter at a Fortune 500 company. 
    Conduct a professional mock interview for a Software Developer position. 
    Rules: 
    1. Be rigorous but encouraging. 
    2. Ask one question at a time. 
    3. Listen to the user's answer and ask relevant follow-up questions. 
    4. Start by introducing yourself and asking the user to introduce themselves.`;

    try {
      const res = await axios.post(`${API_BASE_URL}/chat`, {
        message: initialPrompt,
        chatHistory: []
      });
      
      const firstMsg = res.data.reply;
      setCurrentQuestion(firstMsg);
      setChatHistory([{ role: 'user', parts: [{ text: 'Start interview' }] }, { role: 'model', parts: [{ text: firstMsg }] }]);
      speak(firstMsg);
    } catch (err) {
      console.error("Chat error:", err);
      const errorMsg = err.response?.data?.details?.includes("leaked") 
        ? "AI Error: Your Gemini API key has been leaked and disabled. Please update 'GEMINI_API_KEY' in 'Backend/.env' with a new key from Google AI Studio."
        : "AI Error: Could not connect to the interviewer. Please verify your Backend is running and API key is valid.";
      setCurrentQuestion(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNext = async () => {
    if (!transcript && !isProcessing) return;
    
    recognitionRef.current?.stop();
    setIsListening(false);
    setIsProcessing(true);

    const userMsg = transcript || "(User stayed silent)";
    const updatedHistory = [...chatHistory, { role: 'user', parts: [{ text: userMsg }] }];
    
    const contextPrompt = `${userMsg} \n\n(AI: Continue the interview as a Senior Recruiter. 
    If you've asked 5-6 questions, provide a detailed performance critique including 'Strengths' and 'Areas for Improvement', then end with the exact keyword: FINISHED_INTERVIEW)`;

    try {
      const res = await axios.post("http://localhost:5000/api/chat", {
        message: contextPrompt,
        chatHistory: updatedHistory
      });

      const aiReply = res.data.reply;
      
      if (aiReply.includes('FINISHED_INTERVIEW')) {
        setFeedback(aiReply.replace('FINISHED_INTERVIEW', ''));
        setStep('feedback');
        stopMedia();
      } else {
        setCurrentQuestion(aiReply);
        setChatHistory([...updatedHistory, { role: 'model', parts: [{ text: aiReply }] }]);
        setTranscript('');
        speak(aiReply);
      }
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mock-interview-overlay">
      <div className="mock-interview-window">
        <header className="mock-header">
          <div className="status-badge">
            <span className={`dot active`}></span>
            {step === 'interviewing' ? 'Live Interview' : 'Evaluation'}
          </div>
          <button className="exit-btn" onClick={() => { stopMedia(); onExit(); }}>
            <i className="fas fa-times"></i>
          </button>
        </header>

        {step === 'interviewing' && (
          <div className="interview-view">
            <div className="video-grid">
              <div className="video-card ai-view">
                <div className="ai-placeholder">
                  <div className="pulse-circle"></div>
                  <i className="fas fa-robot"></i>
                  <span>AI Interviewer</span>
                </div>
                <div className="ai-caption">
                  {isProcessing ? 'Thinking...' : currentQuestion}
                </div>
              </div>
              <div className="video-card user-view">
                <video ref={videoRef} autoPlay muted playsInline />
                <div className="user-label">You</div>
                {isListening && (
                  <div className="voice-indicator">
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                  </div>
                )}
              </div>
            </div>

            <div className="transcript-area">
              <p className="transcript-text">
                {transcript || (isListening ? "Listening..." : "Waiting for AI...")}
              </p>
              <button 
                className={`next-step-btn ${!transcript || isProcessing ? 'disabled' : ''}`}
                onClick={handleNext}
                disabled={!transcript || isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Submit Answer'} <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        )}

        {step === 'feedback' && (
          <div className="feedback-view">
            <h2>Interview Performance</h2>
            <div className="feedback-content">
              {feedback}
            </div>
            <button className="primary-btn" onClick={onExit}>Back to Dashboard</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockInterview;

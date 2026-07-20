
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your CareerIQ Assistant. How can I help you with your career today?", sender: 'bot' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMsg = { text: message, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setMessage('');
    setIsTyping(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/chat`, { message });
      
      if (response.data.success) {
        setMessages(prev => [...prev, { text: response.data.reply, sender: 'bot' }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
      
      const errorMsg = "I'm having a little trouble connecting to my local database. Please try again in a moment!";
      
      setMessages(prev => [...prev, { 
        text: errorMsg, 
        sender: 'bot',
        isError: true 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
      {/* Floating Button */}
      <button className="chat-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <i className="fas fa-times"></i> : <i className="fas fa-comment-dots"></i>}
        {!isOpen && <span className="chat-badge">AI</span>}
      </button>

      {/* Chat Window */}
      <div className="chat-window">
        <div className="chat-header">
          <div className="bot-info">
            <div className="bot-avatar">
              <i className="fas fa-robot"></i>
              <span className="online-indicator"></span>
            </div>
            <div>
              <h3>CareerIQ Assistant</h3>
              <p>Online | AI Powered</p>
            </div>
          </div>
          <button className="close-btn" onClick={() => setIsOpen(false)}>
            <i className="fas fa-minus"></i>
          </button>
        </div>

        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message-wrapper ${msg.sender}`}>
              <div className="message-content">
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="message-wrapper bot">
              <div className="message-content typing">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-area" onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Ask me anything about your career..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button type="submit" disabled={!message.trim() || isTyping}>
            <i className="fas fa-paper-plane"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;

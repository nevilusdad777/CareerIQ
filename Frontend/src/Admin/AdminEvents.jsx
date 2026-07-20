import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminEvents.css';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    type: 'meeting',
    location: '',
    isVirtual: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchGlobalEvents();
  }, []);

  const fetchGlobalEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/events/admin/global');
      if (response.data.success) {
        setEvents(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching global events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      
      const eventPayload = {
        title: formData.title,
        description: formData.description,
        date: dateTime.toISOString(),
        type: formData.type,
        location: formData.location,
        isVirtual: formData.isVirtual,
        isGlobal: true
      };

      const response = await axios.post('http://localhost:5000/api/events/admin/global', eventPayload);
      
      if (response.data.success) {
        setFormData({
          title: '',
          description: '',
          date: '',
          time: '',
          type: 'meeting',
          location: '',
          isVirtual: false
        });
        fetchGlobalEvents(); 
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this global event?')) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:5000/api/events/admin/global/${eventId}`);
      if (response.data.success) {
        fetchGlobalEvents();
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  return (
    <div className="admin-content-container">
      <div className="page-header">
        <div>
          <h1>Global Events Management</h1>
          <p>Create and broadcast events to all user dashboards</p>
        </div>
      </div>

      <div className="events-content-grid">
        {/* Create Event Form */}
        <div className="admin-card create-event-card">
          <h2>Create New Global Event</h2>
          <form onSubmit={handleSubmit} className="event-form">
            <div className="form-group">
              <label>Event Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. Resume Building Workshop" required />
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label>Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
              </div>
              <div className="form-group half">
                <label>Time</label>
                <input type="time" name="time" value={formData.time} onChange={handleInputChange} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label>Type</label>
                <select name="type" value={formData.type} onChange={handleInputChange}>
                  <option value="workshop">Workshop</option>
                  <option value="seminar">Seminar</option>
                  <option value="interview">Mock Interview</option>
                  <option value="deadline">Important Deadline</option>
                  <option value="meeting">General Meeting</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group half">
                <label>Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="Room 101 or Zoom Link" />
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input type="checkbox" name="isVirtual" checked={formData.isVirtual} onChange={handleInputChange} />
                This is a virtual event
              </label>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Provide event details here..." rows="3" required></textarea>
            </div>

            <button type="submit" className="primary-btn submit-btn" disabled={isSubmitting}>
              {isSubmitting ? <><i className="fas fa-spinner fa-spin"></i> Creating...</> : <><i className="fas fa-plus-circle"></i> Broadcast Global Event</>}
            </button>
          </form>
        </div>

        {/* Existing Events List */}
        <div className="admin-card existing-events-card">
          <h2>Active Global Events ({events.length})</h2>
          
          <div className="global-events-list">
            {loading ? (
              <div className="loading-state">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading events...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-calendar-times"></i>
                <p>No global events currently active.</p>
              </div>
            ) : (
              events.map(event => {
                const eventDate = new Date(event.date);
                const isPast = eventDate < new Date();
                
                return (
                  <div key={event._id} className={`global-event-item ${isPast ? 'past-event' : ''}`}>
                    <div className={`event-type-badge type-${event.type}`}>
                      {event.type}
                    </div>
                    <div className="event-main-content">
                      <h3>{event.title}</h3>
                      <p className="event-desc">{event.description}</p>
                      
                      <div className="event-meta">
                        <span className="meta-item">
                          <i className="fas fa-calendar"></i> 
                          {eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="meta-item">
                          <i className="fas fa-clock"></i> 
                          {eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <button className="delete-btn" onClick={() => handleDelete(event._id)} title="Delete">
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEvents;

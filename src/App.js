/**
 * Court Case Reminder App for Vakils (Lawyers)
 * 
 * This app helps lawyers manage their court cases with:
 * - Case tracking and management
 * - Hearing date reminders
 * - Persistent storage using localStorage
 * 
 * localStorage Explanation:
 * localStorage is a browser API that stores data locally on the user's device.
 * Data persists even after closing the browser/app.
 * - setItem(key, value): Saves data (value must be a string)
 * - getItem(key): Retrieves data
 * - removeItem(key): Deletes data
 * - clear(): Clears all data
 * 
 * We use JSON.stringify() to convert objects to strings for storage,
 * and JSON.parse() to convert them back to objects when retrieving.
 */

import React, { useState, useEffect } from 'react';
import './styles.css';

/**
 * Main App Component
 * Manages all case data and localStorage synchronization
 */
function App() {
  // State to store all cases
  const [cases, setCases] = useState([]);
  
  // State for form inputs (Add New Case)
  const [formData, setFormData] = useState({
    caseNumber: '',
    courtName: '',
    caseType: 'Civil',
    clientName: '',
    opponentName: '',
    hearingDate: '',
    caseStatus: 'Pending',
    notes: ''
  });
  
  // State for search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourt, setFilterCourt] = useState('');
  const [filterCaseType, setFilterCaseType] = useState('');
  
  // State to control form visibility
  const [showForm, setShowForm] = useState(false);
  
  // State to control which section is active
  const [activeSection, setActiveSection] = useState('dashboard'); // 'dashboard' or 'reminders'
  
  // Flag to track if initial load is complete
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  /**
   * Load cases from localStorage when component mounts
   * useEffect with empty dependency array runs only once on mount
   */
  useEffect(() => {
    loadCasesFromStorage();
    setIsInitialLoad(false);
  }, []);

  /**
   * Save cases to localStorage whenever cases state changes
   * This ensures data persistence on every update
   * Skip saving on initial load to prevent overwriting existing data
   */
  useEffect(() => {
    // Only save if initial load is complete (prevents overwriting on mount)
    if (!isInitialLoad) {
      saveCasesToStorage();
    }
  }, [cases, isInitialLoad]);

  /**
   * Load cases from localStorage
   * localStorage.getItem() retrieves the stored string
   * JSON.parse() converts the string back to an array
   */
  const loadCasesFromStorage = () => {
    try {
      const storedCases = localStorage.getItem('courtCases');
      if (storedCases) {
        const parsedCases = JSON.parse(storedCases);
        setCases(parsedCases);
      }
    } catch (error) {
      console.error('Error loading cases from localStorage:', error);
    }
  };

  /**
   * Save cases to localStorage
   * JSON.stringify() converts the array to a string for storage
   * localStorage.setItem() saves the string with key 'courtCases'
   */
  const saveCasesToStorage = () => {
    try {
      localStorage.setItem('courtCases', JSON.stringify(cases));
    } catch (error) {
      console.error('Error saving cases to localStorage:', error);
    }
  };

  /**
   * Handle form input changes
   * Updates formData state as user types
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Handle form submission
   * Creates a new case and adds it to the cases array
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.caseNumber || !formData.courtName || !formData.clientName || !formData.hearingDate) {
      alert('Please fill in all required fields (Case Number, Court Name, Client Name, Hearing Date)');
      return;
    }

    // Create new case object with unique ID
    const newCase = {
      id: Date.now(), // Simple ID generation using timestamp
      ...formData,
      createdAt: new Date().toISOString()
    };

    // Add new case to the array
    setCases(prev => [...prev, newCase]);

    // Reset form
    setFormData({
      caseNumber: '',
      courtName: '',
      caseType: 'Civil',
      clientName: '',
      opponentName: '',
      hearingDate: '',
      caseStatus: 'Pending',
      notes: ''
    });

    // Hide form after submission
    setShowForm(false);
    
    alert('Case added successfully!');
  };

  /**
   * Move hearing date to next month
   * Updates case status to "Adjourned"
   * Generates reminder message
   */
  const moveToNextHearing = (caseId) => {
    setCases(prev => prev.map(caseItem => {
      if (caseItem.id === caseId) {
        // Get current hearing date
        const currentDate = new Date(caseItem.hearingDate);
        
        // Add one month
        const nextDate = new Date(currentDate);
        nextDate.setMonth(nextDate.getMonth() + 1);
        
        // Format date as YYYY-MM-DD for input field
        const formattedDate = nextDate.toISOString().split('T')[0];
        
        return {
          ...caseItem,
          hearingDate: formattedDate,
          caseStatus: 'Adjourned'
        };
      }
      return caseItem;
    }));
    
    alert('Hearing date moved to next month. Status updated to Adjourned.');
  };

  /**
   * Delete a case
   */
  const deleteCase = (caseId) => {
    if (window.confirm('Are you sure you want to delete this case?')) {
      setCases(prev => prev.filter(caseItem => caseItem.id !== caseId));
    }
  };

  /**
   * Get upcoming hearings sorted by date
   * Filters cases with future hearing dates and sorts them
   */
  const getUpcomingHearings = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return cases
      .filter(caseItem => {
        const hearingDate = new Date(caseItem.hearingDate);
        hearingDate.setHours(0, 0, 0, 0);
        return hearingDate >= today;
      })
      .sort((a, b) => {
        return new Date(a.hearingDate) - new Date(b.hearingDate);
      });
  };

  /**
   * Check if hearing is within next 7 days
   * Used for highlighting urgent cases
   */
  const isWithin7Days = (hearingDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const hearing = new Date(hearingDate);
    hearing.setHours(0, 0, 0, 0);
    
    const diffTime = hearing - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 && diffDays <= 7;
  };

  /**
   * Filter cases based on search term and filters
   */
  const getFilteredCases = () => {
    return cases.filter(caseItem => {
      // Search filter (case number or client name)
      const matchesSearch = searchTerm === '' || 
        caseItem.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseItem.clientName.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Court filter
      const matchesCourt = filterCourt === '' || caseItem.courtName === filterCourt;
      
      // Case type filter
      const matchesCaseType = filterCaseType === '' || caseItem.caseType === filterCaseType;
      
      return matchesSearch && matchesCourt && matchesCaseType;
    });
  };

  /**
   * Get unique list of courts for filter dropdown
   */
  const getUniqueCourts = () => {
    const courts = cases.map(caseItem => caseItem.courtName);
    return [...new Set(courts)].sort();
  };

  // Get filtered cases
  const filteredCases = getFilteredCases();
  
  // Get upcoming hearings
  const upcomingHearings = getUpcomingHearings();

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1>⚖️ Court Case Reminder</h1>
        <p className="subtitle">Vakil Case Management System</p>
      </header>

      {/* Navigation Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeSection === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveSection('dashboard')}
        >
          📋 Dashboard
        </button>
        <button 
          className={`tab ${activeSection === 'reminders' ? 'active' : ''}`}
          onClick={() => setActiveSection('reminders')}
        >
          🔔 Reminders ({upcomingHearings.length})
        </button>
      </div>

      {/* Dashboard Section */}
      {activeSection === 'dashboard' && (
        <div className="dashboard-section">
          {/* Search and Filter Controls */}
          <div className="controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="🔍 Search by Case Number or Client Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filters">
              <select
                value={filterCourt}
                onChange={(e) => setFilterCourt(e.target.value)}
                className="filter-select"
              >
                <option value="">All Courts</option>
                {getUniqueCourts().map(court => (
                  <option key={court} value={court}>{court}</option>
                ))}
              </select>
              
              <select
                value={filterCaseType}
                onChange={(e) => setFilterCaseType(e.target.value)}
                className="filter-select"
              >
                <option value="">All Case Types</option>
                <option value="Civil">Civil</option>
                <option value="Criminal">Criminal</option>
                <option value="Family">Family</option>
                <option value="Property">Property</option>
              </select>
            </div>
          </div>

          {/* Add New Case Button */}
          <button 
            className="btn btn-primary add-case-btn"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '❌ Cancel' : '➕ Add New Case'}
          </button>

          {/* Add Case Form */}
          {showForm && (
            <div className="form-container">
              <h2>Add New Case</h2>
              <form onSubmit={handleSubmit} className="case-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Case Number *</label>
                    <input
                      type="text"
                      name="caseNumber"
                      value={formData.caseNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Court Name *</label>
                    <input
                      type="text"
                      name="courtName"
                      value={formData.courtName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Case Type *</label>
                    <select
                      name="caseType"
                      value={formData.caseType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Civil">Civil</option>
                      <option value="Criminal">Criminal</option>
                      <option value="Family">Family</option>
                      <option value="Property">Property</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Current Hearing Date *</label>
                    <input
                      type="date"
                      name="hearingDate"
                      value={formData.hearingDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Client Name *</label>
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Opponent Name</label>
                    <input
                      type="text"
                      name="opponentName"
                      value={formData.opponentName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Case Status *</label>
                    <select
                      name="caseStatus"
                      value={formData.caseStatus}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Pending">Pending</option>
                      <option value="Adjourned">Adjourned</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Notes / Arguments</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Add case notes, arguments, or important details..."
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary">💾 Save Case</button>
              </form>
            </div>
          )}

          {/* Cases Table */}
          <div className="cases-table-container">
            <h2>All Cases ({filteredCases.length})</h2>
            
            {filteredCases.length === 0 ? (
              <div className="empty-state">
                <p>No cases found. Add a new case to get started!</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="cases-table">
                  <thead>
                    <tr>
                      <th>Case #</th>
                      <th>Court</th>
                      <th>Type</th>
                      <th>Client</th>
                      <th>Opponent</th>
                      <th>Hearing Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCases.map(caseItem => (
                      <tr key={caseItem.id}>
                        <td className="case-number">{caseItem.caseNumber}</td>
                        <td>{caseItem.courtName}</td>
                        <td>
                          <span className={`case-type-badge ${caseItem.caseType.toLowerCase()}`}>
                            {caseItem.caseType}
                          </span>
                        </td>
                        <td>{caseItem.clientName}</td>
                        <td>{caseItem.opponentName || '-'}</td>
                        <td className="hearing-date">
                          {new Date(caseItem.hearingDate).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td>
                          <span className={`status-badge ${caseItem.caseStatus.toLowerCase()}`}>
                            {caseItem.caseStatus}
                          </span>
                        </td>
                        <td className="actions">
                          <button
                            className="btn btn-small btn-secondary"
                            onClick={() => moveToNextHearing(caseItem.id)}
                            title="Move to Next Month"
                          >
                            ⏭️ Next
                          </button>
                          <button
                            className="btn btn-small btn-danger"
                            onClick={() => deleteCase(caseItem.id)}
                            title="Delete Case"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reminders Section */}
      {activeSection === 'reminders' && (
        <div className="reminders-section">
          <h2>Upcoming Hearings</h2>
          
          {upcomingHearings.length === 0 ? (
            <div className="empty-state">
              <p>No upcoming hearings scheduled.</p>
            </div>
          ) : (
            <div className="reminders-list">
              {upcomingHearings.map(caseItem => {
                const isUrgent = isWithin7Days(caseItem.hearingDate);
                const hearingDate = new Date(caseItem.hearingDate);
                const today = new Date();
                const diffTime = hearingDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                return (
                  <div 
                    key={caseItem.id} 
                    className={`reminder-card ${isUrgent ? 'urgent' : ''}`}
                  >
                    <div className="reminder-header">
                      <h3>{caseItem.caseNumber}</h3>
                      {isUrgent && <span className="urgent-badge">⚠️ URGENT</span>}
                    </div>
                    
                    <div className="reminder-details">
                      <p><strong>Court:</strong> {caseItem.courtName}</p>
                      <p><strong>Client:</strong> {caseItem.clientName}</p>
                      <p><strong>Type:</strong> {caseItem.caseType}</p>
                      <p><strong>Status:</strong> {caseItem.caseStatus}</p>
                      
                      <div className="hearing-info">
                        <p className="hearing-date-large">
                          📅 {hearingDate.toLocaleDateString('en-IN', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                        <p className="days-remaining">
                          {diffDays === 0 ? 'Today!' : 
                           diffDays === 1 ? 'Tomorrow' : 
                           `${diffDays} days remaining`}
                        </p>
                      </div>
                      
                      {caseItem.notes && (
                        <div className="reminder-notes">
                          <strong>Notes:</strong> {caseItem.notes}
                        </div>
                      )}
                    </div>
                    
                    <div className="reminder-actions">
                      <button
                        className="btn btn-small btn-secondary"
                        onClick={() => {
                          moveToNextHearing(caseItem.id);
                          setActiveSection('dashboard');
                        }}
                      >
                        ⏭️ Move to Next Month
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <p>Data stored locally on your device • All cases saved automatically</p>
      </footer>
    </div>
  );
}

export default App;

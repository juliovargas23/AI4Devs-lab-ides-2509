import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CandidateList from './components/CandidateList';
import AddCandidateForm from './components/AddCandidateForm';
import './App.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Redirect root to candidates list */}
          <Route path="/" element={<Navigate to="/candidates" replace />} />
          
          {/* Candidate list view */}
          <Route path="/candidates" element={<CandidateList />} />
          
          {/* Add candidate form */}
          <Route path="/candidates/add" element={<AddCandidateForm />} />
          
          {/* Catch-all route - redirect to candidates */}
          <Route path="*" element={<Navigate to="/candidates" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

import React from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import ForgotPassword from './pages/Forgot';
import ResetPassword from './pages/Reset';


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;


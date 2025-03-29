import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (id === 'lunacy@2025' && password === '123456789') {
      navigate('/data');
    } else {
      setError('Invalid credentials. Access denied.');
    }
  };

  return (
    <div className='bg-gray-800 grid place-items-center h-screen w-screen'>
      <div className='bg-blue-900/60 p-8 rounded-lg shadow-lg w-full max-w-md'>
        <div className='flex justify-center mb-6'>
          <img src="./lunacy.png" alt="" />
        </div>
        
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <input type="text" placeholder='ID' value={id}onChange={(e) => setId(e.target.value)}className='w-full p-3 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none'/>
          </div>
          <div>
            <input type="password" placeholder='Password' value={password}onChange={(e) => setPassword(e.target.value)}className='w-full p-3 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none'/>
          </div>
          {error && (
            <div className='text-red-400 text-sm p-2 bg-red-900/30 rounded'>
              {error}
            </div>
          )}
          <div>
            <button type='submit'className='w-full p-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded transition-colors'>LOGIN</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Home;
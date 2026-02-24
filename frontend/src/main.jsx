import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';
ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <App />
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#ffffff',
                        color: '#0f172a',
                        border: '1px solid #f1f5f9',
                        borderRadius: '16px',
                        fontSize: '14px',
                        fontWeight: '600',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    },
                    success: {
                        iconTheme: { primary: '#4f46e5', secondary: '#fff' }
                    },
                    error: {
                        iconTheme: { primary: '#ef4444', secondary: '#fff' }
                    }
                }}
            />
        </BrowserRouter>
    </React.StrictMode>
);

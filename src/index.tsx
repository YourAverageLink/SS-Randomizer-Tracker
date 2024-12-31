import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import 'tippy.js/dist/tippy.css';
import App from './App';
import { Provider } from 'react-redux';
import { createStore } from './store/Store';

if (navigator.userAgent && navigator.userAgent.includes('Chrome/103.') && navigator.userAgent.includes('OBS/')) {
    window.alert('Skyward Sword Randomizer Tracker: You seem to be using an old version of OBS Studio. ' + 
        'Please update OBS Studio to at least 31.0 to continue.')
}

const root = createRoot(document.getElementById('root')!);
const store = createStore();
root.render(
    <React.StrictMode>
        <Provider store={store}>
            <App />
        </Provider>
    </React.StrictMode>
);

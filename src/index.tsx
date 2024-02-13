import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import 'tippy.js/dist/tippy.css';
import App from './App';
import { Provider } from 'react-redux';
import { createStore } from './store/store';

const root = createRoot(document.getElementById('root')!);
const store = createStore();
root.render(
    <React.StrictMode>
        <Provider store={store}>
            <App />
        </Provider>
    </React.StrictMode>
);

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FullAcknowledgement from './miscPages/FullAcknowledgement';
import Options from './options/Options';
import Tracker from './Tracker';
import { useSelector } from 'react-redux';
import { colorSchemeSelector } from './customization/Selectors';
import { useLayoutEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorPage from './miscPages/ErrorPage';

function App() {
    const colorScheme = useSelector(colorSchemeSelector);
    useLayoutEffect(() => {
        const html = document.querySelector('html')!;
        Object.entries(colorScheme).forEach(([key, val]) => {
            html.style.setProperty(`--scheme-${key}`, val.toString());
        });
    }, [colorScheme]);

    return (
        <ErrorBoundary FallbackComponent={ErrorPage}>
            <Router basename={$PUBLIC_URL}>
                <Routes>
                    <Route path="/" element={<Options />} />
                    <Route path="/tracker" element={<Tracker />} />
                    <Route
                        path="/acknowledgement"
                        element={<FullAcknowledgement />}
                    />
                </Routes>
            </Router>
        </ErrorBoundary>
    );
}

export default App;

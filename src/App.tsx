import { useLayoutEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useStore } from 'react-redux';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import type { ColorScheme } from './customization/ColorScheme';
import { colorSchemeSelector } from './customization/Selectors';
import ErrorPage from './miscPages/ErrorPage';
import FullAcknowledgement from './miscPages/FullAcknowledgement';
import Options from './options/Options';
import type { RootState } from './store/Store';
import Tracker from './Tracker';

function createApplyColorSchemeListener() {
    let prevScheme: ColorScheme | undefined = undefined;
    return (colorScheme: ColorScheme) => {
        if (colorScheme === prevScheme) {
            return;
        }
        prevScheme = colorScheme;
        const html = document.querySelector('html')!;
        Object.entries(colorScheme).forEach(([key, val]) => {
            html.style.setProperty(`--scheme-${key}`, val.toString());
        });
    };
}

function App() {
    const store = useStore<RootState>();
    useLayoutEffect(() => {
        const listener = createApplyColorSchemeListener();
        listener(colorSchemeSelector(store.getState()));
        return store.subscribe(() =>
            listener(colorSchemeSelector(store.getState())),
        );
    }, [store]);

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

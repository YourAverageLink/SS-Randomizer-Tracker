import { Button } from 'react-bootstrap';
import { ExportButton } from './ImportExport';
import DiscordButton from './additionalComponents/DiscordButton';
import { clearStoredRemote } from './LocalStorage';
import { stringifyError } from './utils/Errors';
import { useDispatch, useSelector } from 'react-redux';
import { hasCustomLayoutSelector } from './customization/selectors';
import { setCustomLayout } from './customization/slice';

export default function ErrorPage({
    error,
    resetErrorBoundary,
}: {
    error: unknown;
    resetErrorBoundary: () => void;
}) {
    const errorMsg = stringifyError(error);
    const hasCustomLayout = useSelector(hasCustomLayoutSelector);
    const dispatch = useDispatch();
    return (
        <div>
            <p>Something went wrong. Try reloading the page, reset the tracker, or load a different logic version:</p>
            <pre style={{ color: 'red' }}>{errorMsg}</pre>
            <p>We would appreciate a bug report with an attached tracker export and a screenshot of the browser console (<code>Ctrl+Shift+J</code>)</p>
            <p><DiscordButton /></p>
            <div style={{ display: 'flex', gap: 4 }}>
                <ExportButton />
                <Button onClick={() => window.location.reload()}>Reload Page</Button>
                {hasCustomLayout && (
                    <Button
                        onClick={() => {
                            dispatch(setCustomLayout(undefined));
                            resetErrorBoundary();
                        }}
                    >
                        Remove Custom Layout
                    </Button>
                )}
                <Button onClick={() => {
                    clearStoredRemote();
                    window.location.reload();
                }}>Choose a different release</Button>
            </div>
            <p>If the error persists, you may try clearing all cookies and site data. <strong>This will reset the tracker and revert all customization.</strong></p>
            {error && typeof error === 'object' && 'stack' in error ? <pre style={{ color: 'red' }}>{error.stack as string}</pre> : undefined}
        </div>
    );
}

export function stringifyError(error: unknown) {
    return typeof error === 'object' && error != null && 'message' in error
        ? (error.message as string)
        : JSON.stringify(error);
}

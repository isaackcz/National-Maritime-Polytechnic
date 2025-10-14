const useSystemURLCon = () => {
    // Prefer environment variable if provided; otherwise default to local Laravel server
    const apiBase = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
    const url = `${apiBase}/api`;
    const urlWithoutToken = apiBase;

    return { url, urlWithoutToken };
}

export default useSystemURLCon;
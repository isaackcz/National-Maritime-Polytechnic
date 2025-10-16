const useSystemURLCon = () => {
    const url = "http://localhost:8000/api";
    const urlWithoutToken = "http://localhost:8000";
    
    return { url, urlWithoutToken };
}

export default useSystemURLCon;
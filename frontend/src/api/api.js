import axios from "axios";
console.log("API URL:", import.meta.env.VITE_API_URL);
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://43.204.232.198:4002/api" });

api.interceptors.request.use(config => {
    const token = localStorage.getItem("token");
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
    return config;
})

export default api;
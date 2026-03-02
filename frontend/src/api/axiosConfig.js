import axios from 'axios';

var x = import.meta.env.VITE_BASE_URL
console.log(x)

const api = axios.create({
    baseURL: import.meta.env.MODE === 'production'
        ? import.meta.env.VITE_BASE_URL
        : import.meta.env.VITE_BASE_URL_DEV,

    withCredentials: true,

    headers: {
        'Content-Type': 'application/json',
    }
});

export default api;
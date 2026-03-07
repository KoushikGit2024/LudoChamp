import axios from 'axios';

// var x = import.meta.env.VITE_BASE_URL
// console.log(x)

const api = axios.create({
    baseURL: import.meta.env.VITE_MODE === 'production'
        ? import.meta.env.VITE_BASE_URL
        : "http://localhost:3000",

    withCredentials: true,

    headers: {
        'Content-Type': 'application/json',
    }
});

export default api;
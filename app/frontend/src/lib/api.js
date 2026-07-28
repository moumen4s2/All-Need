import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}api`;

console.log("BACKEND_URL =", BACKEND_URL);
console.log("API =", API);

export const api = axios.create({
  baseURL: API,
  withCredentials: true,
});
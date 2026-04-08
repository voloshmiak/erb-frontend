import axios from 'axios';

const API_BASE_URL =
  String(import.meta.env.VITE_API_BASE_URL || '').trim() ||
  'https://erb-backend-762050733390.europe-central2.run.app/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
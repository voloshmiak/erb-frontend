import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'https://erb-backend-762050733390.europe-central2.run.app/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});
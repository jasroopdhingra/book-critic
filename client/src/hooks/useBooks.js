import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export function getUsername() {
  return localStorage.getItem('username') || null;
}

export function setUsername(name) {
  localStorage.setItem('username', name.trim().toLowerCase());
}

export function clearUsername() {
  localStorage.removeItem('username');
}

export function useBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBooks = useCallback(async () => {
    const username = getUsername();
    if (!username) { setLoading(false); return; }
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/books`, { params: { username } });
      setBooks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const addBook = useCallback(async (bookData) => {
    const username = getUsername();
    const { data } = await axios.post(`${API}/books`, { ...bookData, username });
    setBooks(prev => [data, ...prev]);
    return data;
  }, []);

  const deleteBook = useCallback(async (id) => {
    await axios.delete(`${API}/books/${id}`);
    setBooks(prev => prev.filter(b => b.id !== id));
  }, []);

  return { books, loading, error, addBook, deleteBook, refetch: fetchBooks };
}

export async function getBook(id) {
  const { data } = await axios.get(`${API}/books/${id}`);
  return data;
}

export async function sendAiMessage(book, messages) {
  const { data } = await axios.post(`${API}/ai/chat`, { book, messages });
  return data.reply;
}

export async function regenerateQuestion(book, messages) {
  const { data } = await axios.post(`${API}/ai/regenerate`, { book, messages });
  return data.reply;
}

export async function synthesizeReview(book, exchanges) {
  const { data } = await axios.post(`${API}/ai/synthesize`, { book, exchanges });
  return data.review;
}

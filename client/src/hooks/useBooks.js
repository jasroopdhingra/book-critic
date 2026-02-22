import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

export function useBooks() {
  const { getToken } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const { data } = await axios.get(`${API}/books`, {
        headers: authHeaders(token),
      });
      setBooks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const addBook = useCallback(async (bookData) => {
    const token = await getToken();
    const { data } = await axios.post(`${API}/books`, bookData, {
      headers: authHeaders(token),
    });
    setBooks(prev => [data, ...prev]);
    return data;
  }, [getToken]);

  const deleteBook = useCallback(async (id) => {
    const token = await getToken();
    await axios.delete(`${API}/books/${id}`, {
      headers: authHeaders(token),
    });
    setBooks(prev => prev.filter(b => b.id !== id));
  }, [getToken]);

  return { books, loading, error, addBook, deleteBook, refetch: fetchBooks };
}

export async function getBook(id) {
  const { data } = await axios.get(`${API}/books/${id}`);
  return data;
}

export async function sendAiMessage(book, messages, token) {
  const { data } = await axios.post(`${API}/ai/chat`, { book, messages }, {
    headers: authHeaders(token),
  });
  return data.reply;
}

export async function regenerateQuestion(book, messages, token) {
  const { data } = await axios.post(`${API}/ai/regenerate`, { book, messages }, {
    headers: authHeaders(token),
  });
  return data.reply;
}

export async function synthesizeReview(book, exchanges, token) {
  const { data } = await axios.post(`${API}/ai/synthesize`, { book, exchanges }, {
    headers: authHeaders(token),
  });
  return data.review;
}

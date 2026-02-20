import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = 'http://localhost:3001/api';

export function useBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/books`);
      setBooks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const addBook = async (bookData) => {
    const { data } = await axios.post(`${API}/books`, bookData);
    setBooks(prev => [data, ...prev]);
    return data;
  };

  const deleteBook = async (id) => {
    await axios.delete(`${API}/books/${id}`);
    setBooks(prev => prev.filter(b => b.id !== id));
  };

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

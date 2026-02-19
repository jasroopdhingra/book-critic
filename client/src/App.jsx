import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import Home from './pages/Home';
import Bookshelf from './pages/Bookshelf';
import LogBook from './pages/LogBook';
import BookDetail from './pages/BookDetail';

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shelf" element={<Bookshelf />} />
        <Route path="/log" element={<LogBook />} />
        <Route path="/book/:id" element={<BookDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

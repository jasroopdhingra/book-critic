import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import UsernameGate from './components/UsernameGate';
import Home from './pages/Home';
import Bookshelf from './pages/Bookshelf';
import LogBook from './pages/LogBook';
import BookDetail from './pages/BookDetail';
import { getUsername } from './hooks/useBooks';

export default function App() {
  const [username, setUsername] = useState(getUsername);

  if (!username) {
    return <UsernameGate onEnter={() => setUsername(getUsername())} />;
  }

  return (
    <BrowserRouter>
      <Nav username={username} onSwitchUser={() => setUsername(null)} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shelf" element={<Bookshelf />} />
        <Route path="/log" element={<LogBook />} />
        <Route path="/book/:id" element={<BookDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

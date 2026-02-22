import { ClerkProvider, SignedIn, SignedOut, SignIn } from '@clerk/clerk-react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Nav from './components/Nav';
import Home from './pages/Home';
import Bookshelf from './pages/Bookshelf';
import LogBook from './pages/LogBook';
import BookDetail from './pages/BookDetail';
import styles from './App.module.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function SignInPage() {
  return (
    <div className={styles.authPage}>
      <SignIn routing="hash" />
    </div>
  );
}

function AppRoutes() {
  const navigate = useNavigate();
  return (
    <>
      <SignedIn>
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shelf" element={<Bookshelf />} />
          <Route path="/log" element={<LogBook />} />
          <Route path="/book/:id" element={<BookDetail />} />
        </Routes>
      </SignedIn>
      <SignedOut>
        <SignInPage />
      </SignedOut>
    </>
  );
}

export default function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ClerkProvider>
  );
}

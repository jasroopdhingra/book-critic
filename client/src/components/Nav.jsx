import { Link, useLocation } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { useBooks } from '../hooks/useBooks';
import Logo from './Logo';
import styles from './Nav.module.css';

export default function Nav() {
  const { books } = useBooks();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoMark}>
            <Logo size={20} color="var(--accent)" />
          </span>
          <span className={`${styles.logoText} serif`}>Bookshelf</span>
        </Link>
        <div className={styles.links}>
          <Link
            to="/shelf"
            className={`${styles.link} ${isActive('/shelf') ? styles.active : ''}`}
          >
            My Shelf {books.length > 0 && <span className={styles.count}>{books.length}</span>}
          </Link>
          <Link
            to="/log"
            className={`${styles.link} ${styles.logBtn} ${isActive('/log') ? styles.activeLog : ''}`}
          >
            + Log a Book
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </nav>
  );
}

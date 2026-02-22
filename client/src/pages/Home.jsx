import { Link } from 'react-router-dom';
import { useBooks } from '../hooks/useBooks';
import styles from './Home.module.css';

export default function Home() {
  const { books } = useBooks();
  const hasBooks = books.length > 0;

  return (
    <div className={styles.page}>
      <div className={styles.center}>
        <p className={styles.eyebrow}>a reading journal</p>

        <h1 className={`${styles.headline} serif`}>
          What did<br />
          this book<br />
          do to you?
        </h1>

        <p className={styles.sub}>
          Finish a book. Reflect on it. Keep a record that's actually yours.
        </p>

        <div className={styles.ctas}>
          <Link to="/log" className={styles.primary}>
            Log a book
          </Link>
          {hasBooks && (
            <Link to="/shelf" className={styles.secondary}>
              My shelf →
            </Link>
          )}
        </div>
      </div>

      <p className={styles.footnote}>
        an AI guides the reflection &middot; the words are yours
      </p>
    </div>
  );
}

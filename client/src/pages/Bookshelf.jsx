import { Link } from 'react-router-dom';
import { useBooks } from '../hooks/useBooks';
import Logo from '../components/Logo';
import styles from './Bookshelf.module.css';

const STAR_LABELS = ['', 'not for me', 'it was ok', 'liked it', 'really liked it', 'loved it'];

function StarRating({ rating }) {
  if (!rating) return null;
  return (
    <span className={styles.rating} title={STAR_LABELS[rating]}>
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  );
}

function BookCard({ book }) {
  const preview = book.review_text;

  const dateStr = new Date(book.date_finished).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  });

  return (
    <Link to={`/book/${book.id}`} className={styles.card}>
      <div className={styles.cardLeft}>
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className={styles.cover}
          />
        ) : (
          <div className={styles.coverPlaceholder}>
            <span className={styles.coverInitial}>{book.title[0]}</span>
          </div>
        )}
      </div>
      <div className={styles.cardRight}>
        <div className={styles.cardMeta}>
          <span className={styles.date}>{dateStr}</span>
          <StarRating rating={book.rating} />
        </div>
        <h2 className={`${styles.title} serif`}>{book.title}</h2>
        <p className={styles.author}>{book.author}</p>
        {preview && (
          <p className={styles.preview}>{preview}</p>
        )}
      </div>
    </Link>
  );
}

export default function Bookshelf() {
  const { books, loading, error } = useBooks();

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <div className={styles.loadingDot} />
          <div className={styles.loadingDot} />
          <div className={styles.loadingDot} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>
          <p className={styles.emptyText}>Couldn't connect to the server.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={`${styles.heading} serif`}>My Shelf</h1>
        <p className={styles.subheading}>
          {books.length === 0
            ? 'Your shelf is empty. Log your first book to get started.'
            : `${books.length} book${books.length === 1 ? '' : 's'} read`}
        </p>
      </div>

      {books.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Logo size={36} color="var(--silver)" />
          </div>
          <p className={styles.emptyTitle}>Nothing here yet</p>
          <p className={styles.emptyDesc}>
            When you finish a book, log it here. An AI guides you through a short reflection that becomes your review.
          </p>
          <Link to="/log" className={styles.emptyBtn}>Log your first book →</Link>
          <Link to="/" className={styles.emptyHome}>Learn how it works</Link>
        </div>
      ) : (
        <div className={styles.list}>
          {books.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}

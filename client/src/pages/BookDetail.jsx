import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getBook, useBooks } from '../hooks/useBooks';
import styles from './BookDetail.module.css';

const STAR_LABELS = ['', 'not for me', 'it was ok', 'liked it', 'really liked it', 'loved it'];

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { deleteBook } = useBooks();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    getBook(id)
      .then(setBook)
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleDelete = async () => {
    await deleteBook(id);
    navigate('/');
  };

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

  if (!book) return null;

  const dateStr = new Date(book.date_finished).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className={styles.page}>
      <Link to="/shelf" className={styles.back}>← My Shelf</Link>

      <div className={styles.bookHeader}>
        {book.cover_url ? (
          <img src={book.cover_url} alt={book.title} className={styles.cover} />
        ) : (
          <div className={styles.coverPlaceholder}>
            <span>{book.title[0]}</span>
          </div>
        )}
        <div className={styles.bookMeta}>
          <h1 className={`${styles.title} serif`}>{book.title}</h1>
          <p className={styles.author}>{book.author}</p>
          <p className={styles.date}>finished {dateStr}</p>
          {book.rating && (
            <div className={styles.rating}>
              <span className={styles.stars}>{'★'.repeat(book.rating)}{'☆'.repeat(5 - book.rating)}</span>
              <span className={styles.ratingLabel}>{STAR_LABELS[book.rating]}</span>
            </div>
          )}
        </div>
      </div>

      {book.review_text ? (
        <div className={styles.review}>
          <h2 className={`${styles.reviewHeading} serif`}>Your Review</h2>
          <p className={`${styles.reviewText} serif`}>{book.review_text}</p>
        </div>
      ) : (
        <div className={styles.noReview}>
          <p>No review recorded for this book.</p>
        </div>
      )}

      <div className={styles.actions}>
        {!confirmDelete ? (
          <button className={styles.deleteBtn} onClick={() => setConfirmDelete(true)}>
            Remove from shelf
          </button>
        ) : (
          <div className={styles.confirmDelete}>
            <p>Are you sure? This can't be undone.</p>
            <div className={styles.confirmBtns}>
              <button className={styles.confirmYes} onClick={handleDelete}>Yes, remove it</button>
              <button className={styles.confirmNo} onClick={() => setConfirmDelete(false)}>Keep it</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

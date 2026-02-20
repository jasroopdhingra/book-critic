import { Link } from 'react-router-dom';
import { useBooks } from '../hooks/useBooks';
import styles from './Home.module.css';

export default function Home() {
  const { books } = useBooks();
  const hasBooks = books.length > 0;

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <p className={styles.eyebrow}>A Reading Journal</p>
        <h1 className={`${styles.headline} serif`}>
          Every book you finish<br />deserves more than a rating.
        </h1>
        <p className={styles.sub}>
          Log what you read. Reflect on what it meant. Build a shelf that captures how books actually changed you.
        </p>
        <div className={styles.heroCtas}>
          <Link to="/log" className={styles.primaryCta}>
            Log a book
          </Link>
          {hasBooks && (
            <Link to="/shelf" className={styles.secondaryCta}>
              My shelf ({books.length})
            </Link>
          )}
        </div>
      </section>

      {/* Divider */}
      <div className={styles.divider} />

      {/* Philosophy */}
      <section className={styles.philosophy}>
        <blockquote className={`${styles.quote} serif`}>
          "A book is not finished when you read the last page — it's finished when you understand what it did to you."
        </blockquote>
        <div className={styles.philosophyBody}>
          <p>
            Most apps let you track books. This one helps you understand them. The difference is the conversation in the middle — a few carefully chosen questions that pull out what actually stayed with you.
          </p>
          <p>
            The result isn't a summary. It's a record of what a book was to <em>you</em>, at the time you read it.
          </p>
        </div>
        <Link to="/log" className={styles.primaryCta}>
          Start with a book you just finished →
        </Link>
      </section>
    </div>
  );
}

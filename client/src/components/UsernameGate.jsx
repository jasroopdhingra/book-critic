import { useState } from 'react';
import { setUsername } from '../hooks/useBooks';
import Logo from './Logo';
import styles from './UsernameGate.module.css';

export default function UsernameGate({ onEnter }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = value.trim();
    if (!name) { setError('Enter a name to continue.'); return; }
    if (name.length < 2) { setError('Name must be at least 2 characters.'); return; }
    setUsername(name);
    onEnter();
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <Logo size={28} color="var(--accent)" />
        </div>
        <h1 className={`${styles.heading} serif`}>Bookshelf</h1>
        <p className={styles.sub}>
          Enter a name to open your shelf. Use the same name to come back to it.
        </p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            className={styles.input}
            type="text"
            placeholder="Your name..."
            value={value}
            onChange={e => { setValue(e.target.value); setError(''); }}
            autoFocus
            autoComplete="off"
            maxLength={32}
          />
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.btn} type="submit">
            Open my shelf →
          </button>
        </form>
        <p className={styles.note}>
          No password. No account. Just your name.
        </p>
      </div>
    </div>
  );
}

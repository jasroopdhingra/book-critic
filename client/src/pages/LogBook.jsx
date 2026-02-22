import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useBooks, sendAiMessage, synthesizeReview, regenerateQuestion } from '../hooks/useBooks';
import styles from './LogBook.module.css';

const STEPS = { SEARCH: 'search', CONFIRM: 'confirm', CHAT: 'chat', SYNTHESIZING: 'synthesizing', RATE: 'rate', STAMPED: 'stamped' };

async function searchBooks(query, limit = 6) {
  const { data } = await axios.get(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}&fields=key,title,author_name,cover_i,first_publish_year`
  );
  return data.docs.map(doc => ({
    key: doc.key,
    title: doc.title,
    author: doc.author_name?.[0] || 'Unknown Author',
    year: doc.first_publish_year,
    cover_url: doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
      : null,
  }));
}

export default function LogBook() {
  const navigate = useNavigate();
  const { addBook } = useBooks();

  const [step, setStep] = useState(STEPS.SEARCH);
  const [query, setQuery] = useState('');
  const [dropdown, setDropdown] = useState([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const searchWrapperRef = useRef(null);
  const debounceRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [saving, setSaving] = useState(false);
  const [chatDone, setChatDone] = useState(false);
  const [reviewText, setReviewText] = useState('');

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiLoading]);

  useEffect(() => {
    if (step === STEPS.CHAT && inputRef.current) {
      inputRef.current.focus();
    }
  }, [step, messages]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced live search for dropdown
  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setNoResults(false);
    setSearchResults([]);

    clearTimeout(debounceRef.current);
    if (val.trim().length < 2) {
      setDropdown([]);
      setShowDropdown(false);
      return;
    }

    setDropdownLoading(true);
    setShowDropdown(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const books = await searchBooks(val, 6);
        setDropdown(books);
      } catch {
        setDropdown([]);
      } finally {
        setDropdownLoading(false);
      }
    }, 300);
  };

  // Explicit search button
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setShowDropdown(false);
    setSearching(true);
    setNoResults(false);
    try {
      const books = await searchBooks(query, 8);
      setSearchResults(books);
      if (books.length === 0) setNoResults(true);
    } catch {
      setSearchResults([]);
      setNoResults(true);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectBook = (book) => {
    setShowDropdown(false);
    setSelectedBook(book);
    setStep(STEPS.CONFIRM);
  };

  const startChat = async () => {
    setStep(STEPS.CHAT);
    setAiLoading(true);
    try {
      const opening = await sendAiMessage(selectedBook, []);
      setMessages([{ role: 'assistant', content: opening }]);
    } catch {
      setMessages([{ role: 'assistant', content: "What stayed with you after the last page?" }]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || aiLoading) return;

    const userMsg = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setAiLoading(true);

    try {
      const reply = await sendAiMessage(selectedBook, newMessages);

      if (reply.includes('REVIEW_COMPLETE')) {
        const cleanReply = reply.replace('REVIEW_COMPLETE', '').trim();
        if (cleanReply) {
          setMessages(prev => [...prev, { role: 'assistant', content: cleanReply }]);
        }
        setChatDone(true);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      }
    } catch {
      const fallbacks = [
        "What surprised you most about where the story went?",
        "Was there a character you found yourself thinking about after you put it down?",
        "Did anything in the book mirror something in your own life?",
        "What would you have done differently if you were the author?",
        "Is there a single sentence or moment you keep coming back to?",
      ];
      const used = newMessages
        .filter(m => m.role === 'assistant')
        .map(m => m.content);
      const unused = fallbacks.filter(f => !used.includes(f));
      const next = unused.length > 0
        ? unused[0]
        : fallbacks[Math.floor(Math.random() * fallbacks.length)];
      setMessages(prev => [...prev, { role: 'assistant', content: next }]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRegenerate = async () => {
    if (aiLoading) return;
    // Remove last assistant message and request a fresh one
    const withoutLast = messages.slice(0, -1);
    setMessages(withoutLast);
    setAiLoading(true);
    try {
      const reply = await regenerateQuestion(selectedBook, withoutLast);
      setMessages([...withoutLast, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(messages); // restore on failure
    } finally {
      setAiLoading(false);
    }
  };

  const goToRate = async () => {
    setStep(STEPS.SYNTHESIZING);
    try {
      const review = await synthesizeReview(selectedBook, messages);
      setReviewText(review);
    } catch {
      // fall back to joining user answers as plain text
      const fallback = messages
        .filter(m => m.role === 'user')
        .map(m => m.content)
        .join('\n\n');
      setReviewText(fallback);
    }
    setStep(STEPS.RATE);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const book = await addBook({
        title: selectedBook.title,
        author: selectedBook.author,
        cover_url: selectedBook.cover_url,
        open_library_key: selectedBook.key,
        date_finished: new Date().toISOString().split('T')[0],
        rating: rating || null,
        review_text: reviewText || null,
      });
      // Show stamp, then navigate
      setStep(STEPS.STAMPED);
      setTimeout(() => navigate(`/book/${book.id}`), 2200);
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  const STAR_LABELS = ['', 'not for me', 'it was ok', 'liked it', 'really liked it', 'loved it'];

  return (
    <div className={styles.page}>
      {/* STEP 1: Search */}
      {step === STEPS.SEARCH && (
        <div className={styles.section}>
          <h1 className={`${styles.heading} serif`}>What did you just finish?</h1>
          <p className={styles.sub}>Search for your book to get started.</p>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.searchInputWrap} ref={searchWrapperRef}>
              <input
                className={styles.searchInput}
                type="text"
                placeholder="Title or author..."
                value={query}
                onChange={handleQueryChange}
                onFocus={() => dropdown.length > 0 && setShowDropdown(true)}
                autoComplete="off"
                autoFocus
              />
              {showDropdown && (
                <div className={styles.dropdown}>
                  {dropdownLoading ? (
                    <div className={styles.dropdownLoading}>
                      <span /><span /><span />
                    </div>
                  ) : dropdown.length > 0 ? (
                    dropdown.map((book, i) => (
                      <button
                        key={`${book.key}-${i}`}
                        type="button"
                        className={styles.dropdownItem}
                        onMouseDown={() => handleSelectBook(book)}
                      >
                        {book.cover_url ? (
                          <img src={book.cover_url} alt={book.title} className={styles.resultCover} />
                        ) : (
                          <div className={styles.resultCoverPlaceholder}>
                            <span>{book.title[0]}</span>
                          </div>
                        )}
                        <div className={styles.resultInfo}>
                          <span className={styles.resultTitle}>{book.title}</span>
                          <span className={styles.resultAuthor}>{book.author}{book.year ? ` · ${book.year}` : ''}</span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className={styles.dropdownEmpty}>No matches yet...</p>
                  )}
                </div>
              )}
            </div>
            <button className={styles.searchBtn} type="submit" disabled={searching}>
              {searching ? '...' : 'Search'}
            </button>
          </form>

          {searchResults.length > 0 && (
            <div className={styles.results}>
              {searchResults.map((book, i) => (
                <button
                  key={`${book.key}-${i}`}
                  className={styles.resultItem}
                  onClick={() => handleSelectBook(book)}
                >
                  {book.cover_url ? (
                    <img src={book.cover_url} alt={book.title} className={styles.resultCover} />
                  ) : (
                    <div className={styles.resultCoverPlaceholder}>
                      <span>{book.title[0]}</span>
                    </div>
                  )}
                  <div className={styles.resultInfo}>
                    <span className={styles.resultTitle}>{book.title}</span>
                    <span className={styles.resultAuthor}>{book.author}{book.year ? ` · ${book.year}` : ''}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {noResults && (
            <p className={styles.noResults}>No results found. Try a different search.</p>
          )}
        </div>
      )}

      {/* STEP 2: Confirm */}
      {step === STEPS.CONFIRM && selectedBook && (
        <div className={styles.section}>
          <button className={styles.back} onClick={() => setStep(STEPS.SEARCH)}>← Back</button>
          <h1 className={`${styles.heading} serif`}>Is this the one?</h1>

          <div className={styles.confirmCard}>
            {selectedBook.cover_url ? (
              <img src={selectedBook.cover_url} alt={selectedBook.title} className={styles.confirmCover} />
            ) : (
              <div className={styles.confirmCoverPlaceholder}>
                <span>{selectedBook.title[0]}</span>
              </div>
            )}
            <div className={styles.confirmInfo}>
              <h2 className={`${styles.confirmTitle} serif`}>{selectedBook.title}</h2>
              <p className={styles.confirmAuthor}>{selectedBook.author}</p>
              {selectedBook.year && <p className={styles.confirmYear}>{selectedBook.year}</p>}
            </div>
          </div>

          <div className={styles.confirmActions}>
            <button className={styles.primaryBtn} onClick={startChat}>
              Yes, let's reflect on it →
            </button>
            <button className={styles.ghostBtn} onClick={() => setStep(STEPS.SEARCH)}>
              That's not it
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: AI Chat */}
      {step === STEPS.CHAT && (
        <div className={styles.chatPage}>
          <div className={styles.chatHeader}>
            <div className={styles.chatBook}>
              {selectedBook.cover_url && (
                <img src={selectedBook.cover_url} alt="" className={styles.chatCover} />
              )}
              <div>
                <p className={`${styles.chatTitle} serif`}>{selectedBook.title}</p>
                <p className={styles.chatAuthor}>{selectedBook.author}</p>
              </div>
            </div>
          </div>

          <div className={styles.chatMessages}>
            {messages.map((msg, i) => {
              const isLastAssistant = msg.role === 'assistant' && i === messages.length - 1;
              const hasUserReplied = messages.slice(i + 1).some(m => m.role === 'user');
              const canRegenerate = isLastAssistant && !hasUserReplied && !chatDone;
              return (
                <div key={i} className={`${styles.message} ${styles[msg.role]}`}>
                  {msg.role === 'assistant' && (
                    <div className={styles.aiLabel}>Reflection</div>
                  )}
                  <p className={msg.role === 'assistant' ? `${styles.messageText} serif` : styles.messageText}>
                    {msg.content}
                  </p>
                  {canRegenerate && (
                    <button
                      className={styles.regenerateBtn}
                      onClick={handleRegenerate}
                      disabled={aiLoading}
                    >
                      ↻ different question
                    </button>
                  )}
                </div>
              );
            })}
            {aiLoading && (
              <div className={`${styles.message} ${styles.assistant}`}>
                  <div className={styles.aiLabel}>Reflection</div>
                <div className={styles.typing}>
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className={styles.chatInput}>
            {chatDone ? (
              <button className={styles.primaryBtn} onClick={goToRate}>
                Save to Shelf →
              </button>
            ) : (
              <>
                <textarea
                  ref={inputRef}
                  className={styles.textarea}
                  placeholder="Write your thoughts..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  disabled={aiLoading}
                />
                <button
                  className={styles.sendBtn}
                  onClick={handleSendMessage}
                  disabled={aiLoading || !input.trim()}
                >
                  →
                </button>
              </>
            )}
          </div>
          {!chatDone && messages.filter(m => m.role === 'user').length >= 1 && (
            <div className={styles.chatFooter}>
              <button className={styles.doneBtn} onClick={goToRate}>
                I'm done reflecting — Save to Shelf →
              </button>
            </div>
          )}
        </div>
      )}

      {/* SYNTHESIZING */}
      {step === STEPS.SYNTHESIZING && (
        <div className={styles.synthesizing}>
          <div className={styles.synthesizingDots}>
            <span /><span /><span />
          </div>
          <p className={`${styles.synthesizingText} serif`}>writing your review…</p>
        </div>
      )}

      {/* STEP 4: Rate & Save */}
      {step === STEPS.RATE && (
        <div className={styles.section}>
          <h1 className={`${styles.heading} serif`}>Your Review</h1>
          <p className={styles.sub}>Here's what your reflection became. Rate the book and save it to your shelf.</p>

          {reviewText && (
            <div className={styles.reviewPreview}>
              <p className={`${styles.reviewPreviewText} serif`}>{reviewText}</p>
            </div>
          )}

          <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                className={`${styles.star} ${(hoverRating || rating) >= star ? styles.starFilled : ''}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                ★
              </button>
            ))}
          </div>
          {(hoverRating || rating) > 0 && (
            <p className={styles.starLabel}>{STAR_LABELS[hoverRating || rating]}</p>
          )}

          <div className={styles.confirmActions} style={{ marginTop: 24 }}>
            <button className={styles.primaryBtn} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Add to My Shelf →'}
            </button>
            <button className={styles.ghostBtn} onClick={handleSave} disabled={saving}>
              Skip rating
            </button>
          </div>
        </div>
      )}
      {/* STAMPED */}
      {step === STEPS.STAMPED && (
        <div className={styles.stampOverlay}>
          <div className={styles.stampWrap}>
            <div className={styles.stamp}>
              <span className={styles.stampText}>shelved.</span>
              <span className={styles.stampTitle}>{selectedBook?.title}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

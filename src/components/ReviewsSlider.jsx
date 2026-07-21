import { useEffect, useState } from 'react';
import { REVIEWS } from '../data/content.js';

export default function ReviewsSlider() {
  const [index, setIndex] = useState(0);
  const count = REVIEWS.length;

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearInterval(t);
  }, [count]);

  const go = (i) => setIndex(((i % count) + count) % count);

  return (
    <section className="section section-soft" id="reviews">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title">آراء الطلاب</h2>
          <p className="section-subtitle">محبوب من آلاف المتعلمين حول العالم.</p>
        </div>

        <div className="reviews-slider">
          <div className="reviews-track" style={{ transform: `translateX(-${index * 100}%)` }}>
            {REVIEWS.map((r, i) => (
              <div key={i} className="review-card">
                <div className="review-inner">
                  <div className="review-stars">
                    {Array.from({ length: r.rating }).map((_, s) => (
                      <svg key={s} width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    ))}
                  </div>
                  <p className="review-body">“{r.body}”</p>
                  <div className="review-author">
                    <img src={r.avatar} alt="" className="review-avatar" loading="lazy" />
                    <div>
                      <div className="review-name">{r.name}</div>
                      <div className="review-role">{r.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="reviews-nav">
            <button className="reviews-btn" onClick={() => go(index - 1)} aria-label="الرأي السابق">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div className="reviews-dots">
              {REVIEWS.map((_, i) => (
                <button key={i} className={`reviews-dot ${i === index ? 'active' : ''}`} onClick={() => go(i)} aria-label={`اذهب إلى الرأي ${i + 1}`} />
              ))}
            </div>
            <button className="reviews-btn" onClick={() => go(index + 1)} aria-label="الرأي التالي">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

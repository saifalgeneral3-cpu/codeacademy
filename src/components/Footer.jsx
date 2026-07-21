import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Footer() {
  const { session } = useAuth();
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo />
          <p className="mt-4 footer-tagline">
            تعلم البرمجة بالطريقة الذكية — دورات مجانية منظمة وعالية الجودة لكل المستويات.
          </p>
          <div className="social-row">
            <a className="social-btn" href="https://github.com/saifalgeneral3-cpu" target="_blank" rel="noreferrer" aria-label="GitHub">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.5v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17 4.6 18 4.9 18 4.9c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.6.8.5 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z"/></svg>
            </a>
            <a className="social-btn" href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 5.5h2.6l-5.7 6.5L22 19.5h-5.2l-4.1-5.4-4.7 5.4H5.4l6.1-7L5 5.5h5.3l3.7 4.9 4-4.9zm-.9 12.5h1.4L9.1 6.9H7.6l10.4 11.1z"/></svg>
            </a>
            <a className="social-btn" href="https://youtube.com/@saifalgeneral7?si=Nleb6R_-KX1ft5VQ" target="_blank" rel="noreferrer" aria-label="YouTube">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.7-1.7C19.3 5.2 12 5.2 12 5.2s-7.3 0-8.9.4A2.5 2.5 0 0 0 1.4 7.3C1 8.8 1 12 1 12s0 3.2.4 4.7a2.5 2.5 0 0 0 1.7 1.7c1.6.4 8.9.4 8.9.4s7.3 0 8.9-.4a2.5 2.5 0 0 0 1.7-1.7c.4-1.5.4-4.7.4-4.7zM9.8 15.3V8.7l5.7 3.3-5.7 3.3z"/></svg>
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h4>روابط سريعة</h4>
          <Link to="/">الرئيسية</Link>
          <Link to="/courses">الدورات</Link>
          <Link to="/about">من نحن</Link>
          <Link to="/contact">تواصل معنا</Link>
        </div>

        <div className="footer-col">
          <h4>الدورات</h4>
          <Link to="/courses?cat=html">HTML</Link>
          <Link to="/courses?cat=css">CSS</Link>
          <Link to="/courses?cat=javascript">JavaScript</Link>
          <Link to="/courses?cat=react">React</Link>
          <Link to="/courses?cat=python">Python</Link>
        </div>

        <div className="footer-col">
          <h4>تواصل</h4>
          <a href="mailto:saifalgeneral">saifalgeneral3@gmail.com</a>
          <span className="text-muted">مدرب : سيف عمرو متولي</span>
          {!session && <Link to="/signup" className="btn btn-primary btn-sm mt-3">ابدأ الآن</Link>}
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>© 2026 كود أكاديمي — إنشاء سيف عمرو</span>
          <span className="text-muted">مُدمِن الإستمرارية لازم يصيب الهدف</span>
        </div>
      </div>
    </footer>
  );
}

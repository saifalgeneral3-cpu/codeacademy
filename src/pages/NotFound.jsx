import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="not-found">
      <div className="animate-fade-up">
        <div className="not-found-code">404</div>
        <h1 className="mt-4">الصفحة غير موجودة</h1>
        <p className="mt-3 text-muted" style={{ maxWidth: 440, margin: '0 auto' }}>
          الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        <div className="flex justify-center gap-3 mt-5 wrap">
          <Link to="/" className="btn btn-primary btn-lg">العودة للرئيسية</Link>
          <Link to="/courses" className="btn btn-secondary btn-lg">تصفّح الدورات</Link>
        </div>
      </div>
    </section>
  );
}

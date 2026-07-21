import { Link } from 'react-router-dom';

const LEVEL_LABELS = { beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم' };

export default function CourseCard({ course, lessonCount, progress }) {
  const pct = progress != null ? Math.round(progress) : null;
  return (
    <Link to={`/courses/${course.slug}`} className="course-card card card-hover">
      <div className="course-thumb">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt="" loading="lazy" />
        ) : (
          <div className="course-thumb-fallback">{course.category_name?.[0] || 'C'}</div>
        )}
        <span className="badge badge-free course-free-badge">مجاني</span>
        {course.level && <span className={`badge badge-${course.level} course-level-badge`}>{LEVEL_LABELS[course.level]}</span>}
      </div>
      <div className="course-body">
        <div className="course-meta-row">
          <span className="course-cat">{course.category_name || 'عام'}</span>
          {lessonCount != null && <span className="course-lessons">{lessonCount} درس</span>}
        </div>
        <h3 className="course-title">{course.title}</h3>
        <p className="course-desc">{course.description}</p>
        <div className="course-foot">
          <div className="course-instructor">
            <span className="course-instructor-dot">{course.instructor?.[0]}</span>
            <span>{course.instructor}</span>
          </div>
          {pct != null ? (
            <span className="course-progress-pill">{pct}%</span>
          ) : (
            <span className="course-start">ابدأ ←</span>
          )}
        </div>
        {pct != null && (
          <div className="course-progress-bar">
            <div className="course-progress-fill" style={{ width: `${pct}%` }} />
          </div>
        )}
      </div>
    </Link>
  );
}

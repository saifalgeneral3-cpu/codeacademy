export function SkeletonCard() {
  return (
    <div className="course-card card">
      <div className="skeleton course-thumb" />
      <div className="course-body">
        <div className="skeleton" style={{ height: 14, width: '40%', marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 20, width: '80%', marginBottom: 10 }} />
        <div className="skeleton" style={{ height: 14, width: '95%', marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 14, width: '70%' }} />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="courses-grid">
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}

export function SkeletonLine({ w = '100%', h = 16 }) {
  return <div className="skeleton" style={{ height: h, width: w }} />;
}

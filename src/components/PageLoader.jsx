export default function PageLoader() {
  return (
    <div className="page-loader">
      <div className="flex flex-col items-center gap-3">
        <div className="spinner spinner-lg" />
        <span className="text-muted">جارٍ التحميل…</span>
      </div>
    </div>
  );
}

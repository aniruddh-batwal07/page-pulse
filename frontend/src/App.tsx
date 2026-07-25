import { AuditPage } from './pages/AuditPage';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <AuditPage />
      </div>
      <footer className="border-t border-slate-200/80 bg-white/70 px-4 py-4 text-center text-sm text-slate-500 backdrop-blur-sm sm:px-6">
        <a
          href="https://digitalheroesco.com"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors duration-200 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          Built for Digital Heroes Training Task
        </a>
      </footer>
    </div>
  );
}

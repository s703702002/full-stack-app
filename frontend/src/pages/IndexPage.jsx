import { Link } from 'react-router-dom';

export default function IndexPage() {
  return (
    <div className="text-center mt-32">
      <h1 className="text-6xl font-extrabold text-slate-950 mb-6">
        終極認證系統
      </h1>
      <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
        Vite + React + Tailwind 實作，搭配後端 Redis Session
        驗證。安全、快速、體驗流暢。
      </p>
      <div className="flex gap-4 justify-center">
        <Link
          to="/login"
          className="bg-primary hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-xl transition duration-150 shadow-md hover:shadow-lg"
        >
          立即登入
        </Link>
        <Link
          to="/register"
          className="bg-white hover:bg-slate-100 text-slate-800 font-semibold py-3 px-8 rounded-xl transition duration-150 shadow border border-slate-200"
        >
          註冊新帳號
        </Link>
      </div>
    </div>
  );
}

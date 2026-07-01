import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function IndexPage() {
  const { t } = useTranslation();

  return (
    <div className="text-center mt-32">
      <h1 className="text-6xl font-extrabold text-slate-950 mb-6">
        {t('index.title')}
      </h1>
      <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
        {t('index.subtitle')}
      </p>
      <div className="flex gap-4 justify-center">
        <Link
          to="/login"
          className="bg-primary hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-xl transition duration-150 shadow-md hover:shadow-lg"
        >
          {t('index.sign-in')}
        </Link>
        <Link
          to="/register"
          className="bg-white hover:bg-slate-100 text-slate-800 font-semibold py-3 px-8 rounded-xl transition duration-150 shadow border border-slate-200"
        >
          {t('index.register')}
        </Link>
      </div>
    </div>
  );
}

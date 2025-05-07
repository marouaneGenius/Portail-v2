import { Link } from "react-router-dom";

const Home: React.FC = () => (
  <main className="mx-auto max-w-5xl p-8">
    <section className="rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 p-10 text-white shadow-lg">
      <h1 className="mb-4 text-4xl font-bold">
        Bienvenue sur le Portail&nbsp;Genius Com 📚
      </h1>
      <p className="text-lg">
        HOME
      </p>
      <Link
        to="/login"
        className="mt-6 inline-block rounded-xl bg-white/10 px-6 py-3 text-lg font-medium backdrop-blur transition hover:bg-white/20"
      >
        Se connecter
      </Link>
    </section>
    <section className="mt-12 grid gap-6 sm:grid-cols-2">
        Vue d’ensemble de l’activité (sessions, abonnements…)
        Home
    </section>
  </main>
);

export default Home;

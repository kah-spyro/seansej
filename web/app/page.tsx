import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-3">
          <div className="text-6xl">🎬</div>
          <h1 className="text-4xl font-bold tracking-tight">Movie Match</h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Answer 9 quick questions and get 3 personalised film picks — chosen
            by AI, not an algorithm.
          </p>
        </div>

        <Link
          href="/quiz"
          className="inline-block w-full py-4 bg-white text-gray-900 rounded-2xl font-bold text-lg hover:bg-gray-100 transition active:scale-95"
        >
          Find my film →
        </Link>

        <p className="text-xs text-gray-600">Takes about 30 seconds</p>
      </div>
    </main>
  );
}

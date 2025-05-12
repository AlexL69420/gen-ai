import { Link } from "react-router-dom";
import { Button } from "flowbite-react";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4 dark:from-slate-900 dark:to-slate-800">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-800">
        {/* Decorative Elements */}
        <div className="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-blue-200/50 dark:bg-blue-900/30"></div>
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-blue-300/50 dark:bg-blue-800/30"></div>

        {/* Content */}
        <div className="relative z-10 p-8 text-center">
          <div className="mb-6 text-9xl font-bold text-blue-600 dark:text-blue-400">
            404
          </div>

          <h1 className="mb-4 text-3xl font-bold text-gray-800 dark:text-white">
            Страница не найдена
          </h1>

          <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">
            Похоже, мы не можем найти то, что вы ищете.
          </p>

          <div className="animate-bounce">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto h-16 w-16 text-blue-500 dark:text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <Link to="/" className="mt-8 inline-block">
            <Button
              color="blue"
              className="w-full rounded-lg px-6 py-3 text-lg font-medium hover:cursor-pointer hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              <div className="flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Вернуться на главную
              </div>
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

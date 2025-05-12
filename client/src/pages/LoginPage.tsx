import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { LOCAL_API_URL } from "../environment";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "flowbite-react";

export default function LoginPage() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${LOCAL_API_URL}api/users/login`,
        { username, password },
        { withCredentials: true },
      );
      login(response.data.user);
      navigate("/");
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data.error || "Неверные учетные данные"
          : "Ошибка при входе",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-900">
      <div className="relative w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl dark:bg-slate-800 dark:text-slate-200">
        {/* Close Button */}
        <div className="absolute top-4 right-4">
          <Link to="/">
            <Button
              color="light"
              className="flex size-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-all hover:cursor-pointer hover:bg-gray-100 hover:text-gray-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
            >
              X
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6 text-center dark:from-slate-700 dark:to-slate-800">
          <h1 className="text-3xl font-bold text-white">Добро пожаловать</h1>
          <p className="mt-1 text-blue-100 dark:text-slate-300">
            Введите свои учетные данные
          </p>
        </div>

        {/* Form Content */}
        <div className="p-8">
          {error && (
            <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700 dark:bg-red-900/50 dark:text-red-100">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="login-username"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300"
              >
                Имя пользователя
              </label>
              <input
                id="login-username"
                type="text"
                placeholder="Введите имя пользователя"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                required
                autoFocus
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300"
              >
                Пароль
              </label>
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:cursor-pointer hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:opacity-70 dark:bg-violet-600 dark:hover:bg-violet-700 dark:focus:ring-violet-800"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="mr-2 h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Вход...
                </span>
              ) : (
                <span className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  Войти
                </span>
              )}
            </button>

            <div className="text-center text-sm text-gray-500 dark:text-slate-400">
              Нет аккаунта?{" "}
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:cursor-pointer hover:underline dark:text-blue-400"
              >
                Зарегистрируйтесь
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

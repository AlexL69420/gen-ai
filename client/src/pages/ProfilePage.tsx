import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { LOCAL_API_URL } from "../environment";
import { useAuth } from "../contexts/AuthContext";
import { Header } from "../components/Header";
import { MyFooter } from "../components/Footer";
import { Button } from "flowbite-react";

export default function ProfilePage() {
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.put(`${LOCAL_API_URL}api/users/change-password`, {
        oldPassword,
        newPassword,
      });
      setError("");
      setSuccess("Пароль успешно изменён");
      setOldPassword("");
      setNewPassword("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(`Ошибка при изменении пароля: ${err}`);
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${LOCAL_API_URL}api/users/logout`);
      logout();
      navigate("/");
    } catch (err) {
      setError(`Ошибка при выходе из аккаунта: ${err}`);
      setTimeout(() => setError(""), 5000);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]); // Зависимости: user и navigate

  // Отображение ошибки
  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center bg-gray-100 dark:bg-slate-600">
        <Header />
        <div className="flex w-full max-w-4xl flex-1 flex-col items-center p-4">
          <div className="mt-8 w-full rounded-lg bg-red-100 p-4 text-center text-red-700 dark:bg-red-900 dark:text-red-100">
            {error}
          </div>
        </div>
        <MyFooter />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-100 dark:bg-slate-600">
      <Header />
      <div className="flex w-full max-w-4xl flex-1 flex-col items-center p-4">
        <div className="relative w-full rounded-xl bg-white shadow-lg dark:bg-slate-700 dark:text-white">
          {/* Кнопка закрытия - добавлена здесь */}
          <div className="absolute top-4 right-4 z-10">
            <Link to="/">
              <Button
                color="light"
                className="flex size-10 items-center justify-center rounded-full bg-blue-200 text-black hover:cursor-pointer hover:bg-slate-300 disabled:pointer-events-none dark:bg-violet-600 dark:text-white dark:hover:bg-violet-400"
              >
                X
              </Button>
            </Link>
          </div>

          {/* Profile Header */}
          <div className="rounded-t-xl bg-blue-500 p-6 text-center dark:bg-violet-800">
            <h1 className="text-3xl font-bold text-white">
              Профиль пользователя
            </h1>
            <div className="mt-2 text-xl font-medium text-blue-100 dark:text-violet-200">
              {user?.username}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Change Password Form */}
            <form
              onSubmit={handleChangePassword}
              className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-6 shadow-sm dark:border-slate-600 dark:bg-slate-800"
            >
              <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white">
                Изменение пароля
              </h2>

              {success && (
                <div className="mb-4 rounded-lg bg-green-100 p-3 text-green-700 dark:bg-green-900 dark:text-green-100">
                  {success}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="oldPassword"
                    className="mb-1 block font-medium text-gray-700 dark:text-gray-300"
                  >
                    Старый пароль
                  </label>
                  <input
                    id="oldPassword"
                    type="password"
                    placeholder="Введите старый пароль"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:focus:ring-violet-600"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-1 block font-medium text-gray-700 dark:text-gray-300"
                  >
                    Новый пароль
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    placeholder="Введите новый пароль"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:focus:ring-violet-600"
                    required
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-blue-500 py-3 font-medium text-white transition duration-200 hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:bg-violet-700 dark:hover:bg-violet-600 dark:focus:ring-violet-700"
                >
                  Изменить пароль
                </button>
              </div>
            </form>

            {/* Logout Button */}
            <div className="text-center">
              <button
                onClick={handleLogout}
                className="rounded-lg bg-red-500 px-6 py-3 font-medium text-white transition duration-200 hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none dark:bg-red-700 dark:hover:bg-red-600 dark:focus:ring-red-700"
              >
                Выйти из аккаунта
              </button>
            </div>
          </div>
        </div>
      </div>
      <MyFooter />
    </main>
  );
}

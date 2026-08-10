'use client';

import { useState } from 'react';

export default function Home() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  // タスクの追加
  const addTodo = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setTodos([...todos, { id: Date.now(), text: input, completed: false }]);
    setInput('');
  };

  // 完了フラグの切り替え
  const toggleTodo = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // タスクの削除
  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6 h-fit mt-10">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
          やることリスト
        </h1>

        {/* タスク入力フォーム */}
        <form onSubmit={addTodo} className="flex gap-2 mb-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="新しいタスクを入力..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            追加
          </button>
        </form>

        {/* タスク一覧 */}
        <ul className="space-y-2">
          {todos.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-4">
              タスクがありません
            </p>
          ) : (
            todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
              >
                <div
                  onClick={() => toggleTodo(todo.id)}
                  className="flex items-center gap-3 cursor-pointer flex-1"
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => {}}
                    className="w-5 h-5 accent-blue-600 cursor-pointer"
                  />
                  <span
                    className={`text-gray-800 ${
                      todo.completed
                        ? 'line-through text-gray-400'
                        : 'font-medium'
                    }`}
                  >
                    {todo.text}
                  </span>
                </div>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded transition"
                >
                  削除
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </main>
  );
}
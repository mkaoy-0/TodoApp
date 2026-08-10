'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('取得エラー:', error);
    } else {
      setTodos(data || []);
    }
    setLoading(false);
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const { data, error } = await supabase
      .from('todos')
      .insert([{ title: input, is_completed: false }])
      .select();

    if (error) {
      console.error('追加エラー:', error);
    } else if (data) {
      setTodos([data[0], ...todos]);
      setInput('');
    }
  };

  const toggleTodo = async (id, currentStatus) => {
    const { error } = await supabase
      .from('todos')
      .update({ is_completed: !currentStatus })
      .eq('id', id);

    if (error) {
      console.error('更新エラー:', error);
    } else {
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, is_completed: !currentStatus } : todo
        )
      );
    }
  };

  const deleteTodo = async (id) => {
    const { error } = await supabase.from('todos').delete().eq('id', id);

    if (error) {
      console.error('削除エラー:', error);
    } else {
      setTodos(todos.filter((todo) => todo.id !== id));
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 flex justify-center items-start pt-10">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h1 className="text-xl font-bold text-slate-800 text-center mb-4">
          やることリスト
        </h1>

        <form onSubmit={addTodo} className="flex gap-2 mb-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="新しいタスクを入力..."
            className="flex-1 border border-slate-300 rounded-md px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded-md font-medium transition"
          >
            追加
          </button>
        </form>

        {loading ? (
          <p className="text-center text-slate-400 text-xs py-2">
            読み込み中...
          </p>
        ) : (
          <ul className="space-y-1.5">
            {todos.length === 0 ? (
              <p className="text-center text-slate-400 text-xs py-2">
                タスクがありません
              </p>
            ) : (
              todos.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded border border-slate-100"
                >
                  <div
                    onClick={() => toggleTodo(todo.id, todo.is_completed)}
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <input
                      type="checkbox"
                      checked={todo.is_completed}
                      onChange={() => {}}
                      className="w-4 h-4 accent-blue-600 cursor-pointer"
                    />
                    <span
                      className={`text-sm ${
                        todo.is_completed
                          ? 'line-through text-slate-400'
                          : 'text-slate-700'
                      }`}
                    >
                      {todo.title}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-red-500 hover:text-red-700 text-xs px-1.5 py-0.5 rounded"
                  >
                    削除
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </main>
  );
}
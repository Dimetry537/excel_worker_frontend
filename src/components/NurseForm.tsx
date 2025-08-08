import { useEffect, useState } from "react";
import {
  createNurse,
  getNurses,
  deleteNurse,
  updateNurse,
  toggleNurse,
} from "../api/nurses";
import type { Nurse } from "../api/nurses";

export default function NurseForm() {
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  const fetchNurses = async () => {
    try {
      const data = await getNurses();
      setNurses(data);
    } catch (error) {
      console.error("Ошибка загрузки медсестёр:", error);
    }
  };

  useEffect(() => {
    fetchNurses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId !== null) {
        await updateNurse(editingId, { full_name: name });
        setEditingId(null);
      } else {
        await createNurse({ full_name: name });
      }
      setName("");
      await fetchNurses();
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить медсестру?")) return;
    try {
      await deleteNurse(id);
      await fetchNurses();
    } catch (error) {
      console.error("Ошибка при удалении:", error);
    }
  };

  const handleEdit = (nurse: Nurse) => {
    setEditingId(nurse.id);
    setName(nurse.full_name);
  };

  const handleToggleActive = async (id: number) => {
    try {
      await toggleNurse(id);
      await fetchNurses();
    } catch (error) {
      console.error("Ошибка при изменении активности:", error);
    }
  };

  const filteredNurses = showInactive ? nurses : nurses.filter((n) => n.is_active);

  return (
    <div className="bg-gray-100 px-4 pt-10">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8 mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-blue-800 text-center">
          {editingId ? "Редактировать медсестру" : "Добавить медсестру"}
        </h2>

        <form onSubmit={handleSubmit} className="flex gap-4 mb-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ФИО медсестры"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-6 py-3 rounded-lg"
          >
            {editingId ? "Сохранить" : "Добавить"}
          </button>
          {editingId !== null && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setName("");
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white text-lg font-semibold px-6 py-3 rounded-lg"
            >
              Отмена
            </button>
          )}
        </form>

        <div className="flex justify-between items-center mb-4">
          <label className="flex items-center gap-2 text-lg">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            Показать скрытых
          </label>
        </div>

        <ul className="space-y-4">
          {filteredNurses.map((nurse) => (
            <li
              key={nurse.id}
              className={`flex justify-between items-center border-b pb-2 ${
                !nurse.is_active ? "opacity-50" : ""
              }`}
            >
              <span className="text-lg">{nurse.full_name}</span>
              <div className="space-x-4">
                <button
                  onClick={() => handleEdit(nurse)}
                  className="text-yellow-600 hover:underline text-lg"
                >
                  ✏️ Редактировать
                </button>
                <button
                  onClick={() => handleToggleActive(nurse.id)}
                  className="text-blue-600 hover:underline text-lg"
                >
                  {nurse.is_active ? "🙈 Скрыть" : "👁 Показать"}
                </button>
                <button
                  onClick={() => handleDelete(nurse.id)}
                  className="text-red-600 hover:underline text-lg"
                >
                  🗑 Удалить
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

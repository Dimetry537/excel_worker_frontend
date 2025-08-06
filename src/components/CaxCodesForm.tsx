import { useEffect, useState } from "react";
import {
  createCaxCode,
  getCaxCodes,
  updateCaxCode,
  deleteCaxCode,
} from "../api/caxCodes";
import type { CaxCode } from "../api/caxCodes";

export default function CaxCodesForm() {
  const [codes, setCodes] = useState<CaxCode[]>([]);
  const [code, setCode] = useState<number | "">("");
  const [description, setDescription] = useState<string>("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchCaxCodes = async () => {
    try {
      const data = await getCaxCodes();
      setCodes(data);
    } catch (error) {
      console.error("Ошибка загрузки ЦАХ:", error);
    }
  };

  useEffect(() => {
    fetchCaxCodes();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (code === "" || isNaN(Number(code))) {
      alert("Введите числовой код тарифа");
      return;
    }
    try {
      const payload = {
        cax_code: Number(code),
        cax_name: description,
      };
      if (editingId !== null) {
        await updateCaxCode(editingId, payload);
        setEditingId(null);
      } else {
        await createCaxCode(payload);
      }
      setCode("");
      setDescription("");
      await fetchCaxCodes();
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
    }
  };

  const handleEdit = (cax: CaxCode) => {
    setEditingId(cax.id);
    setCode(cax.cax_code);
    setDescription(cax.cax_name);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Удалить ЦАХ?")) return;
    try {
      await deleteCaxCode(id);
      await fetchCaxCodes();
    } catch (error) {
      console.error("Ошибка при удалении:", error);
    }
  };

  return (
    <div className="bg-gray-100 px-4 pt-10 pb-20">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-blue-800 text-center">
          {editingId ? "Редактировать тариф ЦАХ" : "Добавить тариф ЦАХ"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <input
            type="number"
            value={code}
            onChange={(e) => setCode(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            placeholder="Код тарифа"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            placeholder="Описание тарифа"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            {editingId ? "Сохранить" : "Добавить"}
          </button>
        </form>

        <ul className="space-y-3">
          {codes.map((cax) => (
            <li
              key={cax.id}
              className="flex justify-between items-center border-b pb-2"
            >
              <div>
                <span className="font-medium">{cax.cax_code}</span> —{" "}
                <span>{cax.cax_name}</span>
              </div>
              <div className="space-x-3">
                <button
                  type="button"
                  onClick={() => handleEdit(cax)}
                  className="text-yellow-600 hover:underline"
                >
                  ✏️ Редактировать
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(cax.id)}
                  className="text-red-600 hover:underline"
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
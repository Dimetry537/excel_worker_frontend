import { useEffect, useState } from "react";
import {
  createCaxCode,
  getCaxCodes,
  updateCaxCode,
  deleteCaxCode,
  toggleCaxCodeActive,
} from "@/api/caxCodes";
import type { CaxCode } from "@/types/entities/caxCode";

export default function CaxCodesForm() {
  const [codes, setCodes] = useState<CaxCode[]>([]);
  const [code, setCode] = useState<number | "">("");
  const [description, setDescription] = useState<string>("");
  const [quantityOfDays, setQuantityOfDays] = useState<number | "">("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("");
  const [showInactive, setShowInactive] = useState<boolean>(false);

  const fetchCaxCodes = async () => {
    try {
      const data = await getCaxCodes();
      setCodes(data);
      setMessage("");
    } catch (error) {
      setMessage("Ошибка загрузки ЦАХ: " + (error instanceof Error ? error.message : "Неизвестная ошибка"));
    }
  };

  useEffect(() => {
    fetchCaxCodes();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (code === "" || isNaN(Number(code))) {
      setMessage("Введите числовой код тарифа");
      return;
    }
    if (quantityOfDays === "" || isNaN(Number(quantityOfDays)) || Number(quantityOfDays) < 0) {
      setMessage("Введите корректное количество дней госпитализации");
      return;
    }

    try {
      const payload = {
        cax_code: Number(code),
        cax_name: description,
        quantity_of_days: Number(quantityOfDays),
      };
      if (editingId !== null) {
        await updateCaxCode(editingId, payload);
        setMessage("Тариф успешно обновлен");
        setEditingId(null);
      } else {
        await createCaxCode(payload);
        setMessage("Тариф успешно добавлен");
      }
      setCode("");
      setDescription("");
      setQuantityOfDays("");
      await fetchCaxCodes();
    } catch (error) {
      setMessage("Ошибка при сохранении: " + (error instanceof Error ? error.message : "Неизвестная ошибка"));
    }
  };

  const handleEdit = (cax: CaxCode) => {
    setEditingId(cax.id);
    setCode(cax.cax_code);
    setDescription(cax.cax_name);
    setQuantityOfDays(cax.quantity_of_days);
    setMessage("");
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Удалить ЦАХ?")) return;
    try {
      const deleted = await deleteCaxCode(id);
      if (!deleted.is_active) {
        setMessage("Код не удален, так как связан с медицинскими историями. Код переведен в статус 'неактивный'.");
      } else {
        setMessage("Тариф успешно удален");
      }
      await fetchCaxCodes();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка";
      if (errorMessage.includes("400")) {
        setMessage("Код не удален, так как связан с медицинскими историями. Код переведен в статус 'неактивный'.");
        await fetchCaxCodes();
      } else {
        setMessage("Ошибка при удалении: " + errorMessage);
      }
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      const toggled = await toggleCaxCodeActive(id);
      setMessage(`Тариф ${toggled.is_active ? "активирован" : "деактивирован"}`);
      await fetchCaxCodes();
    } catch (error) {
      setMessage("Ошибка при переключении статуса: " + (error instanceof Error ? error.message : "Неизвестная ошибка"));
    }
  };

  return (
    <div>
      <div>
        <h2>{editingId ? "Редактировать тариф ЦАХ" : "Добавить тариф ЦАХ"}</h2>
        {message && <p>{message}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            value={code}
            onChange={(e) =>
              setCode(e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="Код тарифа"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Описание тарифа"
          />
          <input
            type="number"
            value={quantityOfDays}
            onChange={(e) =>
              setQuantityOfDays(e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="Количество дней госпитализации"
            min={0}
          />
          <button type="submit">
            {editingId ? "Сохранить" : "Добавить"}
          </button>
        </form>
        <div>
          <label>
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            Показать скрытые
          </label>
        </div>
        <ul>
          {codes
            .filter((cax) => showInactive || cax.is_active)
            .map((cax) => (
              <li key={cax.id}>
                <div>
                  <span>{cax.cax_code}</span> — <span>{cax.cax_name}</span> —{" "}
                  <span>Дней госпитализации: {cax.quantity_of_days}</span> —{" "}
                  <span>Статус: {cax.is_active ? "Активен" : "Неактивен"}</span>
                </div>
                <div>
                  <button type="button" onClick={() => handleEdit(cax)}>
                    ✏️ Редактировать
                  </button>
                  <button type="button" onClick={() => handleDelete(cax.id)}>
                    🗑 Удалить
                  </button>
                  <button type="button" onClick={() => handleToggleActive(cax.id)}>
                    🔄 {cax.is_active ? "Деактивировать" : "Активировать"}
                  </button>
                </div>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
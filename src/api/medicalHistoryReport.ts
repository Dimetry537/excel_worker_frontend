import { api } from "@/api/client";
import { toast } from "sonner";

export const startGenerateMedicalHistoryReport = async (historyId: number) => {
  return api<{ task_id: string }>(`/medical_history/${historyId}/report_async`, {
    method: "POST",
  });
};

export const startGenerateOperationReport = async (operationId: number) => {
  return api<{ task_id: string }>(`/medical_history/operations/${operationId}/report_async`, {
    method: "POST",
  });
};

export const pollReportTask = async (
  taskId: string,
  endpoint: "report_task" | "operation_report_task",
  filename: string,
  toastId: string = "report-toast"
) => {
  const check = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/${endpoint}/${taskId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });

      if (!response.ok) {
        setTimeout(check, 2000);
        return;
      }

      toast.dismiss(toastId);
      toast.success("Отчёт готов!");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.dismiss(toastId);
      toast.error("Ошибка при проверке статуса отчёта");
    }
  };

  setTimeout(check, 2000);
};

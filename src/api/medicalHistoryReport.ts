import { api, ApiError } from "@/api/client";
import { toast } from "sonner";

export const startGenerateMedicalHistoryReport = async (historyId: number) => {
  return api<{ task_id: string }>(`/medical_history/${historyId}/report-async`, {
    method: "POST",
  });
};

export const startGenerateOperationReport = async (operationId: number) => {
  return api<{ task_id: string }>(`/medical_history/operations/${operationId}/report-async`, {
    method: "POST",
  });
};

export const getReportTaskResult = async (taskId: string): Promise<Blob> => {
  return api<Blob>(`/medical_history/report-task/${taskId}`, {
    responseType: "blob",
  });
};

export const pollReportTask = async (
  taskId: string,
  filename: string,
  toastId: string = "report-toast" // оставь дефолт, если хочешь
) => {
  const check = async () => {
    try {
      const blob = await getReportTaskResult(taskId);

      toast.dismiss(toastId); // теперь точно закроется нужный тост
      toast.success("Отчёт готов!");

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 202) {
        setTimeout(check, 2000);
        return;
      }

      toast.dismiss(toastId);
      toast.error("Ошибка при генерации отчёта");
    }
  };

  setTimeout(check, 2000);
};

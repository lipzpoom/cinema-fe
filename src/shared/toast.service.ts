import { useToast } from "primevue/usetoast";

export const useAppToast = () => {
  const toast = useToast();

  const showSuccess = (
    detail: string,
    summary: string = "Success",
    life: number = 3000,
  ) => {
    toast.add({ severity: "success", summary, detail, life });
  };

  const showInfo = (
    detail: string,
    summary: string = "Info",
    life: number = 3000,
  ) => {
    toast.add({ severity: "info", summary, detail, life });
  };

  const showWarn = (
    detail: string,
    summary: string = "Warning",
    life: number = 3000,
  ) => {
    toast.add({ severity: "warn", summary, detail, life });
  };

  const showError = (
    detail: string,
    summary: string = "Error",
    life: number = 3000,
  ) => {
    toast.add({ severity: "error", summary, detail, life });
  };

  return {
    showSuccess,
    showInfo,
    showWarn,
    showError,
  };
};

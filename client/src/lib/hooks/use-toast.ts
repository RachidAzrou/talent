import { Toast, toastStore, type ToastSettings } from "@/hooks/use-toast";

export const useToast = () => {
  const toast = (settings: ToastSettings) => {
    // Generate a unique ID for the toast
    const id = crypto.randomUUID();
    // Add the toast with the generated ID
    const newToast: Toast = {
      ...settings,
      id,
      open: true,
    };
    
    toastStore.add(newToast);
    
    return {
      id,
      dismiss: () => toastStore.dismiss(id),
      update: (settings: ToastSettings) => {
        toastStore.update({
          ...settings,
          id,
        });
      },
    };
  };

  return { toast };
};
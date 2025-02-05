export interface StatusMessageProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number; // Время отображения в миллисекундах
}

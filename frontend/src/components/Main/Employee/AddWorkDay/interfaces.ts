export interface AddWorkPropsI {
  date: Date;
  isEditable: boolean;
  startTime: string;
  endTime: string;
  isOffice: boolean;
  id: number;
  status: string; // "В ожидании" | "Отказ" | "Согласовано" | "";
}

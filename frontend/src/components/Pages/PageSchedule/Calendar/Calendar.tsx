import { Calendar as ReactCalendar } from "react-calendar";
import styles from "./Calendar.module.css";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece]; // Диапазон дат

interface CalendarProps {
  value: Value;
  onChange: (newDate: Value) => void;
}

function Calendar({ value, onChange }: CalendarProps) {
  return (
    <div className={styles.main}>
      <ReactCalendar
        className={styles["react-calendar"]} // Исправленный стиль
        onChange={onChange}
        value={value}
      />
    </div>
  );
}

export default Calendar;

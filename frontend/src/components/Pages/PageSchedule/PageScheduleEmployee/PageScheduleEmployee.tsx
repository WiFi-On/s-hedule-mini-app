import styles from "./PageScheduleEmployee.module.css";
import Calendar from "../Calendar/Calendar";
import AddWorkDay from "./AddWorkDay/AddWorkDay";
import { useEffect, useState } from "react";
import { ScheduleI } from "./PageScheduleEmployee.interfaces";
import axios from "axios";
import { useTelegram } from "../../../../hooks/useTelegram";
import { useDispatch } from "react-redux";
import { showStatus } from "../../../../redux/statusSlise";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece]; // Диапазон дат

function PageScheduleEmployee() {
  const [date, setDate] = useState<Value>(new Date()); // Изначально установлена одна дата
  const [workDay, setWorkDay] = useState<ScheduleI>({
    id: -1,
    start_time: "",
    end_time: "",
    date: new Date(),
    office: false,
    status: "",
  });
  const { initData } = useTelegram();
  const dispatch = useDispatch();

  // Преобразуем дату в тип Date, если это не диапазон
  const selectedDate = Array.isArray(date) ? date[0] : date; // Берем первую дату из диапазона, если это массив
  const handleDateChange = (newDate: Value) => {
    console.log("newDate", newDate);
    setDate(newDate); // Передаем новую дату или диапазон дат
  };

  useEffect(() => {
    const getSchedule = async (): Promise<ScheduleI[] | undefined> => {
      try {
        const formattedDate = selectedDate
          ? new Date(
              selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000
            )
              .toISOString()
              .split("T")[0]
          : "";

        const { data } = await axios.get<ScheduleI[]>(
          `${process.env.REACT_APP_API_URL}/api/v1/schedule`,
          {
            headers: { "x-init-data": initData },
            params: { date: formattedDate },
          }
        );

        return data;
      } catch (err) {
        dispatch(
          showStatus({
            message: "Ошибка при получении рабочего дня",
            type: "error",
          })
        );
      }
    };

    getSchedule().then((data) => {
      if (data && data.length > 0) {
        setWorkDay(data[0]);
      } else {
        setWorkDay({
          id: -1,
          start_time: "",
          end_time: "",
          date: new Date(),
          office: false,
          status: "",
        });
      }
    });
  }, [selectedDate, initData, dispatch]);

  const todayTime = new Date().setHours(0, 0, 0, 0); // Обнулённая копия текущей даты
  const isEditable =
    new Date(workDay.date).setHours(0, 0, 0, 0) >= todayTime &&
    (workDay.status === "В ожидании" || workDay.status === ""); // Проверка на сегодня или позже и статус

  const startTime = workDay.start_time.split(":");
  const endTime = workDay.end_time.split(":");

  return (
    <div className={styles.main}>
      <Calendar value={date} onChange={handleDateChange} />
      <AddWorkDay
        date={selectedDate}
        isEditable={isEditable}
        startTime={startTime[0] + ":" + startTime[1]}
        endTime={endTime[0] + ":" + endTime[1]}
        isOffice={workDay.office}
        id={workDay.id}
        status={workDay.status}
      />
    </div>
  );
}

export default PageScheduleEmployee;

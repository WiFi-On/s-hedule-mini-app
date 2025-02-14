import styles from "./PageScheduleAdmin.module.css";
import Calendar from "../Calendar/Calendar";
import { useEffect, useState } from "react";
import { ScheduleI } from "./PageSheduleAdmin.interfaces";
import axios from "axios";
import { useTelegram } from "../../../../hooks/useTelegram";
import { useDispatch } from "react-redux";
import { showStatus } from "../../../../redux/statusSlise";
import ChoiceWorkDay from "./ChoiceWorkDay/ChoiceWorkDay";
import Loader from "../../../Loader/Loader";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece]; // Диапазон дат

function PageScheduleAdmin() {
  const [date, setDate] = useState<Value>(new Date()); // Изначально установлена одна дата
  const [workDays, setWorkDays] = useState<ScheduleI[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { initData } = useTelegram();
  const dispatch = useDispatch();

  // Преобразуем дату в тип Date, если это не диапазон
  const selectedDate = Array.isArray(date) ? date[0] : date; // Берем первую дату из диапазона, если это массив
  const handleDateChange = (newDate: Value) => {
    setDate(newDate); // Передаем новую дату или диапазон дат
  };

  useEffect(() => {
    const getSchedule = async (): Promise<ScheduleI[] | undefined> => {
      try {
        setIsLoading(true); // Устанавливаем флаг загрузки в true перед запросом
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
            message: "Ошибка при редактировании рабочего дня",
            type: "error",
          })
        );
      } finally {
        setIsLoading(false); // После завершения запроса (успех или ошибка) устанавливаем флаг загрузки в false
      }
    };

    getSchedule().then((data) => {
      if (data && data.length > 0) {
        setWorkDays(data);
      } else {
        setWorkDays(null);
      }
    });
  }, [selectedDate, initData, dispatch]);

  return (
    <div className={styles.main}>
      <Calendar value={date} onChange={handleDateChange} />
      <div className={styles.workDays}>
        {isLoading ? (
          <Loader />
        ) : workDays ? (
          workDays.map((workDay) => (
            <ChoiceWorkDay
              key={workDay.id}
              id={workDay.id}
              user={workDay.user}
              status={workDay.status}
              start_time={workDay.start_time}
              end_time={workDay.end_time}
              office={workDay.office}
              isEditable={true}
            />
          ))
        ) : (
          <p className={styles.noWorkDays}>
            Нет рабочих дней на выбранную дату
          </p>
        )}
      </div>
    </div>
  );
}

export default PageScheduleAdmin;

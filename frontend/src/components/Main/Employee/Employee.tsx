import styles from "./Employee.module.css";
import AddWorkDay from "./AddWorkDay/AddWorkDay";
import { useState, useEffect } from "react";
import axios from "axios";
import { useTelegram } from "../../../hooks/useTelegram";
import { ScheduleI } from "./interfaces";

// Функция для добавления дат в массив объектов
const fillMissingDates = (inputArray: ScheduleI[]): ScheduleI[] => {
  const today = new Date();

  const filledArray = [...inputArray];
  const existingDates = new Set(inputArray.map((item) => item.date));

  // Перебираем каждый день в диапазоне от сегодня до сегодня + 30 дней
  for (let i = 0; i <= 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i); // Увеличиваем дату на i дней

    const dateString = date.toISOString().split("T")[0]; // Форматируем дату в "YYYY-MM-DD"

    // Если такой даты нет в исходном массиве, добавляем её
    if (!existingDates.has(dateString)) {
      filledArray.push({
        id: -1,
        date: date,
        start_time: "",
        end_time: "",
        status: "",
        office: false,
      });
    }
  }

  // Сортируем массив по дате
  filledArray.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return filledArray;
};

const Employee = () => {
  const [schedule, setSchedule] = useState<ScheduleI[]>([]);
  const { initData } = useTelegram();

  // Получаем данные с сервера
  useEffect(() => {
    const getSchedule = async (): Promise<ScheduleI[] | undefined> => {
      try {
        const req = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/schedule`,
          {
            headers: {
              "x-init-data": initData,
            },
          }
        );

        return req.data;
      } catch (err) {
        console.error("Ошибка при загрузке расписания:", err);
      }
    };

    getSchedule().then((data) => {
      if (data) {
        setSchedule(fillMissingDates(data));
      } else {
        setSchedule([]);
      }
    });
  }, [initData]);

  return (
    <div className={styles.main}>
      {schedule.map((sch, index) => {
        const todayTime = new Date().setHours(0, 0, 0, 0); // Обнулённая копия текущей даты
        const isEditable =
          new Date(sch.date).setHours(0, 0, 0, 0) >= todayTime &&
          (sch.status === "В ожидании" || sch.status === ""); // Проверка на сегодня или позже и статус

        const startTime = sch.start_time.split(":");
        const endTime = sch.end_time.split(":");

        return (
          <AddWorkDay
            isEditable={isEditable}
            key={index}
            status={sch.status}
            id={sch.id}
            date={new Date(sch.date)}
            startTime={startTime[0] + ":" + startTime[1]}
            endTime={endTime[0] + ":" + endTime[1]}
            isOffice={sch.office}
          />
        );
      })}
    </div>
  );
};

export default Employee;

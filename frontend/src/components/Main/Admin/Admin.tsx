import React, { useEffect, useState } from "react";
import styles from "./Admin.module.css";
import ChoiceWorkDay from "./ChoiceWorkDay/ChoiceWorkDay";
import axios from "axios";
import { useTelegram } from "../../../hooks/useTelegram";

const Admin = (): JSX.Element => {
  const [groupedSchedule, setGroupedSchedule] = useState<Record<string, any[]>>(
    {}
  );
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set()); // Для отслеживания открытых групп
  const { initData } = useTelegram();

  // Получаем данные с сервера
  const getSchedule = async (query: any): Promise<void> => {
    try {
      const headers = {
        "x-init-data": initData,
      };

      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/schedule`,
        {
          headers,
          params: query,
        }
      );

      setGroupedSchedule(data); // Сохраняем объект с данными от сервера
    } catch (err) {
      console.error("Ошибка при загрузке расписания:", err);
    }
  };

  useEffect(() => {
    getSchedule({ initData: initData, dateObject: true });
  }, [initData]);

  // Обработка открытия/закрытия группы
  const toggleGroup = (date: string) => {
    setOpenGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date); // Если группа открыта, закрываем её
      } else {
        newSet.add(date); // Если группа закрыта, открываем её
      }
      return newSet;
    });
  };

  return (
    <div className={styles.main}>
      {Object.entries(groupedSchedule).map(([date, workDays]) => (
        <div key={date} className={styles.group}>
          {/* Заголовок группы */}
          <div
            className={styles.groupHeader}
            onClick={() => toggleGroup(date)} // Событие клика на блок
          >
            <p className={styles.date}>
              {date}[
              {new Intl.DateTimeFormat("ru", { weekday: "short" }).format(
                new Date(date)
              )}
              ]
            </p>
            {/* Отображаем статус прямо в заголовке */}
            <span>{openGroups.has(date) ? "▲" : "▼"}</span>
          </div>
          {/* Список объектов, если группа открыта */}
          {openGroups.has(date) && (
            <div className={styles.groupContent}>
              {workDays.map((workDay) => (
                <ChoiceWorkDay
                  isEditable={new Date(date) >= new Date(Date.now() + 86400000)}
                  key={workDay.id}
                  user={workDay.user}
                  id={workDay.id}
                  start_time={workDay.start_time}
                  end_time={workDay.end_time}
                  office={workDay.office}
                  status={workDay.status}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Admin;

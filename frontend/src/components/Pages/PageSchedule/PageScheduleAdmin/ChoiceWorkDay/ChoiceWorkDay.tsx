import React, { useState } from "react";
import styles from "./ChoiceWorkDay.module.css";
import workDayProps from "./ChoiceWorkDay.interface";
import axios from "axios";
import { useTelegram } from "../../../../../hooks/useTelegram";

const ChoiceWorkDay = ({
  id,
  user,
  status,
  start_time,
  end_time,
  office,
  isEditable,
}: workDayProps): JSX.Element => {
  const [statusState, setStatusState] = useState<string>(status); // Текущее состояние статуса
  const { initData } = useTelegram();

  start_time = start_time.split(":")[0] + ":" + start_time.split(":")[1];
  end_time = end_time.split(":")[0] + ":" + end_time.split(":")[1];

  // Функция для обновления статуса на сервере
  const updateStatus = async (newStatus: string) => {
    if (!isEditable) return;
    try {
      // Отправка данных на сервер
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/schedule/update/StatusWorkDay`,
        {
          id,
          status: newStatus,
        },
        {
          headers: {
            "x-init-data": initData,
          },
        }
      );
      setStatusState(newStatus); // Обновляем локальное состояние
    } catch (error) {
      console.error("Ошибка при обновлении статуса:", error);
    }
  };

  return (
    <div
      className={`${styles.workDay} ${
        statusState === "Согласовано"
          ? styles.approved
          : statusState === "Отказ"
          ? styles.rejected
          : ""
      }`}
    >
      {/* Информация о рабочем дне */}
      <div className={styles.info}>
        <div className={styles.fio}>
          {user.first_name} {user.last_name} {user.middle_name || ""}
        </div>
        <div className={styles.timeAndGeo}>
          <div className={styles.time}>
            {start_time} - {end_time}
          </div>
          <div className={styles.geoWork}>
            {office ? "🏢 Офис" : "🏡 Удаленно"}
          </div>
        </div>
      </div>

      {/* Панель для редактирования статуса */}
      {isEditable && (
        <div className={styles.editStatus}>
          <div
            className={`${styles.confirm} ${
              statusState === "Согласовано" ? styles.active : ""
            }`}
            onClick={() => updateStatus("Согласовано")}
          >
            Подтверждено
          </div>
          <div
            className={`${styles.refusal} ${
              statusState === "Отказ" ? styles.active : ""
            }`}
            onClick={() => updateStatus("Отказ")}
          >
            Отказано
          </div>
        </div>
      )}
    </div>
  );
};

export default ChoiceWorkDay;

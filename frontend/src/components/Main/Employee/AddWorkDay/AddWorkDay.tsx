import React, { useState, useEffect } from "react";
import styles from "./AddWorkDay.module.css";
import { AddWorkPropsI } from "./interfaces";
import { useTelegram } from "../../../../hooks/useTelegram";
import axios from "axios";

const AddWorkDay = ({
  date,
  isEditable,
  startTime,
  endTime,
  status,
  isOffice,
  id,
}: AddWorkPropsI) => {
  const [selectedStart, setSelectedStart] = useState<string | null>(startTime);
  const [selectedEnd, setSelectedEnd] = useState<string | null>(endTime);
  const [workOffice, setWorkOffice] = useState<boolean>(isOffice);
  const [activeState, setActiveState] = useState<boolean>(false);
  const [idWorkDay, setIdWorkDay] = useState<number>(id);
  const { initData } = useTelegram();

  const times: string[] = [
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
  ];

  const onClick = () => {
    setActiveState(!activeState); // Всегда можно открыть/закрыть
  };

  const handleTimeClick = (time: string) => {
    if (!isEditable) return; // если нельзя редактировать, игнорируем клики

    if (!selectedStart && !selectedEnd) {
      setSelectedStart(time);
      return;
    }

    if (selectedStart && !selectedEnd) {
      if (selectedStart === time) {
        setSelectedStart(null);
      } else {
        const startIndex = times.indexOf(selectedStart);
        const endIndex = times.indexOf(time);

        if (Math.abs(endIndex - startIndex) >= 3) {
          if (startIndex < endIndex) {
            setSelectedEnd(time);
          } else {
            setSelectedEnd(selectedStart);
            setSelectedStart(time);
          }
        } else {
          alert("Диапазон должен быть минимум 4 часа.");
        }
      }
    } else {
      setSelectedStart(time);
      setSelectedEnd(null);
    }
  };

  const handleWorkLocationTrue = () => {
    if (isEditable) {
      setWorkOffice(true);
    }
  };

  const handleWorkLocationFalse = () => {
    if (isEditable) {
      setWorkOffice(false);
    }
  };

  const isInRange = (time: string): boolean => {
    if (!selectedStart || !selectedEnd) return false;

    const startIndex = times.indexOf(selectedStart);
    const endIndex = times.indexOf(selectedEnd);
    const currentIndex = times.indexOf(time);

    const [min, max] = [
      Math.min(startIndex, endIndex),
      Math.max(startIndex, endIndex),
    ];
    return currentIndex >= min && currentIndex <= max;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!selectedStart || !selectedEnd || !isEditable) return;
    const payload = {
      startTime: selectedStart,
      endTime: selectedEnd,
      date: date.toISOString().split("T")[0],
      officeWork: workOffice,
    };
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/schedule/add/WorkDay`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            "x-init-data": initData,
          },
        }
      );

      console.log(response.data.id);
      setIdWorkDay(response.data.id);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!id || !isEditable) return;
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/schedule/delete/WorkDay`,
        {
          data: { id },
          headers: {
            "Content-Type": "application/json",
            "x-init-data": initData,
          },
        }
      );

      setSelectedStart(null);
      setSelectedEnd(null);
      setIdWorkDay(-1);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleUpdate = async (): Promise<void> => {
    if (!id || !isEditable) return;
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/schedule/update/WorkDay`,
        {
          id,
          startTime: selectedStart,
          endTime: selectedEnd,
          officeWork: workOffice,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-init-data": initData,
          },
        }
      );
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div
      className={`${styles.main} ${
        activeState ? styles.active : styles.hidden
      }`}
    >
      <div className={styles.day} onClick={onClick}>
        {`${date.toISOString().split("T")[0]}[${date.toLocaleString("ru", {
          weekday: "short",
        })}]`}
      </div>
      {activeState && (
        <>
          {/* Проверка на isEditable для блокировки редактирования */}
          <div className={styles.times}>
            {times.map((time) => (
              <div
                key={time}
                className={`${styles.time} ${
                  time === selectedStart ||
                  time === selectedEnd ||
                  isInRange(time)
                    ? status === "В ожидании"
                      ? styles.pending
                      : status === "Отказ"
                      ? styles.rejected
                      : status === "Согласовано"
                      ? styles.approved
                      : styles.selected
                    : ""
                }`}
                onClick={() => isEditable && handleTimeClick(time)} // блокировка редактирования
              >
                {time}
              </div>
            ))}
          </div>
          <div className={styles.location}>
            <div className={styles.geoGroup}>
              <div
                className={
                  workOffice
                    ? status === "В ожидании"
                      ? styles.pending
                      : status === "Отказ"
                      ? styles.rejected
                      : status === "Согласовано"
                      ? styles.approved
                      : styles.selected
                    : ""
                }
                onClick={handleWorkLocationTrue}
              >
                Офис
              </div>
              <div
                className={
                  !workOffice
                    ? status === "В ожидании"
                      ? styles.pending
                      : status === "Отказ"
                      ? styles.rejected
                      : status === "Согласовано"
                      ? styles.approved
                      : styles.selected
                    : ""
                }
                onClick={handleWorkLocationFalse}
              >
                Дома
              </div>
            </div>
          </div>
          {isEditable && ( // Блокируем кнопку отправки, если нельзя редактировать
            <div className={styles.actions}>
              <button
                className={styles.submitButton}
                onClick={idWorkDay === -1 ? handleSubmit : handleUpdate}
                disabled={!selectedStart || !selectedEnd}
              >
                Отправить
              </button>
              <button
                className={styles.deleteButton}
                onClick={handleDelete}
                disabled={idWorkDay < 0}
              >
                Удалить
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AddWorkDay;

import React, { useState, useCallback, useEffect, FC } from "react";
import styles from "./AddWorkDay.module.css";
import { AddWorkPropsI } from "./interfaces";
import { useTelegram } from "../../../../../hooks/useTelegram";
import axios from "axios";
import { useDispatch } from "react-redux";
import { showStatus } from "../../../../../redux/statusSlise";
import { motion, AnimatePresence } from "framer-motion";

// Константа для минимальной разницы (4 часа => разница минимум 3)
const MIN_TIME_DIFF = 3;

// Массив доступных временных интервалов (вынесен вне компонента, чтобы не пересоздавался при каждом рендере)
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

const AddWorkDay: FC<AddWorkPropsI> = ({
  date,
  isEditable,
  startTime,
  endTime,
  status,
  isOffice,
  id,
}) => {
  // Локальное состояние для выбранных времен, места работы, состояния отображения и id рабочего дня
  const [selectedStart, setSelectedStart] = useState<string | null>(startTime);
  const [selectedEnd, setSelectedEnd] = useState<string | null>(endTime);
  const [workOffice, setWorkOffice] = useState<boolean>(isOffice);
  const [statusWork, setStatusWork] = useState<string>(status);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [workDayId, setWorkDayId] = useState<number>(id);

  // Объединение эффекта для синхронизации пропсов с состоянием
  useEffect(() => {
    setSelectedStart(startTime);
    setSelectedEnd(endTime);
    setWorkOffice(isOffice);
    setWorkDayId(id);
    setStatusWork(status);
  }, [startTime, endTime, isOffice, id, status]);

  const { initData } = useTelegram();
  const dispatch = useDispatch();

  // Обработчик для переключения видимости деталей (развернуто/свернуто)
  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  // Обработчик клика по времени
  const handleTimeClick = useCallback(
    (time: string) => {
      if (!isEditable) return;

      // Если ни время начала, ни конца не выбраны – выбираем время начала
      if (!selectedStart && !selectedEnd) {
        setSelectedStart(time);
        return;
      }

      // Если выбрано только время начала
      if (selectedStart && !selectedEnd) {
        // Если повторный клик по тому же времени – сбрасываем выбор
        if (selectedStart === time) {
          setSelectedStart(null);
          return;
        }
        const startIndex = times.indexOf(selectedStart);
        const clickedIndex = times.indexOf(time);
        // Проверяем, что разница между выбранными временами достаточная
        if (Math.abs(clickedIndex - startIndex) >= MIN_TIME_DIFF) {
          // Если время клика позже выбранного – устанавливаем его как конец
          if (startIndex < clickedIndex) {
            setSelectedEnd(time);
          } else {
            // Если время клика раньше – меняем местами
            setSelectedEnd(selectedStart);
            setSelectedStart(time);
          }
        } else {
          dispatch(
            showStatus({
              message: "Диапазон должен быть минимум 4 часа.",
              type: "error",
            })
          );
        }
        return;
      }

      // Если уже выбраны и время начала, и конца – начинаем выбор заново
      setSelectedStart(time);
      setSelectedEnd(null);
    },
    [dispatch, isEditable, selectedStart, selectedEnd]
  );

  // Проверка, находится ли время внутри выбранного диапазона
  const isInRange = useCallback(
    (time: string): boolean => {
      if (!selectedStart || !selectedEnd) return false;
      const startIndex = times.indexOf(selectedStart);
      const endIndex = times.indexOf(selectedEnd);
      const currentIndex = times.indexOf(time);
      const [minIndex, maxIndex] = [
        Math.min(startIndex, endIndex),
        Math.max(startIndex, endIndex),
      ];
      return currentIndex >= minIndex && currentIndex <= maxIndex;
    },
    [selectedStart, selectedEnd]
  );

  // Функция для вычисления класса для временного блока с учётом статуса
  const getTimeClass = useCallback(
    (time: string): string => {
      const isSelected =
        time === selectedStart || time === selectedEnd || isInRange(time);
      let timeClass = styles.time;
      if (isSelected) {
        // Если выбран, то меняем стиль в зависимости от статуса
        switch (statusWork) {
          case "В ожидании":
            timeClass += ` ${styles.pending}`;
            break;
          case "Отказ":
            timeClass += ` ${styles.rejected}`;
            break;
          case "Согласовано":
            timeClass += ` ${styles.approved}`;
            break;
          default:
            timeClass += ` ${styles.selected}`;
        }
      }
      return timeClass;
    },
    [selectedStart, selectedEnd, isInRange, statusWork]
  );

  // Заголовки для axios-запросов (используются везде, чтобы не дублировать)
  const apiHeaders = {
    "Content-Type": "application/json",
    "x-init-data": initData,
  };

  // Обработчик отправки данных (создание нового рабочего дня)
  const handleSubmit = async (): Promise<void> => {
    if (!(date instanceof Date)) return; // Проверяем, что date - это объект Date

    const formattedDate = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    )
      .toISOString()
      .split("T")[0];

    const payload = {
      startTime: selectedStart,
      endTime: selectedEnd,
      date: formattedDate, // Используем нормализованную дату
      officeWork: workOffice,
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/schedule/add/WorkDay`,
        payload,
        { headers: apiHeaders }
      );
      dispatch(
        showStatus({
          message: "Рабочий день успешно добавлен",
          type: "success",
        })
      );
      setWorkDayId(response.data.id); // Обновляем ID рабочего дня
      setStatusWork(response.data.status); // Обновляем статус рабочего дня
    } catch (error) {
      dispatch(
        showStatus({
          message: "Ошибка при добавлении рабочего дня",
          type: "error",
        })
      );
    }
  };
  // Обработчик обновления данных рабочего дня
  const handleUpdate = async (): Promise<void> => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/schedule/update/WorkDay`,
        {
          id: workDayId,
          startTime: selectedStart,
          endTime: selectedEnd,
          officeWork: workOffice,
        },
        { headers: apiHeaders }
      );
      dispatch(
        showStatus({
          message: "Рабочий день успешно обновлен",
          type: "success",
        })
      );
    } catch (error) {
      dispatch(
        showStatus({
          message: "Ошибка при редактировании рабочего дня",
          type: "error",
        })
      );
    }
  };
  // Обработчик удаления рабочего дня
  const handleDelete = async (): Promise<void> => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/schedule/delete/WorkDay`,
        {
          data: { id: workDayId },
          headers: apiHeaders,
        }
      );
      dispatch(
        showStatus({
          message: "Рабочий день успешно удален",
          type: "success",
        })
      );
      // Сброс локального состояния после удаления
      setSelectedStart(null);
      setSelectedEnd(null);
      setWorkDayId(-1);
    } catch (error) {
      dispatch(
        showStatus({
          message: "Ошибка при удалении рабочего дня",
          type: "error",
        })
      );
    }
  };

  const handleAction = async (): Promise<void> => {
    if (!selectedStart || !selectedEnd) {
      // Если время сброшено, удаляем рабочий день
      if (workDayId !== -1) {
        handleDelete();
      }
      return;
    }

    if (workDayId === -1) {
      // Если рабочий день еще не создан, создаем его
      handleSubmit();
    } else {
      handleUpdate();
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

  return (
    <div
      className={`${styles.main} ${isExpanded ? styles.active : styles.hidden}`}
    >
      {/* Заголовок дня, по клику разворачивается/сворачивается */}
      <div className={styles.day} onClick={toggleExpanded}>
        {date instanceof Date ? date.toLocaleDateString() : date}
        <motion.span
          className={styles.arrow}
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg
            className={styles.arrow}
            width="8px"
            height="8px"
            viewBox="0 0 284.929 284.929"
          >
            <g>
              <path
                d="M282.082,76.511l-14.274-14.273c-1.902-1.906-4.093-2.856-6.57-2.856c-2.471,0-4.661,0.95-6.563,2.856L142.466,174.441
        L30.262,62.241c-1.903-1.906-4.093-2.856-6.567-2.856c-2.475,0-4.665,0.95-6.567,2.856L2.856,76.515C0.95,78.417,0,80.607,0,83.082
        c0,2.473,0.953,4.663,2.856,6.565l133.043,133.046c1.902,1.903,4.093,2.854,6.567,2.854s4.661-0.951,6.562-2.854L282.082,89.647
        c1.902-1.903,2.847-4.093,2.847-6.565C284.929,80.607,283.984,78.417,282.082,76.511z"
              />
            </g>
          </svg>
        </motion.span>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className={styles.content}
            initial={{ height: 0, opacity: 0, y: 10 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
          >
            {/* Блок выбора времени */}
            <div className={styles.times}>
              {times.map((time) => (
                <motion.div
                  key={time}
                  className={getTimeClass(time)}
                  onClick={() => isEditable && handleTimeClick(time)}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {time}
                </motion.div>
              ))}
            </div>

            {/* Блок выбора места работы */}
            <div className={styles.location}>
              <div
                className={
                  workOffice
                    ? statusWork === "В ожидании"
                      ? styles.pending
                      : statusWork === "Отказ"
                      ? styles.rejected
                      : statusWork === "Согласовано"
                      ? styles.approved
                      : styles.selected
                    : styles.default
                }
                onClick={handleWorkLocationTrue}
              >
                Офис
              </div>
              <div
                className={
                  !workOffice
                    ? statusWork === "В ожидании"
                      ? styles.pending
                      : statusWork === "Отказ"
                      ? styles.rejected
                      : statusWork === "Согласовано"
                      ? styles.approved
                      : styles.selected
                    : styles.default
                }
                onClick={handleWorkLocationFalse}
              >
                Дома
              </div>
            </div>

            {/* Кнопка сохранения */}
            {isEditable && (
              <button className={styles.save} onClick={handleAction}>
                Сохранить
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddWorkDay;

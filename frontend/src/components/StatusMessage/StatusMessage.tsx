import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store";
import { hideStatus } from "../../redux/statusSlise";
import styles from "./StatusMessage.module.css";

const StatusMessage = () => {
  const dispatch = useDispatch();
  const { message, type, visible } = useSelector(
    (state: RootState) => state.status
  );
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);

      // Сначала делаем плавное исчезновение, потом скрываем
      const fadeOutTimer = setTimeout(() => setIsVisible(false), 1500); // Начинаем скрытие через 2.5 сек
      const hideTimer = setTimeout(() => dispatch(hideStatus()), 2000); // Удаляем через 3 сек

      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [visible, dispatch]);

  return (
    <div
      className={`${styles.statusMessage} ${styles[type]} ${
        isVisible ? styles.show : styles.hidden
      }`}
    >
      {message}
    </div>
  );
};

export default StatusMessage;

import { useEffect, useState } from "react";
import styles from "./App.module.css";
import { useTelegram } from "./hooks/useTelegram";
import Header from "./components/Header/Header";
import Employee from "./components/Main/Employee/Employee";
import Admin from "./components/Main/Admin/Admin";
import axios from "axios";

function App() {
  const { tg, initData } = useTelegram();
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    tg.ready();

    const checkIsAdmin = async () => {
      try {
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/v1/schedule/checkUser`,
          { initData }
        );

        setUser(data.result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    checkIsAdmin();
  }, [initData, tg]);

  if (!initData) {
    return <h1>Адрес предназначен для работы с Telegram mini app</h1>;
  }

  return (
    <div className={styles.main}>
      {loading ? (
        <h1></h1>
      ) : user !== null ? (
        <>
          <Header />
          {user === "admin" ? <Admin /> : <Employee />}
        </>
      ) : (
        <h1>Вас нет в базе пользователей</h1>
      )}
    </div>
  );
}

export default App;

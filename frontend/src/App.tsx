import { useEffect, useState } from "react";
import "./App.module.css";
import { useTelegram } from "./hooks/useTelegram";
import StatusMessage from "./components/StatusMessage/StatusMessage";
import axios from "axios";
import MenuNav from "./components/MenuNav/MenuNav";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import PageScheduleEmployee from "./components/Pages/PageSchedule/PageScheduleEmployee/PageScheduleEmployee";
import PageScheduleAdmin from "./components/Pages/PageSchedule/PageScheduleAdmin/PageScheduleAdmin";
import PageFines from "./components/Pages/PageFines/PageFines";
import PageMoney from "./components/Pages/PageMoney/PageMoney";
import PageProfile from "./components/Pages/PageProfile/PageProfile";
import PageReports from "./components/Pages/PageReports/PageReports";

import Loader from "./components/Loader/Loader";

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

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <Router>
          <StatusMessage />
          {user !== null ? (
            <div className="app-container">
              <Routes>
                <Route
                  path="/"
                  element={
                    user === "admin" ? (
                      <PageScheduleAdmin />
                    ) : (
                      <PageScheduleEmployee />
                    )
                  }
                />
                <Route path="/profile" element={<PageProfile />} />
                <Route path="/fines" element={<PageFines />} />
                <Route path="/reports" element={<PageReports />} />
                <Route path="/money" element={<PageMoney />} />
              </Routes>
              <MenuNav />
            </div>
          ) : (
            <h1>Вас нет в базе пользователей</h1>
          )}
          <StatusMessage />
        </Router>
      )}
    </>
  );
}

export default App;

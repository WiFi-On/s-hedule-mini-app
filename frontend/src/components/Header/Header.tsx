import styles from "./Header.module.css";
import { useTelegram } from "../../hooks/useTelegram";

const Header = (): JSX.Element => {
  const { user } = useTelegram();
  return (
    <header className={styles.header}>
      <h1>Привет, {user?.username}</h1>
    </header>
  );
};

export default Header;

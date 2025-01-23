const tg = window.Telegram.WebApp;

export function useTelegram() {
  const onClose = () => {
    tg.close();
  };

  const onToggleButton = () => {
    if (tg.MainButton.isVisible) {
      tg.MainButton.hile();
    } else {
      tg.MainButton.show();
    }
  };

  return {
    tg,
    user: tg.initDataUnsafe?.user,
    initData: tg.initData,
    onClose,
    onToggleButton,
  };
}

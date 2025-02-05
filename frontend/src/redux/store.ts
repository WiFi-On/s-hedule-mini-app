import { configureStore } from "@reduxjs/toolkit";
import statusReducer from "./statusSlise"; // Импортируем редьюсер статуса

export const store = configureStore({
  reducer: {
    status: statusReducer, // Добавляем в хранилище
  },
});

// Типы для использования в хуках
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface StatusState {
  message: string;
  type: "success" | "error" | "warning" | "info";
  visible: boolean;
}

const initialState: StatusState = {
  message: "",
  type: "info",
  visible: false,
};

const statusSlice = createSlice({
  name: "status",
  initialState,
  reducers: {
    showStatus: (
      state,
      action: PayloadAction<{
        message: string;
        type?: "success" | "error" | "warning" | "info";
      }>
    ) => {
      state.message = action.payload.message;
      state.type = action.payload.type || "info";
      state.visible = true;
    },
    hideStatus: (state) => {
      state.visible = false;
    },
  },
});

export const { showStatus, hideStatus } = statusSlice.actions;
export default statusSlice.reducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { login } from "../service";
import { RootState } from "../../../store";
import { ILogin } from "@/models/ILogin";

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  status: "idle" | "success" | "loading" | "failed";
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  status: "idle",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      localStorage.removeItem("token");
    },
    resetAuth: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<ILogin>) => {
        state.status = "success";
        state.isAuthenticated = true;
        state.token = action.payload.access_token;
        localStorage.setItem("token", action.payload.access_token);
      })
      .addCase(login.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export const { logout, resetAuth } = authSlice.actions;
export const selectAuth = (state: RootState) => state.auth;
export default authSlice.reducer;

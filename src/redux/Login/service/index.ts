import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../libs/interceptor";
import axios from "axios";

export interface LoginCredentials {
  email: string;
  password: string;
}

export const login = createAsyncThunk(
  "auth/login",
  async (data: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/auth/login`, {
        email: data.email,
        password: data.password,
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "An unknown error occurred";
        return rejectWithValue(errorMessage);
      } else {
        return rejectWithValue("An unknown error occurred");
      }
    }
  }
);

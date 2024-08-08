import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../libs/interceptor";
import axios from "axios";
import { IEmployee } from "@/models/IEmployee";

export const fetchAccount = createAsyncThunk(
  "account/fetch",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/accounts/account`, {
        params: { id },
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message;
        return rejectWithValue(errorMessage);
      }
    }
  }
);

export const fetchSkills = createAsyncThunk(
  "skills/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/skills`);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message;
        return rejectWithValue(errorMessage);
      }
    }
  }
);

export const updateEmployee = createAsyncThunk(
  "employee/update",
  async (
    {
      id,
      updateEmployeeDto,
    }: { id: string; updateEmployeeDto: Partial<IEmployee> },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.patch(
        `/employees/update/${id}`,
        updateEmployeeDto
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message;
        return rejectWithValue(errorMessage);
      }
    }
  }
);

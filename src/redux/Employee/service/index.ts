import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../libs/interceptor";
import axios from "axios";
import { IEmployee } from "@/models/IEmployee";

export const fetchEmployees = createAsyncThunk(
  "employees/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/employees");
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message;
        return rejectWithValue(errorMessage);
      }
    }
  }
);

export const addEmployee = createAsyncThunk(
  "employees/addEmployee",
  async (newEmployee: Partial<IEmployee>, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/employees/create",
        newEmployee
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        // Log the full error for debugging
        console.error("Error adding employee:", error.response?.data);

        // Extract and return the error message from the backend
        const errorMessage =
          error.response?.data?.message || "Failed to add employee";
        return rejectWithValue(errorMessage);
      } else {
        console.error("Unexpected error:", error);
        return rejectWithValue("An unexpected error occurred");
      }
    }
  }
);

export const updateEmployee = createAsyncThunk(
  "employees/update",
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

export const deleteEmployee = createAsyncThunk(
  "employees/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/employees/delete/${id}`);
      return id;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message;
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const fetchPositions = createAsyncThunk(
  "positions/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/positions");
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message;
        return rejectWithValue(errorMessage);
      }
    }
  }
);

import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../libs/interceptor";
import axios from "axios";
import { IAccount } from "@/models/IAccount";

export const fetchAccounts = createAsyncThunk(
  "accounts/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/accounts");
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message;
        return rejectWithValue(errorMessage);
      }
    }
  }
);

export const fetchEmployeesWithoutAccount = createAsyncThunk(
  "employees/fetchAllWithoutAccount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/employees/without-accounts");
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message;
        return rejectWithValue(errorMessage);
      }
    }
  }
);

export const addAccount = createAsyncThunk(
  "accounts/addAccount",
  async (newAccount: Partial<IAccount>, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/accounts", newAccount);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Error adding account:", error.response?.data);
        const errorMessage =
          error.response?.data?.message || "Failed to add account";
        return rejectWithValue(errorMessage);
      }
    }
  }
);

export const updateAccount = createAsyncThunk(
  "accounts/update",
  async (
    {
      id,
      updateAccountDto,
    }: { id: string; updateAccountDto: Partial<IAccount> },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.patch(
        `/accounts/update/${id}`,
        updateAccountDto
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

export const deleteAccount = createAsyncThunk(
  "accounts/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/accounts/delete/${id}`);
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

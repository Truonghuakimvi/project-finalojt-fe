import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../libs/interceptor";
import axios from "axios";
import { IPosition } from "@/models/IPosition";

export const fetchPosition = createAsyncThunk(
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

export const addPosition = createAsyncThunk(
  "positions/addPosition",
  async (newPosition: Partial<IPosition>, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/positions/create",
        newPosition
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Error adding position:", error.response?.data);
        const errorMessage =
          error.response?.data?.message || "Failed to add position";
        return rejectWithValue(errorMessage);
      }
    }
  }
);

export const updatePosition = createAsyncThunk(
  "positions/update",
  async (
    {
      id,
      updatePositionDto,
    }: { id: string; updatePositionDto: Partial<IPosition> },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.patch(
        `/positions/${id}`,
        updatePositionDto
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

export const deletePosition = createAsyncThunk(
  "positions/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/positions/${id}`);
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

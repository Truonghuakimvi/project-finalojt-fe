import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../libs/interceptor";
import axios from "axios";
import { ISkill } from "@/models/ISkill";

export const fetchSkill = createAsyncThunk(
  "skills/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/skills");
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message;
        return rejectWithValue(errorMessage);
      }
    }
  }
);

export const addSkill = createAsyncThunk(
  "skills/addSkill",
  async (newSkill: Partial<ISkill>, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/skills/create", newSkill);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Error adding skill:", error.response?.data);
        const errorMessage =
          error.response?.data?.message || "Failed to add skill";
        return rejectWithValue(errorMessage);
      }
    }
  }
);

export const updateSkill = createAsyncThunk(
  "skills/update",
  async (
    { id, updateSkillDto }: { id: string; updateSkillDto: Partial<ISkill> },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.patch(
        `/skills/${id}`,
        updateSkillDto
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

export const deleteSkill = createAsyncThunk(
  "skills/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/skills/${id}`);
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

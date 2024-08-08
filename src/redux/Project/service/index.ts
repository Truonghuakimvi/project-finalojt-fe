import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../libs/interceptor";
import { IProject } from "@/models/IProject";
import axios from "axios";
import { IAccount } from "@/models/IAccount";

export const fetchProjects = createAsyncThunk(
  "projects/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/projects");
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message;
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const addProject = createAsyncThunk(
  "projects/addProject",
  async (newProject: Partial<IProject>, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/projects", newProject);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Error adding project:", error.response?.data);
        const errorMessage =
          error.response?.data?.message || "Failed to add project";
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const updateProject = createAsyncThunk(
  "projects/updateProject",
  async (
    {
      id,
      updateProjectDto,
    }: { id: string; updateProjectDto: Partial<IProject> },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.patch<{
        project: IProject;
        messages: { email: string; projectName: string; message: string }[];
      }>(`/projects/${id}`, updateProjectDto);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message;
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const deleteProject = createAsyncThunk(
  "projects/deleteProject",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/projects/${id}/delete`);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message;
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const restoreProject = createAsyncThunk(
  "projects/restoreProject",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/projects/${id}/restore`);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message;
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const fetchProjectEmployees = createAsyncThunk(
  "projects/fetchProjectEmployees",
  async (projectId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/projects/${projectId}/employees`
      );
      return response.data as IAccount[];
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message;
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const fetchProjectById = createAsyncThunk(
  "projects/fetchProjectById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/projects/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message;
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const updateEmployeeRole = createAsyncThunk(
  "projects/updateEmployeeRole",
  async (
    {
      projectId,
      accountId,
      role,
    }: { projectId: string; accountId: string; role: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.patch(
        `/projects/${projectId}/employee/role`,
        { accountId, role }
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message;
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const fetchProjectsByAccount = createAsyncThunk(
  "projects/fetchByAccount",
  async (accountId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/projects/by-account/${accountId}`
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message;
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const fetchProjectsByEmployee = createAsyncThunk(
  "projects/fetchByEmployee",
  async (employeeId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/projects/by-employee/${employeeId}`
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message;
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

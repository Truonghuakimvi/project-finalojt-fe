import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../../store";
import { IProject } from "@/models/IProject";
import {
  addProject,
  deleteProject,
  fetchProjectById,
  fetchProjectEmployees,
  fetchProjects,
  fetchProjectsByAccount,
  fetchProjectsByEmployee,
  restoreProject,
  updateEmployeeRole,
  updateProject,
} from "../service";
import { IAccount } from "@/models/IAccount";

interface ProjectState {
  projects: IProject[];
  projectEmployees: IAccount[];
  selectedProject: IProject | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  detailStatus: "idle" | "loading" | "succeeded" | "failed";
  messages: { email: string; projectName: string; message: string }[]; // Add messages field
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  projectEmployees: [],
  selectedProject: null,
  status: "idle",
  detailStatus: "idle",
  messages: [], // Initialize messages field
  error: null,
};

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    clearSelectedProject: (state) => {
      state.selectedProject = null;
      state.detailStatus = "idle";
      state.messages = []; // Clear messages when project is cleared
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchProjects.fulfilled,
        (state, action: PayloadAction<IProject[]>) => {
          state.status = "succeeded";
          state.projects = action.payload;
        }
      )
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(addProject.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        addProject.fulfilled,
        (state, action: PayloadAction<IProject>) => {
          state.status = "succeeded";
          state.projects.push(action.payload);
        }
      )
      .addCase(addProject.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(updateProject.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        updateProject.fulfilled,
        (
          state,
          action: PayloadAction<{
            project: IProject;
            messages: { email: string; projectName: string; message: string }[];
          }>
        ) => {
          state.status = "succeeded";
          const index = state.projects.findIndex(
            (project) => project._id === action.payload.project._id
          );
          if (index !== -1) {
            state.projects[index] = action.payload.project;
          }
          state.messages = action.payload.messages; // Store messages
        }
      )
      .addCase(updateProject.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(deleteProject.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        deleteProject.fulfilled,
        (state, action: PayloadAction<IProject>) => {
          state.status = "succeeded";
          const index = state.projects.findIndex(
            (project) => project._id === action.payload._id
          );
          if (index !== -1) {
            state.projects[index] = action.payload;
          }
        }
      )
      .addCase(deleteProject.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(restoreProject.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        restoreProject.fulfilled,
        (state, action: PayloadAction<IProject>) => {
          state.status = "succeeded";
          const index = state.projects.findIndex(
            (project) => project._id === action.payload._id
          );
          if (index !== -1) {
            state.projects[index] = action.payload;
          }
        }
      )
      .addCase(restoreProject.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(fetchProjectEmployees.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchProjectEmployees.fulfilled,
        (state, action: PayloadAction<IAccount[]>) => {
          state.status = "succeeded";
          state.projectEmployees = action.payload;
        }
      )
      .addCase(fetchProjectEmployees.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(fetchProjectById.pending, (state) => {
        state.detailStatus = "loading";
        state.error = null;
      })
      .addCase(
        fetchProjectById.fulfilled,
        (state, action: PayloadAction<IProject>) => {
          state.detailStatus = "succeeded";
          state.selectedProject = action.payload;
        }
      )
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.detailStatus = "failed";
        state.error = action.payload as string;
      })
      .addCase(updateEmployeeRole.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        updateEmployeeRole.fulfilled,
        (state, action: PayloadAction<IProject>) => {
          state.status = "succeeded";
          state.selectedProject = action.payload;
          const index = state.projects.findIndex(
            (project) => project._id === action.payload._id
          );
          if (index !== -1) {
            state.projects[index] = action.payload;
          }
        }
      )
      .addCase(updateEmployeeRole.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(fetchProjectsByAccount.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchProjectsByAccount.fulfilled,
        (state, action: PayloadAction<IProject[]>) => {
          state.status = "succeeded";
          state.projects = action.payload;
        }
      )
      .addCase(fetchProjectsByAccount.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(fetchProjectsByEmployee.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchProjectsByEmployee.fulfilled,
        (state, action: PayloadAction<IProject[]>) => {
          state.status = "succeeded";
          state.projects = action.payload;
        }
      )
      .addCase(fetchProjectsByEmployee.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const selectAllProjects = (state: RootState) => state.project.projects;
export const selectProjectEmployees = (state: RootState) =>
  state.project.projectEmployees;
export const selectSelectedProject = (state: RootState) =>
  state.project.selectedProject;
export const selectProjectDetailStatus = (state: RootState) =>
  state.project.detailStatus;
export const selectProjectMessages = (state: RootState) =>
  state.project.messages; // Add selector for messages
export const { clearSelectedProject } = projectSlice.actions;

export default projectSlice.reducer;

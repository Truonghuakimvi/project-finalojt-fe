import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../../store";
import { ISkill } from "@/models/ISkill";
import { addSkill, deleteSkill, fetchSkill, updateSkill } from "../service";

interface SkillState {
  skills: ISkill[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: SkillState = {
  skills: [],
  status: "idle",
  error: null,
};

const skillSlice = createSlice({
  name: "skill",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSkill.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchSkill.fulfilled,
        (state, action: PayloadAction<ISkill[]>) => {
          state.status = "succeeded";
          state.skills = action.payload;
        }
      )
      .addCase(fetchSkill.rejected, (state) => {
        state.status = "failed";
        state.error = "Something is wrong";
      })
      .addCase(addSkill.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(addSkill.fulfilled, (state, action: PayloadAction<ISkill>) => {
        state.status = "succeeded";
        state.skills.push(action.payload);
      })
      .addCase(addSkill.rejected, (state) => {
        state.status = "failed";
        state.error = "Failed to add skill";
      })
      .addCase(updateSkill.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        updateSkill.fulfilled,
        (state, action: PayloadAction<ISkill>) => {
          state.status = "succeeded";
          const index = state.skills.findIndex(
            (emp) => emp._id === action.payload._id
          );
          if (index !== -1) {
            state.skills[index] = action.payload;
          }
        }
      )
      .addCase(updateSkill.rejected, (state) => {
        state.status = "failed";
        state.error = "Failed to update skill";
      })
      .addCase(deleteSkill.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        deleteSkill.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.status = "succeeded";
          state.skills = state.skills.filter(
            (skill) => skill._id !== action.payload
          );
        }
      )
      .addCase(deleteSkill.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const selectAllSkill = (state: RootState) => state.skill.skills;

export default skillSlice.reducer;

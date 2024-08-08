import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchAccount, fetchSkills, updateEmployee } from "../service";
import { RootState } from "../../../store";
import { IAccount } from "@/models/IAccount";
import { ISkill } from "@/models/ISkill";
import { IEmployee } from "@/models/IEmployee";

interface AccountState {
  account: IAccount | null;
  skills: ISkill[] | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AccountState = {
  account: null,
  skills: null,
  status: "idle",
  error: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccount.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchAccount.fulfilled,
        (state, action: PayloadAction<IAccount>) => {
          state.status = "succeeded";
          state.account = action.payload;
        }
      )
      .addCase(fetchAccount.rejected, (state) => {
        state.status = "failed";
        state.error = "Something is wrong";
      })
      .addCase(fetchSkills.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchSkills.fulfilled,
        (state, action: PayloadAction<ISkill[]>) => {
          state.status = "succeeded";
          state.skills = action.payload;
        }
      )
      .addCase(fetchSkills.rejected, (state) => {
        state.status = "failed";
        state.error = "Failed to fetch skills";
      })
      .addCase(updateEmployee.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        updateEmployee.fulfilled,
        (state, action: PayloadAction<IEmployee>) => {
          state.status = "succeeded";
          if (state.account) {
            state.account.employeeId = action.payload;
          }
        }
      )
      .addCase(updateEmployee.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const selectAccount = (state: RootState) => state.profile.account;
export const selectSkills = (state: RootState) => state.profile.skills;

export default profileSlice.reducer;

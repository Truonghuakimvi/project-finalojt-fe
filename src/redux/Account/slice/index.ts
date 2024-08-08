import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  addAccount,
  deleteAccount,
  fetchAccounts,
  fetchEmployeesWithoutAccount,
  updateAccount,
} from "../service";
import { RootState } from "../../../store";
import { IAccount } from "@/models/IAccount";
import { IEmployee } from "@/models/IEmployee";

interface AccountsState {
  accounts: IAccount[];
  employees: IEmployee[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AccountsState = {
  accounts: [],
  employees: [],
  status: "idle",
  error: null,
};

const accountsSlice = createSlice({
  name: "accounts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchAccounts.fulfilled,
        (state, action: PayloadAction<IAccount[]>) => {
          state.status = "succeeded";
          state.accounts = action.payload;
        }
      )
      .addCase(fetchAccounts.rejected, (state) => {
        state.status = "failed";
        state.error = "Something is wrong";
      })
      .addCase(addAccount.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        addAccount.fulfilled,
        (state, action: PayloadAction<IAccount>) => {
          state.status = "succeeded";
          state.accounts.push(action.payload);
        }
      )
      .addCase(addAccount.rejected, (state) => {
        state.status = "failed";
        state.error = "Failed to add account";
      })
      .addCase(updateAccount.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        updateAccount.fulfilled,
        (state, action: PayloadAction<IAccount>) => {
          state.status = "succeeded";
          const index = state.accounts.findIndex(
            (emp) => emp._id === action.payload._id
          );
          if (index !== -1) {
            state.accounts[index] = action.payload;
          }
        }
      )
      .addCase(updateAccount.rejected, (state) => {
        state.status = "failed";
        state.error = "Failed to update account";
      })
      .addCase(
        deleteAccount.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.accounts = state.accounts.filter(
            (account) => account._id !== action.payload
          );
        }
      )
      .addCase(deleteAccount.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(fetchEmployeesWithoutAccount.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchEmployeesWithoutAccount.fulfilled,
        (state, action: PayloadAction<IEmployee[]>) => {
          state.status = "succeeded";
          state.employees = action.payload;
        }
      )
      .addCase(fetchEmployeesWithoutAccount.rejected, (state) => {
        state.status = "failed";
        state.error = "Something is wrong";
      });
  },
});

export const selectAllAccounts = (state: RootState) => state.account.accounts;
export const selectAllEmployees = (state: RootState) => state.account.employees;
export const selectAccountsStatus = (state: RootState) => state.account.status;
export const selectAccountsError = (state: RootState) => state.account.error;

export default accountsSlice.reducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  addEmployee,
  deleteEmployee,
  fetchEmployees,
  fetchPositions,
  updateEmployee,
} from "../service";
import { RootState } from "../../../store";
import { IEmployee } from "@/models/IEmployee";
import { IPosition } from "@/models/IPosition";

interface EmployeesState {
  employees: IEmployee[];
  positions: IPosition[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: EmployeesState = {
  employees: [],
  positions: [],
  status: "idle",
  error: null,
};

const employeesSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchEmployees.fulfilled,
        (state, action: PayloadAction<IEmployee[]>) => {
          state.status = "succeeded";
          state.employees = action.payload;
        }
      )
      .addCase(fetchEmployees.rejected, (state) => {
        state.status = "failed";
        state.error = "Something is wrong";
      })
      .addCase(addEmployee.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        addEmployee.fulfilled,
        (state, action: PayloadAction<IEmployee>) => {
          state.status = "succeeded";
          state.employees.push(action.payload);
        }
      )
      .addCase(addEmployee.rejected, (state) => {
        state.status = "failed";
        state.error = "Failed to add employee";
      })
      .addCase(updateEmployee.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        updateEmployee.fulfilled,
        (state, action: PayloadAction<IEmployee>) => {
          state.status = "succeeded";
          const index = state.employees.findIndex(
            (emp) => emp._id === action.payload._id
          );
          if (index !== -1) {
            state.employees[index] = action.payload;
          }
        }
      )
      .addCase(updateEmployee.rejected, (state) => {
        state.status = "failed";
        state.error = "Failed to update employee";
      })
      .addCase(
        deleteEmployee.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.employees = state.employees.filter(
            (employee) => employee._id !== action.payload
          );
        }
      )
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(fetchPositions.rejected, (state) => {
        state.status = "failed";
        state.error = "Failed to fetch position";
      })
      .addCase(
        fetchPositions.fulfilled,
        (state, action: PayloadAction<IPosition[]>) => {
          state.status = "succeeded";
          state.positions = action.payload;
        }
      );
  },
});

export const selectAllEmployees = (state: RootState) =>
  state.employee.employees;
export const selectAllPositions = (state: RootState) =>
  state.employee.positions;
export const selectEmployeesStatus = (state: RootState) =>
  state.employee.status;
export const selectEmployeesError = (state: RootState) => state.employee.error;

export default employeesSlice.reducer;

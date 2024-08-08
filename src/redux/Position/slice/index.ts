import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../../store";
import { IPosition } from "@/models/IPosition";
import {
  addPosition,
  deletePosition,
  fetchPosition,
  updatePosition,
} from "../service";

interface PositionState {
  positions: IPosition[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: PositionState = {
  positions: [],
  status: "idle",
  error: null,
};

const positionSlice = createSlice({
  name: "position",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosition.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchPosition.fulfilled,
        (state, action: PayloadAction<IPosition[]>) => {
          state.status = "succeeded";
          state.positions = action.payload;
        }
      )
      .addCase(fetchPosition.rejected, (state) => {
        state.status = "failed";
        state.error = "Something is wrong";
      })
      .addCase(addPosition.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        addPosition.fulfilled,
        (state, action: PayloadAction<IPosition>) => {
          state.status = "succeeded";
          state.positions.push(action.payload);
        }
      )
      .addCase(addPosition.rejected, (state) => {
        state.status = "failed";
        state.error = "Failed to add position";
      })
      .addCase(updatePosition.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        updatePosition.fulfilled,
        (state, action: PayloadAction<IPosition>) => {
          state.status = "succeeded";
          const index = state.positions.findIndex(
            (emp) => emp._id === action.payload._id
          );
          if (index !== -1) {
            state.positions[index] = action.payload;
          }
        }
      )
      .addCase(updatePosition.rejected, (state) => {
        state.status = "failed";
        state.error = "Failed to update position";
      })
      .addCase(deletePosition.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        deletePosition.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.status = "succeeded";
          state.positions = state.positions.filter(
            (position) => position._id !== action.payload
          );
        }
      )
      .addCase(deletePosition.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const selectAllPosition = (state: RootState) => state.position.positions;

export default positionSlice.reducer;

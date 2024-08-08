import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import authReducer from "../redux/Login/slice/index";
import accountsReducer from "../redux/Account/slice/index";
import employeesReducer from "../redux/Employee/slice/index";
import profileReducer from "../redux/Profile/slice/index";
import skillReducer from "../redux/Skill/slice/index";
import positionReducer from "../redux/Position/slice/index";
import projectReducer from "../redux/Project/slice/index";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    account: accountsReducer,
    employee: employeesReducer,
    profile: profileReducer,
    skill: skillReducer,
    position: positionReducer,
    project: projectReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        extraArgument: {},
      },
    }),
});

export const useAppDispatch = () => useDispatch<AppDispatch>();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

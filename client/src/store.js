import { configureStore } from "@reduxjs/toolkit";
import languageReducer from "./slice/languageSlice";
import themeReducer from "./slice/themeSlice";

export const store = configureStore({
  reducer: {
    language: languageReducer,
    theme: themeReducer
  },
});
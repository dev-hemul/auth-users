import { createSlice } from "@reduxjs/toolkit";
import i18n from "../i18.js";

const initialState = {
  lang: i18n.language || "uk",
};

const languageSlice = createSlice({
  name: "language",
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.lang = action.payload;
      i18n.changeLanguage(action.payload);
    },
  },
});

console.log("Текущий язык в i18n:", i18n.language);


export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;
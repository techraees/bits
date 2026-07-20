const DEFAULT_THEME = {
  backgroundTheme: "black-background",
  headerTheme: "black-background2",
  textColor: "white",
  textColor2: "light-grey",
  textColor3: "white",
  bgColor: "dark-grey-bg",
  bgColor2: "",
  bgColor3: "black-background3",
  border: "dark-border"
};

const loadSavedTheme = () => {
  try {
    const raw = localStorage.getItem("bits-theme");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.backgroundTheme === "string") {
      return { ...DEFAULT_THEME, ...parsed };
    }
  } catch (e) {}
  return null;
};

const INITIAL_STATE = {
  theme: loadSavedTheme() || DEFAULT_THEME
};

const AppReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case "THEME":
      return {
        ...state,
        theme: action.theme
      };
    default:
      return state;
  }
};

export default AppReducer;

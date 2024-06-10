import { extendTheme } from "@mui/joy";
declare module "@mui/joy/styles" {
  interface Palette {
    "danger-500": string;
    "blue-25": string;
    "blue-50": string;
    "blue-100": string;
    "blue-200": string;
    "blue-300": string;
    "blue-400": string;
    "blue-500": string;
    "blue-550": string;
    "blue-600": string;
    "blue-700": string;
    "blue-800": string;
    "gray-50": string;
    "gray-25": string;
    "gray-100": string;
    "gray-200": string;
    "gray-400": string;
    "gray-500": string;
    "gray-600": string;
    "gray-700": string;
    "gray-800": string;
    "gray-900": string;
    "indigo-25": string;
    "indigo-50": string;
    "indigo-100": string;
    "indigo-500": string;
    "indigo-900": string;
    "blueGrey-800": string;
    "turquoise-500": string;
  }
  interface BreakpointOverrides {
    xs: true;
    sm: true;
    md: true;
    lg: true;
    xl: true;
  }
}

const customTheme = extendTheme({
  components: {
    JoyModal: {
      styleOverrides: {
        backdrop: ({ ownerState }) => ({
          backdropFilter: "none",
        }),
      },
    },
  },
  colorSchemes: {
    light: {
      palette: {
        // uses the blue colors
        primary: {
          "50": "#E7F4F8",
          "100": "#D0EAF0",
          "200": "#A0D6E2",
          "300": "#71C1D3",
          "400": "#41ADC4",
          "500": "#1298B6",
          "600": "#0E7A92",
          "700": "#0B5B6D",
          "800": "#073D49",
        },
        "danger-500": "#C41C1C",
        "blue-25": "#F8FCFD",
        "blue-50": "#E7F4F8",
        "blue-100": "#D0EAF0",
        "blue-200": "#A0D6E2",
        "blue-300": "#71C1D3",
        "blue-400": "#41ADC4",
        "blue-500": "#1298B6",
        "blue-550": "#1089A4",
        "blue-600": "#0E7A92",
        "blue-700": "#0B5B6D",
        "blue-800": "#073D49",
        "indigo-25": "#F3F6FB",
        "indigo-50": "#E7ECF8",
        "indigo-100": "#D0DBF0",
        "indigo-500": "#124AB6",
        "indigo-900": "#040F24",
        "gray-50": "#F0F1F1",
        "gray-25": "#FBFBFB",
        "gray-100": "#E1E3E4",
        "gray-200": "#C3C9CA",
        "gray-400": "#879294",
        "gray-500": "#69777A",
        "gray-700": "#3F4749",
        "gray-800": "#2A3031",
        "gray-900": "#151818",
        "gray-600": "#545F62",
        "blueGrey-800": "#37474F",
        "turquoise-500": "#18BD9F",
      },
    },
  },
  fontFamily: {
    body: "Nunito",
  },
  typography: {
    h1: {
      fontSize: "2rem",
    },
    h2: {
      fontSize: "1.5rem",
    },
    h3: {
      fontSize: "1.25rem",
    },
    h4: {
      fontSize: "1rem",
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 895,
      md: 1095,
      lg: 1200,
      xl: 1500,
    },
  },
});

export default customTheme;

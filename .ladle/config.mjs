export default {
  stories: "client/src/**/*.stories.{js,jsx,ts,tsx}",
  port: 61000,
  defaultStory: "welcome",
  addons: {
    width: {
      enabled: true,
      options: {
        xsmall: 320,
        small: 640,
        medium: 768,
        large: 1024
      },
      defaultState: "large"
    },
    theme: {
      enabled: true,
      defaultState: "light"
    },
    mode: {
      enabled: true,
      defaultState: "full"
    },
    rtl: {
      enabled: true,
      defaultState: false
    },
    a11y: {
      enabled: true
    }
  }
};

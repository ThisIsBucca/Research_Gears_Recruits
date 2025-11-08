// Environment configuration
const ENV = {
  development: {
    //local proxy server to avoid CORS issues during development
    //API_URL: 'http://localhost:3001', // Proxy server URL

    API_URL: "https://api.sokoni.africa",
    WS_URL: "wss://api.sokoni.africa/online_status",
    MAPBOX_TOKEN:
      "pk.eyJ1IjoiZmFuZXZlc2FsIiwiYSI6ImNtZWNpcnUzOTBuNWsya3Njc2NkeWwwa2YifQ._LFk6HbPjUmwy4sHnpH0jA",
  },
  production: {
    API_URL: "https://api.sokoni.africa",
    WS_URL: "wss://api.sokoni.africa/online_status",
    MAPBOX_TOKEN:
      "pk.eyJ1IjoiZmFuZXZlc2FsIiwiYSI6ImNtZWNpcnUzOTBuNWsya3Njc2NkeWwwa2YifQ._LFk6HbPjUmwy4sHnpH0jA",
  },
};

// Set current environment
const currentEnv =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "development"
    : "production";

// Export configuration
const config = ENV[currentEnv];

//lets fix this session......

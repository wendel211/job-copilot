export default () => ({
  app: {
    env: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT || "3003", 10),
  },

  database: {
    url: process.env.DATABASE_URL,
  },

  email: {
    debug: process.env.SMTP_DEBUG === "true",
  },
});

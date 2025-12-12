// Environment-based configuration for Lockout Game frontend

const config = {
  development: {
    apiUrl: 'http://localhost:5000',
  },
  production: {
    // This will be replaced by environment variable during build
    apiUrl: import.meta.env.VITE_API_URL || 'https://api.yourdomain.com',
  },
};

// Determine environment
const environment = import.meta.env.MODE || 'development';

export default config[environment];


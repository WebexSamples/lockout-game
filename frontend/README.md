# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Query Parameters

The application supports the following query parameters:

- `disableWebex`: Set this to `true` to disable Webex SDK initialization. This is useful for testing or running the application outside of the Webex environment.

### Example Usage

To disable Webex SDK initialization, append `?disableWebex=true` to the application URL:

```
http://localhost:5173?disableWebex=true
http://localhost:5173/lobby/abc-123?disableWebex=true
```

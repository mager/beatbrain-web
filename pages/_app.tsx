import { getSession } from "next-auth/react"; // Keep if using getInitialProps for session
import { SessionProvider } from "next-auth/react";
import { AppProps } from "next/app";
import { AppProvider } from "../context/AppContext";
import Layout from "@components/Layout"; // --- Import Layout ---
import "./global.css";

// Removed custom interface MyAppProps as data seems handled internally now
// Removed MyApp.getInitialProps - rely on useSession hook for session data client-side
// This simplifies the setup and avoids potential issues with getInitialProps disabling static optimization

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    // SessionProvider should be high up
    <SessionProvider session={pageProps.session}>
      {/* AppProvider provides user and player state */}
      <AppProvider>
        {/* Layout wraps the actual page Component */}
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AppProvider>
    </SessionProvider>
  );
};

// Removed MyApp.getInitialProps - It's generally recommended to avoid getInitialProps
// in _app unless absolutely necessary. Fetching session/user data client-side
// with useSession and useEffect in the AppProvider is often preferred.
// If you *need* data fetched *before* any page renders server-side,
// you might keep it, but ensure Layout is still outside Component.

export default MyApp;
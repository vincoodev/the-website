import "../styles/globals.css";
import Layout from "../components/Layout";
import Tap from "../components/Tap";

export default function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
      <Tap />
    </Layout>
  );
}

import "../styles/globals.css";
import Layout from "../components/Layout";
import Tap from "../components/Tap";
import '../styles/globals.css' // Baris ini harus ada!

export default function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

import "../styles/globals.css";
import "../styles/community.css";
import "../styles/TimeWaster.css";
import Layout from "../components/Layout";
import AbsurdOracle from "../components/AbsurdOracle";

export default function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
      <AbsurdOracle />
    </Layout>
  );
}

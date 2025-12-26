import "../styles/globals.css";
import "../styles/community.css";
import "../styles/TimeWaster.css";
import Layout from "../components/Layout";
import DelayCursor from "../components/DelayCursor";

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Layout>
        <Component {...pageProps} />
      </Layout>

      <DelayCursor delay={0.1} />
    </>
  );
}

import "../styles/globals.css";
import "../styles/community.css";
import "../styles/TimeWaster.css";
import Layout from "../components/Layout";
import { useRouter } from "next/router";

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // custom layout for ayuAtama App
  const isAyuAtamaApp = router.pathname.startsWith("/ayuAtama");
  if (isAyuAtamaApp) {
    return <Component {...pageProps} />;
  }

  // layout default
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

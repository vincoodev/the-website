import "../styles/globals.css";
import "../styles/community.css";
import "../styles/TimeWaster.css";
import Layout from "../components/Layout";
import { useRouter } from "next/router";
import Navbar from "@components/ayuAtama/navbar";
import Footer from "@components/ayuAtama/footer";

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // custom layout for ayuAtama App
  const isAyuAtamaApp = router.pathname.startsWith("/ayuAtama");
  if (isAyuAtamaApp) {
    return (
      //<LayoutRentFemboy>
      <>
        <Navbar />
        <main className="pt-20 md:pt-24">
          <Component {...pageProps} />
        </main>
        <Footer />
      </>
      //</LayoutRentFemboy>
    );
  }

  // layout default
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

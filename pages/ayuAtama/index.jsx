import { useEffect } from "react";
import { useRouter } from "next/router";

export default function AyuAtama() {
  const router = useRouter();

  useEffect(() => {
    window.location.href = "https://www.youtube.com/@ayuatama";
  }, []);

  return null;
}

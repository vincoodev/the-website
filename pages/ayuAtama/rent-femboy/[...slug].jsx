// pages/ayuAtama/rent-femboy/[...slug].js
import { useRouter } from "next/router";
import Link from "next/link";

export default function Custom404() {
  const baseUrl = process.env.NEXT_PUBLIC_FEM_RENT_URL;
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50 px-6">
      <div className="max-w-md w-full text-center">
        {/* Image */}
        <div className="flex justify-center">
          <img
            src="/ayuAtama/astolfo_confused.png"
            alt="Lost anime girl"
            className="w-64 h-auto drop-shadow-md"
          />
        </div>

        {/* Text */}
        <h1 className="mt-6 text-3xl font-semibold text-gray-800">
          404 — Page not found
        </h1>

        <p className="mt-3 text-gray-600 leading-relaxed">
          Looks like you wandered into an empty route on.{" "}
          <code>{router.asPath}</code>
          <br />
          Even she doesn’t know how to get here.
        </p>

        {/* Action */}
        <div className="mt-6">
          <Link
            href={`${baseUrl}`}
            className="inline-block rounded-xl  px-6 py-2.5
                       text-blue-600 bg-blue-100 font-medium shadow-sm
                       hover:bg-blue-500 hover:text-blue-50 active:scale-95 transition"
          >
            Take me home
          </Link>
        </div>
      </div>
    </div>
  );
}

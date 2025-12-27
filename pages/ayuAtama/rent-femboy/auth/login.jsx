import { useState } from "react";
import { useRouter } from "next/router";

const SignInSection = () => {
  const router = useRouter();
  const baseAPIUrl = process.env.NEXT_PUBLIC_API_URL;
  const baseUrl = process.env.NEXT_PUBLIC_FEM_RENT_URL;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${baseAPIUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // REQUIRED for HttpOnly cookie
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // notify navbar & listeners
      window.dispatchEvent(new Event("auth-changed"));

      // redirect
      router.push(`${baseUrl}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <div className="grid md:h-screen md:grid-cols-2">
        {/* Left Component */}
        <div className="flex flex-col items-center justify-center bg-white">
          <div className="max-w-lg px-5 py-16 text-center md:px-10 md:py-24 lg:py-32">
            <h2 className="mb-8 text-3xl font-bold md:mb-12 md:text-5xl">
              Hahaha!!! You're One of Us!!!
            </h2>

            <form
              onSubmit={handleSubmit}
              className="mx-auto mb-4 max-w-sm pb-4"
            >
              {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

              <div className="relative">
                <img
                  alt=""
                  src="https://assets.website-files.com/6357722e2a5f19121d37f84d/6357722e2a5f190b7e37f878_EnvelopeSimple.svg"
                  className="absolute bottom-0 left-[5%] top-[26%]"
                />
                <input
                  type="email"
                  className="mb-4 block h-9 w-full border border-black bg-[#f2f2f7] px-3 py-6 pl-14 text-sm text-[#333333]"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="relative mb-4">
                <img
                  alt=""
                  src="https://assets.website-files.com/6357722e2a5f19121d37f84d/6357722e2a5f19601037f879_Lock-2.svg"
                  className="absolute bottom-0 left-[5%] top-[26%]"
                />
                <input
                  type="password"
                  className="mb-4 block h-9 w-full border border-black bg-[#f2f2f7] px-3 py-6 pl-14 text-sm text-[#333333]"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center bg-[#276ef1] px-8 py-4 font-semibold text-white transition disabled:opacity-60
                  [box-shadow:rgb(171,_196,_245)_-8px_8px]
                  hover:[box-shadow:rgb(171,_196,_245)_0px_0px]"
              >
                <span className="mr-6 font-bold">
                  {loading ? "Logging in..." : "Grab your lil femboys~"}
                </span>
                <svg
                  className="h-4 w-4 flex-none"
                  fill="currentColor"
                  viewBox="0 0 20 21"
                >
                  <polygon points="16.172 9 10.101 2.929 11.515 1.515 20 10 19.293 10.707 11.515 18.485 10.101 17.071 16.172 11 0 11 0 9" />
                </svg>
              </button>
            </form>

            <p className="text-sm text-[#636262]">
              Don't have an account yet?{" "}
              <a href="register" className="font-bold text-black">
                Register now
              </a>
            </p>
          </div>
        </div>

        {/* Right Component */}
        <div
          className="relative flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/ayuAtama/pengering.png')" }}
        >
          <div className="absolute inset-0 bg-black/50" />

          <div className="relative max-w-lg px-5 py-16 text-white md:px-10 md:py-24 lg:py-32">
            <div className="mb-6 ml-2 flex h-14 w-14 items-center justify-center bg-[#276ef1] [box-shadow:rgb(171,_196,_245)_-8px_8px]">
              <img
                src="https://assets.website-files.com/6357722e2a5f19121d37f84d/6358f5ec37c8c32b17d1c725_Vector-9.svg"
                alt=""
                className="inline-block"
              />
            </div>
            <p className="mb-8 text-white/90">
              Missed the butterflies? Sign in and pick up where the flirting
              left off, with charming companions ready to turn every moment into
              something unforgettable.
            </p>

            <p className="font-bold">Wahyu Pratama</p>
            <p className="text-sm text-white/80">Astolfo Enjoyer Developer</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignInSection;

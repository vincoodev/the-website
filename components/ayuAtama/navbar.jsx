import { useEffect, useState } from "react";
import Link from "next/link";

const Navbar = () => {
  const baseurl = process.env.NEXT_PUBLIC_FEM_RENT_URL;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const navLinks = [
    { name: "Home", path: `${baseurl}` },
    { name: "Discover", path: `${baseurl}/discover` },
    { name: "About", path: `${baseurl}/contact` },
  ];

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Scroll handling
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch logged-in user
  useEffect(() => {
    const fetchUser = () => {
      fetch(`${apiUrl}/me`, { credentials: "include" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => setUser(data))
        .catch(() => setUser(null))
        .finally(() => setLoadingUser(false));
    };

    fetchUser();
    window.addEventListener("auth-changed", fetchUser);

    return () => window.removeEventListener("auth-changed", fetchUser);
  }, [apiUrl]);

  async function handleLogout() {
    await fetch(`${apiUrl}/auth/logout`, { method: "POST" });
    setUser(null);
    location.href = `${baseurl}/auth/login`;
  }

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/80 shadow-md backdrop-blur-lg text-gray-700 py-3 md:py-4"
          : "bg-indigo-500 text-white py-4 md:py-6"
      }`}
    >
      <div className="flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32">
        {/* Brand */}
        <Link href={baseurl} className="font-semibold text-lg">
          FemRent
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.path} className="relative group">
              {link.name}
              <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-current group-hover:w-full transition-all" />
            </Link>
          ))}
        </div>

        {/* Desktop Right */}
        <div className="hidden md:flex items-center gap-4 relative">
          {loadingUser && (
            <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse" />
          )}

          {!loadingUser && !user && (
            <Link
              href={`${baseurl}/auth/login`}
              className={`px-8 py-2.5 rounded-full transition ${
                isScrolled ? "bg-black text-white" : "bg-white text-black"
              }`}
            >
              Login
            </Link>
          )}

          {!loadingUser && user && (
            <>
              <button
                onClick={() => setUserOpen((v) => !v)}
                className="rounded-full overflow-hidden"
              >
                <img
                  src={user.profile?.image || "/uploads/default-avatar.png"}
                  alt="Profile"
                  className="w-9 h-9 rounded-full object-cover"
                />
              </button>

              {userOpen && (
                <div className="absolute right-0 top-12 w-48 bg-white text-gray-800 rounded-lg shadow-lg overflow-hidden">
                  <div className="px-4 py-3 border-b text-sm font-medium">
                    {user.profile?.displayName ||
                      user.profile?.nickname ||
                      "User"}
                  </div>

                  {/* <Link
                    href={`${baseurl}/dashboard`}
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Dashboard
                  </Link> */}

                  <Link
                    href={`${baseurl}/settings`}
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Settings
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Mobile Avatar */}
        <div className="md:hidden flex items-center gap-2">
          {loadingUser && (
            <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse" />
          )}

          {!loadingUser && user && (
            <button
              onClick={() => {
                setIsMenuOpen(false);
                setUserOpen((v) => !v);
              }}
              className="rounded-full overflow-hidden"
            >
              <img
                src={user.profile?.image || "/uploads/default-avatar.png"}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
            </button>
          )}

          {!loadingUser && !user && (
            <Link
              href={`${baseurl}/auth/login`}
              className="text-sm font-medium"
            >
              Login
            </Link>
          )}
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className="md:hidden ml-2 text-xl"
        >
          ☰
        </button>
      </div>

      {/* Mobile Profile Menu */}
      {userOpen && (
        <div
          className="
            fixed inset-x-4 top-16 z-50
            bg-white text-gray-800 rounded-lg shadow-lg overflow-hidden
            md:hidden
          "
        >
          <div className="px-4 py-3 border-b text-sm font-medium">
            {user?.profile?.displayName || user?.profile?.nickname || "User"}
          </div>

          {/* <Link
            href={`${baseurl}/dashboard`}
            onClick={() => setUserOpen(false)}
            className="block px-4 py-2 text-sm hover:bg-gray-100"
          >
            Dashboard
          </Link> */}

          <Link
            href={`${baseurl}/settings`}
            onClick={() => setUserOpen(false)}
            className="block px-4 py-2 text-sm hover:bg-gray-100"
          >
            Settings
          </Link>

          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
          >
            Sign out
          </button>
        </div>
      )}

      {/* Mobile Nav Menu */}
      <div
        className={`fixed inset-0 bg-white text-gray-800 flex flex-col items-center justify-center gap-6
        transition-transform duration-500 md:hidden
        ${
          isMenuOpen
            ? "translate-x-0 pointer-events-auto"
            : "-translate-x-full pointer-events-none"
        }`}
      >
        <button
          className="absolute top-4 right-4 text-xl"
          onClick={() => setIsMenuOpen(false)}
        >
          ✕
        </button>

        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.path}
            onClick={() => setIsMenuOpen(false)}
            className="text-lg"
          >
            {link.name}
          </Link>
        ))}

        {!user && (
          <Link
            href={`${baseurl}/auth/login`}
            className="bg-black text-white px-8 py-2.5 rounded-full"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

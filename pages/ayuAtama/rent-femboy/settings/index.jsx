import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const SettingsSection = () => {
  const router = useRouter();
  const baseAPIUrl = process.env.NEXT_PUBLIC_API_URL;
  const baseUrl = process.env.NEXT_PUBLIC_FEM_RENT_URL;

  const BACKGROUNDS = {
    RENTER: "/ayuAtama/pengering1.png",
    FEMBOY: "/ayuAtama/pengering2.png",
  };

  const [activeBg, setActiveBg] = useState(BACKGROUNDS.RENTER);
  const [nextBg, setNextBg] = useState(null);
  const [isFading, setIsFading] = useState(false);

  const [role, setRole] = useState("RENTER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [baseRate, setBaseRate] = useState("");
  const [image, setImage] = useState(null);

  const [isListingActive, setIsListingActive] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // ----------------------------------
  // Load current user
  // ----------------------------------
  useEffect(() => {
    fetch(`${baseAPIUrl}/me`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setRole(data.role);
        setEmail(data.email || "");

        if (data.role === "RENTER") {
          setNickname(data.profile?.nickname || "");
        }

        if (data.role === "FEMBOY") {
          setDisplayName(data.profile?.displayName || "");
          setBio(data.profile?.bio || "");
          setBaseRate(data.profile?.baseRate || "");
          setIsListingActive(!!data.profile?.isActive);
        }
      })
      .catch(() => router.push(`${baseUrl}/auth/login`));
  }, []);

  // background animation
  useEffect(() => {
    const targetBg = BACKGROUNDS[role];
    if (targetBg === activeBg) return;

    const img = new Image();
    img.src = targetBg;
    img.onload = () => {
      setNextBg(targetBg);
      setIsFading(true);
      setTimeout(() => {
        setActiveBg(targetBg);
        setNextBg(null);
        setIsFading(false);
      }, 300);
    };
  }, [role]);

  async function uploadImage() {
    if (!image) return null;
    const formData = new FormData();
    formData.append("image", image);

    const res = await fetch(`${baseAPIUrl}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Image upload failed");
    const data = await res.json();
    return data.url;
  }

  // ----------------------------------
  // Save profile + listing
  // ----------------------------------
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const imageUrl = await uploadImage();

      // update profile
      const payload = {
        email,
        password: password || undefined,
        imageUrl,
      };

      if (role === "RENTER") payload.nickname = nickname;
      if (role === "FEMBOY") {
        payload.displayName = displayName;
        payload.bio = bio;
        payload.baseRate = Number(baseRate);
      }

      const res = await fetch(`${baseAPIUrl}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      // update listing toggle if FEMBOY
      if (role === "FEMBOY") {
        await fetch(`${baseAPIUrl}/femboy/listings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            isActive: isListingActive,
            availability: [], // keep existing or manage later
          }),
        });
      }

      window.dispatchEvent(new Event("auth-changed"));
      setSuccess("Profile updated successfully.");
      setPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <div className="grid md:h-screen md:grid-cols-2">
        {/* LEFT */}
        <div className="flex flex-col items-center justify-center bg-white">
          <div className="max-w-lg px-5 py-16 md:px-10 md:py-24">
            <h2 className="mb-8 text-3xl font-bold md:text-4xl">
              Account Settings
            </h2>

            <form onSubmit={handleSubmit} className="max-w-sm text-left">
              {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
              {success && (
                <p className="mb-3 text-sm text-green-600">{success}</p>
              )}

              <input
                type="email"
                disabled
                className="mb-4 w-full border border-black bg-[#f2f2f7] px-4 py-3 text-sm cursor-not-allowed"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                className="mb-4 w-full border border-black bg-[#f2f2f7] px-4 py-3 text-sm"
                placeholder="New password (optional)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {role === "RENTER" && (
                <input
                  className="mb-4 w-full border border-black bg-[#f2f2f7] px-4 py-3 text-sm"
                  placeholder="Nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
              )}

              {role === "FEMBOY" && (
                <>
                  <input
                    className="mb-4 w-full border border-black bg-[#f2f2f7] px-4 py-3 text-sm"
                    placeholder="Display Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />

                  <textarea
                    className="mb-4 w-full border border-black bg-[#f2f2f7] px-4 py-3 text-sm"
                    placeholder="Bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />

                  <input
                    type="number"
                    className="mb-4 w-full border border-black bg-[#f2f2f7] px-4 py-3 text-sm"
                    placeholder="Rate per hour"
                    value={baseRate}
                    onChange={(e) => setBaseRate(e.target.value)}
                  />

                  {/* Listing toggle */}
                  <label className="mb-4 flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={isListingActive}
                      onChange={(e) => setIsListingActive(e.target.checked)}
                    />
                    Show my service on Discover
                  </label>
                </>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="mb-4 w-full text-sm"
              />

              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center bg-[#276ef1] px-8 py-4 font-semibold text-white disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT */}
        <div className="relative flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-300"
            style={{
              backgroundImage: `url(${activeBg})`,
              opacity: isFading ? 0 : 1,
            }}
          />
          {nextBg && (
            <div
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-300"
              style={{
                backgroundImage: `url(${nextBg})`,
                opacity: isFading ? 1 : 0,
              }}
            />
          )}
          <div className="absolute inset-0 bg-black/50" />
        </div>
      </div>
    </section>
  );
};

export default SettingsSection;

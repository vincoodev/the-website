import { useEffect, useState } from "react";
import FemboyCard from "@components/ayuAtama/femboyCard";

export default function Example() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchListings() {
      try {
        const res = await fetch(
          "http://localhost:3000/api/ayuAtama/rent-femboy/discover",
          {
            credentials: "include", // keep this if cookies/auth exist
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch listings");
        }

        const data = await res.json();
        setListings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, []);

  return (
    <div className="py-20 pt-20 md:pt-30">
      {/* <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap');
        * { font-family: 'Poppins', sans-serif; }
      `}</style> */}

      <h1 className="text-3xl font-medium text-slate-800 text-center">
        Look Your Local Femboy Here!
      </h1>

      <p className="text-slate-500 text-center">
        Look and stare them scroll it until you find the one you like for your
        desire.
      </p>

      {/* States */}
      {loading && (
        <p className="text-center mt-10 text-slate-400">
          Loading local femboys...
        </p>
      )}

      {error && <p className="text-center mt-10 text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="flex flex-wrap items-center justify-center gap-6 mt-12">
          {listings.map((item) => (
            <FemboyCard
              key={item.listingId}
              name={item.name}
              bio={item.bio}
              rate={item.rate}
              image={item.image}
            />
          ))}
        </div>
      )}
    </div>
  );
}

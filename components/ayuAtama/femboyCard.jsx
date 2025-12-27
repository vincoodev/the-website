function FemboyCard({ name, bio, rate, image }) {
  return (
    <div className="max-w-80 bg-black text-white rounded-2xl">
      <div className="relative -mt-px overflow-hidden rounded-2xl">
        <img
          src={image}
          alt={name}
          className="h-[270px] w-full rounded-2xl hover:scale-105 transition-all duration-300 object-cover object-top"
        />
        <div className="absolute bottom-0 z-10 h-60 w-full bg-gradient-to-t pointer-events-none from-black to-transparent" />
      </div>

      <div className="px-4 pb-6 text-center">
        <p className="mt-4 text-lg">{name}</p>

        <p className="text-sm font-medium bg-gradient-to-r from-[#8B5CF6] via-[#9938CA] to-[#E0724A] text-transparent bg-clip-text">
          {bio}
        </p>

        <p className="mt-2 text-sm text-gray-400">Price: ${rate} / hour</p>
      </div>
    </div>
  );
}
export default FemboyCard;

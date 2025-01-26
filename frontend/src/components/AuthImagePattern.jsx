// AuthImagePattern.jsx
const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex items-center justify-center bg-base-200/50 p-12 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
      </div>
      
      <div className="max-w-md text-center relative z-10 space-y-12">
        <div className="grid grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-2xl ${
                i % 2 === 0 
                  ? "bg-primary/25 animate-pulse" 
                  : "bg-base-content/5 backdrop-blur-sm"
              } shadow-lg transform transition-all duration-300 hover:scale-105`}
            />
          ))}
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-base-content/70 text-lg leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthImagePattern;
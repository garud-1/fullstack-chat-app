import { MessageSquare, Users } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="flex-1 w-full h-full flex items-center justify-center p-6 bg-base-200">
      <div className="w-full h-full rounded-none p-8 md:p-12 flex flex-col items-center justify-center gap-6">
        <div className="flex items-center justify-center w-24 h-24 rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-md animate-bounce">
          <MessageSquare className="w-10 h-10" />
        </div>

        <div className="space-y-2 max-w-2xl text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-base-content">Welcome to Chatty</h1>
          <p className="text-sm md:text-base text-base-content/70">A clean, modern chat built with Tailwind + DaisyUI — select a conversation or search for friends to get started.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          <button className="btn btn-primary btn-md">Start a new chat</button>
          <button className="btn btn-ghost btn-md gap-2">
            <Users className="w-4 h-4" />
            Find friends
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;
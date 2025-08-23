import { Loader2 } from "lucide-react";

const VerificationForm = ({ code, setCode, isVerifying, handleCodeSubmit, handleResendCode, resendCooldown }) => (
  <form onSubmit={handleCodeSubmit} className="space-y-8 max-w-md mx-auto">
    <div className="text-center space-y-2 mb-8">
      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Email Verification</h2>
      <p className="text-gray-600 dark:text-gray-400 text-sm">Enter the 6-digit code sent to your email</p>
    </div>
    <div className="form-control space-y-3">
      <label className="label justify-center">
        <span className="label-text text-base font-semibold text-gray-700 dark:text-gray-300">Verification Code</span>
      </label>
      <div className="relative group">
        <input
          type="text"
          className="input w-full h-16 text-center text-3xl font-mono tracking-[0.5em] border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md focus:shadow-lg placeholder:text-gray-300 dark:placeholder:text-gray-600"
          placeholder="● ● ● ● ● ●"
          maxLength={6}
          value={code}
          onChange={e => setCode(e.target.value.replace(/[^0-9A-Z]/gi, "").toUpperCase())}
          autoComplete="one-time-code"
        />
        <div className="absolute -bottom-6 right-0 text-xs text-gray-500 dark:text-gray-400">{code.length}/6</div>
      </div>
      <div className="flex justify-center space-x-1 mt-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`w-3 h-3 rounded-full transition-all duration-300 ${i < code.length ? "bg-blue-500 shadow-md" : "bg-gray-200 dark:bg-gray-700"}`} />
        ))}
      </div>
    </div>
    <button
      type="submit"
      className="btn w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-xl shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg group"
      disabled={isVerifying || code.length < 6}
    >
      <div className="flex items-center justify-center space-x-3">
        {isVerifying ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Verifying...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Verify Code</span>
          </>
        )}
      </div>
    </button>
    <div className="text-center space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
      <p className="text-sm text-gray-600 dark:text-gray-400">Didn't receive the code?</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
        <button
          type="button"
          className="btn btn-ghost btn-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
          onClick={handleResendCode}
          disabled={resendCooldown > 0}
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
        </button>
      </div>
    </div>
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mt-6">
      <div className="flex items-start space-x-2">
        <svg className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <div>
          <p className="text-xs font-medium text-amber-800 dark:text-amber-300">Security Notice</p>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">This code expires in 10 minutes. Never share it with anyone.</p>
        </div>
      </div>
    </div>
  </form>
);

export default VerificationForm;

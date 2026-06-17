import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No verification token found.');
      return;
    }

    supabase.functions.invoke('custom-verify', { body: { token } })
      .then(({ data, error }) => {
        if (error || !data?.success) {
          setStatus('error');
          setMessage(error?.message ?? 'Invalid or expired link.');
        } else {
          setStatus('success');
        }
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#0D0D0F] flex items-center justify-center p-6">
      <div className="w-full max-w-md p-px rounded-[2rem] bg-gradient-to-br from-purple-500/20 to-cyan-500/20">
        <div className="bg-[#0D0D0F] rounded-[calc(2rem-1px)] p-8 text-center space-y-4">

          {status === 'verifying' && (
            <>
              <div className="w-8 h-8 border-2 border-white/20 border-t-cyan-400 rounded-full animate-spin mx-auto" />
              <p className="text-gray-400 text-sm">Verifying your email...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="text-4xl">🎉</div>
              <h2 className="text-2xl font-black tracking-tight text-white">Email Verified!</h2>
              <p className="text-gray-400 text-sm">Your account is ready. Login in and get started.</p>
              <button
                onClick={() => navigate('/', { state: { openLogin: true } })}
                className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all"
              >
                Log In
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="text-4xl">❌</div>
              <h2 className="text-2xl font-black tracking-tight text-white">Link Invalid</h2>
              {/* <p className="text-gray-400 text-sm">{message}</p> */}
              <button
                onClick={() => navigate('/')}
                className="mt-4 w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
              >
                Back to Home
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useTripContext } from '../../context/TripContext';

interface InviteModalProps {
  onClose: () => void;
}

export const InviteModal = ({ onClose }: InviteModalProps) => {
  const { activeTrip } = useTripContext();
  const [email, setEmail] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  if (!activeTrip) return null;

  const inviteUrl = `${window.location.origin}?tripId=${activeTrip.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    // This is a simulation. In a real app, you'd call a backend service here.
    console.log(`Simulating sending invite to: ${email}`);
    setEmailSent(true);
    setEmail('');
    setTimeout(() => {
        setEmailSent(false);
        onClose();
    }, 2000);
  };

  return (
    <div 
        className="fixed inset-0 bg-gray-900/50 dark:bg-gray-900/80 flex items-center justify-center z-50 backdrop-blur-sm"
        onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md m-4 transform transition-all duration-300 scale-95 animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Invite Friends</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Share this trip with others to plan together!</p>

        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shareable Link</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        readOnly 
                        value={inviteUrl}
                        className="w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-600 dark:text-gray-300"
                    />
                    <button 
                        onClick={handleCopyLink}
                        className="px-4 py-2 text-sm font-semibold text-white bg-teal-600 rounded-md hover:bg-teal-700 transition-colors"
                    >
                        {linkCopied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            </div>

            <div className="my-4 flex items-center">
                <div className="flex-grow border-t border-gray-200 dark:border-gray-600"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
                <div className="flex-grow border-t border-gray-200 dark:border-gray-600"></div>
            </div>

            <form onSubmit={handleSendEmail}>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Invite by Email</label>
                <div className="flex gap-2">
                    <input 
                        type="email"
                        id="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="friend@example.com"
                        required
                        className="w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                    />
                    <button 
                        type="submit"
                        className="px-4 py-2 text-sm font-semibold text-white bg-fuchsia-600 rounded-md hover:bg-fuchsia-700 transition-colors"
                    >
                        Send
                    </button>
                </div>
            </form>
            {emailSent && <p className="text-sm text-green-600 dark:text-green-400 text-center mt-4">Invitation sent!</p>}
        </div>
      </div>
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

import React, { useMemo } from 'react';

interface FoundersNoteDialogProps {
    open: boolean;
    onClose: () => void;
    userId?: string;
}

const FoundersNoteDialog: React.FC<FoundersNoteDialogProps> = ({ open, onClose, userId }) => {
    const xProfileUrl = 'https://x.com/hebuildapps';

    const avatarId = useMemo(() => {
        if (!userId) return 33;
        const code = userId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
        return (code % 65) + 1;
    }, [userId]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[260] flex items-center justify-center bg-[#1f1408]/52 backdrop-blur-sm p-6"
            role="dialog"
            aria-modal="true"
            onClick={onClose}
        >
            <div
                className="w-full max-w-[460px] overflow-hidden border border-[#d6c3a2] bg-white shadow-[0_24px_64px_rgba(0,0,0,0.22)]"
                style={{ fontFamily: 'Georgia, serif' }}
            >

                {/* Header */}
                <div className="px-7 pt-7 pb-0 text-center">
                    <div className="relative inline-block">
                        <img
                            src={`https://i.pravatar.cc/120?img=${avatarId}`}
                            alt="Builder"
                            className="w-[72px] h-[72px] rounded-full border-2 border-[#cbb99b] object-cover mx-auto block"
                        />
                        <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-[#4ba05f] rounded-full border-2 border-[#f7f3ec]" />
                    </div>
                    <p className="mt-3 text-[11px] font-semibold tracking-[0.1em] uppercase text-[#9c835e]">
                        Note from the builder
                    </p>
                    <p className="mt-1 text-[19px] font-semibold text-[#2d1d0c]">
                        Heramb
                    </p>
                </div>

                <div className="mx-7 mt-5 border-t border-[#e2d6c3]" />

                {/* Body */}
                <div className="px-7 py-5 space-y-3.5">
                    <p className="text-[14px] leading-[1.75] text-[#2d1d0c] italic">
                        "Glad you're here."
                    </p>
                    <p className="text-[14px] leading-[1.75] text-[#4f3f2d]">
                        I built this while struggling with the same problem you probably have too many goals, zero traction. Nothing stuck. I got tired of blaming my tools.
                    </p>
                    <p className="text-[14px] leading-[1.75] text-[#4f3f2d]">
                        So I stopped planning and started shipping. This is the thing I actually use now. Not perfect   still building   but it works.
                    </p>
                    <p className="text-[14px] leading-[1.75] text-[#4f3f2d]">
                        Just show up today. Don't optimize. If something's broken or off, reply   I read everything.
                    </p>

                    {/* Signature */}
                    <button
                        type="button"
                        onClick={() => window.open(xProfileUrl, '_blank', 'noopener,noreferrer')}
                        className="group flex w-full items-center gap-3 rounded-xl border-t border-[#e2d6c3] pt-4 mt-4 text-left transition-colors duration-200 hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-black/20"
                        style={{ paddingTop: '16px' }}
                        aria-label="Open Heramb on X"
                    >
                        <img
                            src={`https://i.pravatar.cc/120?img=${avatarId}`}
                            alt=""
                            className="w-8 h-8 rounded-full border border-[#cbb99b] object-cover"
                        />
                        <div>
                            <p className="m-0 text-[13px] font-semibold text-[#2d1d0c] transition-colors duration-200 group-hover:text-white">Heramb</p>
                            <p className="m-0 text-[12px] text-[#9c835e] transition-colors duration-200 group-hover:text-white/80">Built this. Still building.</p>
                        </div>
                    </button>
                </div>

                {/* Footer */}
                <div className="border-t border-[#e2d6c3] bg-[#f0e8d8] px-7 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full rounded-full bg-[#2d1d0c] py-3 text-[14px] font-semibold text-[#f7f3ec] tracking-wide transition-opacity duration-150 hover:opacity-85"
                    >
                        Alright, let's start
                    </button>
                </div>

            </div>
        </div>
    );
};

export default FoundersNoteDialog;
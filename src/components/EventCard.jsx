import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiClock, FiExternalLink, FiBookmark } from 'react-icons/fi';
import { format, isPast, formatDistanceToNow } from 'date-fns';

const EventCard = ({ event, onBookmark, bookmarked }) => {
    const [timeLeft, setTimeLeft] = useState('');

    const eventDate = event.date?.toDate ? event.date.toDate() : new Date(event.date);
    const past = isPast(eventDate);

    useEffect(() => {
        if (past) return;
        const tick = () => setTimeLeft(formatDistanceToNow(eventDate, { addSuffix: false }));
        tick();
        const interval = setInterval(tick, 60000);
        return () => clearInterval(interval);
    }, [eventDate, past]);

    const categoryColors = {
        technical: 'bg-blue-500',
        cultural: 'bg-pink-500',
        sports: 'bg-green-500',
        workshop: 'bg-purple-500',
        seminar: 'bg-amber-500',
        default: 'bg-slate-500',
    };
    const catColor = categoryColors[event.category?.toLowerCase()] || categoryColors.default;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
        >
            {/* Poster */}
            {event.posterURL ? (
                <div className="relative h-44 overflow-hidden">
                    <img src={event.posterURL} alt={event.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {!past && (
                        <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium">
                            <FiClock className="w-3 h-3 text-blue-300" />
                            In {timeLeft}
                        </div>
                    )}
                    {past && (
                        <div className="absolute bottom-2 left-2 bg-slate-600/80 text-white text-xs px-3 py-1.5 rounded-full">
                            Event Ended
                        </div>
                    )}
                </div>
            ) : (
                <div className={`h-32 ${catColor} flex items-center justify-center`}>
                    <FiCalendar className="w-12 h-12 text-white/70" />
                </div>
            )}

            {/* Content */}
            <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug">{event.title}</h3>
                    <button
                        onClick={() => onBookmark?.(event.id)}
                        className={`p-1.5 rounded-lg flex-shrink-0 transition-all ${bookmarked ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-400 hover:text-blue-600'}`}
                    >
                        <FiBookmark className="w-4 h-4" fill={bookmarked ? 'currentColor' : 'none'} />
                    </button>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{event.description}</p>

                <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <FiCalendar className="w-3.5 h-3.5 text-blue-500" />
                        <span>{format(eventDate, 'EEE, MMM d yyyy • h:mm a')}</span>
                    </div>
                    {event.venue && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <FiMapPin className="w-3.5 h-3.5 text-red-500" />
                            <span>{event.venue}</span>
                        </div>
                    )}
                </div>

                {event.registrationLink && !past && (
                    <a
                        href={event.registrationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2 rounded-xl gradient-brand text-white text-xs font-semibold hover:opacity-90 transition-all"
                    >
                        Register Now <FiExternalLink className="w-3 h-3" />
                    </a>
                )}
            </div>
        </motion.div>
    );
};

export default EventCard;

import React from 'react';
import { Hashtag } from '../types';
import { Link } from 'react-router-dom';

interface HashtagListProps {
  hashtags: Hashtag[];
  className?: string;
}

export const HashtagList: React.FC<HashtagListProps> = ({ hashtags, className = '' }) => {
  if (!hashtags || hashtags.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {hashtags.map((hashtag) => (
        <Link
          key={hashtag.id}
          to={`/hashtag/${hashtag.name}`}
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
        >
          #{hashtag.name}
        </Link>
      ))}
    </div>
  );
};

export default HashtagList; 
export const extractHashtags = (text: string): string[] => {
  const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
  const matches = text.match(hashtagRegex) || [];
  return matches.map(tag => tag.slice(1)); // Remove the # symbol
};

export const formatHashtag = (text: string): string => {
  return text.replace(/#[\w\u0590-\u05ff]+/g, (match) => {
    return `<a href="/hashtag/${match.slice(1)}" class="text-blue-600 hover:underline">${match}</a>`;
  });
};

export const createHashtagObjects = (hashtags: string[]): { name: string }[] => {
  return hashtags.map(name => ({ name }));
}; 
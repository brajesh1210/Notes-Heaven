export const APP_NAME = 'Notes Heaven';
export const TAGLINE = 'Better Notes. Brighter Future.';

export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  forgot: '/forgot-password',
  reset: '/reset-password/:token',
  oauthCallback: '/auth/callback',
  dashboard: '/dashboard',
  notes: '/notes',
  folders: '/folders',
  folderDetail: '/folders/:id',
  createNote: '/notes/new',
  editor: '/notes/:id/edit',
  viewer: '/notes/:id',
  search: '/search',
  trash: '/trash',
};

export const FOLDER_COLORS = ['#1D4ED8', '#0EA5E9', '#7C3AED', '#059669', '#EA580C', '#DC2626', '#DB2777', '#64748B'];

export const SORT_OPTIONS = [
  { value: '-updatedAt', label: 'Last modified' },
  { value: '-createdAt', label: 'Newest first' },
  { value: 'createdAt', label: 'Oldest first' },
  { value: 'title', label: 'Title (A-Z)' },
];

export const TRASH_RETENTION_DAYS = 5;

export default { APP_NAME, TAGLINE, ROUTES, FOLDER_COLORS, SORT_OPTIONS, TRASH_RETENTION_DAYS };

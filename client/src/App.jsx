import { lazy, Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

// layouts
import AppShell from './components/layout/AppShell.jsx';
import { ProtectedRoute, PublicOnlyRoute } from './components/common/ProtectedRoute.jsx';

// public pages
import Landing from './pages/Landing.jsx';
import Login from './pages/auth/Login.jsx';
import Signup from './pages/auth/Signup.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';
import OAuthCallback from './pages/auth/OAuthCallback.jsx';
import NotFound from './pages/NotFound.jsx';

// app pages (dashboard/all-notes stay eager; heavy pages load on demand)
import Dashboard from './pages/Dashboard.jsx';
import AllNotes from './pages/AllNotes.jsx';
import Folders from './pages/Folders.jsx';
import FolderDetail from './pages/FolderDetail.jsx';
import Trash from './pages/Trash.jsx';
import { PageLoader } from './components/ui/Spinner.jsx';

const SearchResults = lazy(() => import('./pages/SearchResults.jsx'));
const CreateNote = lazy(() => import('./pages/notes/CreateNote.jsx'));
const NoteEditorPage = lazy(() => import('./pages/notes/NoteEditorPage.jsx'));
const NoteView = lazy(() => import('./pages/notes/NoteView.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));

/**
 * Routes:
 *  Public   : / , /login , /signup , /forgot-password , /reset-password/:token , /auth/callback
 *  Protected: /dashboard , /notes , /notes/new , /notes/:id , /notes/:id/edit ,
 *             /folders , /folders/:id , /search , /trash , /profile
 */
const App = () => (
  <Suspense fallback={<PageLoader label="Loading..." />}>
  <Routes>
    <Route path="/" element={<Landing />} />

    <Route
      path="/login"
      element={
        <PublicOnlyRoute>
          <Login />
        </PublicOnlyRoute>
      }
    />
    <Route
      path="/signup"
      element={
        <PublicOnlyRoute>
          <Signup />
        </PublicOnlyRoute>
      }
    />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password/:token" element={<ResetPassword />} />
    <Route path="/auth/callback" element={<OAuthCallback />} />

    <Route element={<ProtectedRoute />}>
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/notes" element={<AllNotes />} />
        <Route path="/notes/new" element={<CreateNote />} />
        <Route path="/notes/:id" element={<NoteView />} />
        <Route path="/notes/:id/edit" element={<NoteEditorPage />} />
        <Route path="/folders" element={<Folders />} />
        <Route path="/folders/:id" element={<FolderDetail />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/trash" element={<Trash />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Route>

    <Route path="/404" element={<NotFound />} />
    <Route path="*" element={<Navigate to="/404" replace />} />
  </Routes>
  </Suspense>
);

export default App;

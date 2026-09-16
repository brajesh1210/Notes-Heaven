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

// app pages
import Dashboard from './pages/Dashboard.jsx';
import AllNotes from './pages/AllNotes.jsx';
import Folders from './pages/Folders.jsx';
import FolderDetail from './pages/FolderDetail.jsx';
import Trash from './pages/Trash.jsx';
import SearchResults from './pages/SearchResults.jsx';
import CreateNote from './pages/notes/CreateNote.jsx';
import NoteEditorPage from './pages/notes/NoteEditorPage.jsx';
import NoteView from './pages/notes/NoteView.jsx';

/**
 * Routes:
 *  Public   : / , /login , /signup , /forgot-password , /reset-password/:token , /auth/callback
 *  Protected: /dashboard , /notes , /notes/new , /notes/:id , /notes/:id/edit ,
 *             /folders , /folders/:id , /search , /trash
 */
const App = () => (
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
      </Route>
    </Route>

    <Route path="/404" element={<NotFound />} />
    <Route path="*" element={<Navigate to="/404" replace />} />
  </Routes>
);

export default App;

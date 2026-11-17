import { Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { AboutPage } from '@/pages/AboutPage';
import { AnalyzePage } from '@/pages/AnalyzePage';
import { BlueprintPage } from '@/pages/BlueprintPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { FlStudioPage } from '@/pages/FlStudioPage';
import { LandingPage } from '@/pages/LandingPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ProjectPage } from '@/pages/ProjectPage';

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<LandingPage />} />
        <Route path="blueprint" element={<BlueprintPage />} />
        <Route path="analyze" element={<AnalyzePage />} />
        <Route path="fl-studio" element={<FlStudioPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="projects/:projectId" element={<ProjectPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

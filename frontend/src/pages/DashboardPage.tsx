import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useLessons } from '../hooks/useLessons';
import { OverviewTab } from '../components/dashboard/OverviewTab';
import { GeneratorTab } from '../components/dashboard/GeneratorTab';
import { LibraryTab } from '../components/dashboard/LibraryTab';
import { AnalyticsTab } from '../components/dashboard/AnalyticsTab';
import { TemplatesTab } from '../components/dashboard/TemplatesTab';
import { ResourcesTab } from '../components/dashboard/ResourcesTab';
import { SettingsTab } from '../components/dashboard/SettingsTab';
import { Header } from '../components/Header';

export function DashboardPage() {
  const location = useLocation();
  const lessons = useLessons();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'overview';

  useEffect(() => {
    void lessons.load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderTab = () => {
    switch (currentTab) {
      case 'generator':
        return <GeneratorTab />;
      case 'library':
        return <LibraryTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'templates':
        return <TemplatesTab />;
      case 'resources':
        return <ResourcesTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="space-y-2">
      <Header />
      {renderTab()}
    </div>
  );
}

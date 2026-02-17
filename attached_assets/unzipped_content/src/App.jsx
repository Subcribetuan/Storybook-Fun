import { useStore } from './hooks/useStore';
import StarField from './components/StarField';
import HomeView from './components/HomeView';
import ReadingView from './components/ReadingView';
import InstallBanner from './components/InstallBanner';

export default function App() {
  const { view } = useStore();

  return (
    <>
      <StarField />
      {view === 'home' && <HomeView />}
      {view === 'reading' && <ReadingView />}
      <InstallBanner />
    </>
  );
}

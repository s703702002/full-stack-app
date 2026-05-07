import ProfileCard from '../components/profile/ProfileCard';
import SecurityCard from '../components/profile/SecurityCard';

export default function ProfilePage() {
  return (
    <div className="max-w-3xl mx-auto mt-8 p-4 sm:mt-12 space-y-6 animate-fade-in">
      <ProfileCard />
      <SecurityCard />
    </div>
  );
}

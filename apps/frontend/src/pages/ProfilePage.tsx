import { Button } from '@full-stack-app/ui';
import ProfileCard from '../components/profile/ProfileCard';
import SecurityCard from '../components/profile/SecurityCard';
import { privateApi } from '../api';
import { useState } from 'react';

export default function ProfilePage() {
  const [file, setFile] = useState<null | File>();

  return (
    <div className="max-w-3xl mx-auto mt-8 p-4 sm:mt-12 space-y-6 animate-fade-in">
      <ProfileCard />
      <SecurityCard />
      <div>
        <input
          type="file"
          onChange={(e) => {
            setFile(e.target.files?.[0]);
          }}
        />
        <Button
          onClick={async () => {
            if (!file) return;

            const { data } = await privateApi.post(
              '/api/upload/presigned-url',
              {
                fileName: file.name,
                contentType: file.type,
              },
            );

            console.log('data', data);

            privateApi.put(data.url, file);
          }}
        >
          上傳檔案測試
        </Button>
      </div>
    </div>
  );
}

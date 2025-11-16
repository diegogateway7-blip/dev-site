import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileHeader } from '@/components/content-cove/profile-header';
import placeholderImages from '@/lib/placeholder-images.json';

const VerifiedIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
    >
      <path
        d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM10.4961 16.6133L6.46484 12.582L7.87891 11.168L10.4961 13.7852L16.1211 8.16016L17.5352 9.57422L10.4961 16.6133Z"
        fill="#3B82F6"
      />
    </svg>
  );

export function ProfileCard() {
  const { coverImage, profileAvatar } = placeholderImages.profile;
  return (
    <div className="bg-card">
      <div className="relative h-48 md:h-64 w-full">
        <ProfileHeader />
        <Image
          src={coverImage.url}
          alt={coverImage.alt}
          data-ai-hint={coverImage.hint}
          width={coverImage.width}
          height={coverImage.height}
          unoptimized
          className="object-cover w-full h-full"
          priority
        />
        <div className="absolute bottom-0 left-6 translate-y-1/2">
          <Avatar className="h-28 w-28 border-4 border-card">
            <AvatarImage 
              src={profileAvatar.url} 
              data-ai-hint={profileAvatar.hint} 
              alt={profileAvatar.alt} 
            />
            <AvatarFallback>LS</AvatarFallback>
          </Avatar>
        </div>
      </div>
      <div className="pt-16 px-6 pb-6">
        <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold font-headline">Larissa Santos</h1>
            <VerifiedIcon />
        </div>
        <p className="text-muted-foreground">@larissasantos</p>
        <p className="mt-2 text-foreground/80">Safadinha gostosa 🔥 Conteúdo exclusivo todos os dias ✨</p>
      </div>
    </div>
  );
}

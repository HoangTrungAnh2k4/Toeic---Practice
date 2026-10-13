import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { UserAvatar } from '@/components/user/user-avatar';
import { cn } from '@/lib/utils';
import { CurrentUser, ProfileField } from '../types';
import ProfileFieldList from './ProfileFieldList';

interface ProfileIdentityCardProps {
    user: CurrentUser;
    fields: ProfileField[];
    className?: string;
}

export default function ProfileIdentityCard({ user, fields, className }: ProfileIdentityCardProps) {
    return (
        <Card
            role="region"
            aria-labelledby="profile-name"
            className={cn(
                'gap-0 bg-card shadow-sm hover:shadow-md py-0 border border-sub2/30 ring-0 text-main transition-shadow',
                className,
            )}
        >
            {/* Dải nền thương hiệu, avatar đè lên mép dưới */}
            <div aria-hidden="true" className="bg-main h-20" />

            <CardContent className="flex flex-col items-center gap-3 px-5 pb-5 text-center">
                <UserAvatar user={user} className="-mt-10 ring-4 ring-card size-20" fallbackClassName="text-2xl" />
                <div className="flex flex-col gap-1 w-full min-w-0">
                    <h2 id="profile-name" className="font-bold text-main text-xl tracking-tight">
                        {user.name}
                    </h2>
                    <p className="font-medium text-subText text-sm truncate">{user.email}</p>
                </div>
                <Badge className="bg-sub1 px-2 rounded-md h-6 font-semibold text-[0.6875rem] text-main tracking-wider">
                    {user.role}
                </Badge>
            </CardContent>

            <Separator className="bg-sub2/20" />

            <CardContent className="px-5 pb-2">
                <ProfileFieldList fields={fields} />
            </CardContent>
        </Card>
    );
}

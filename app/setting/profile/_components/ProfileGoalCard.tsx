import Link from 'next/link';
import { LuArrowRight, LuTarget } from 'react-icons/lu';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ProfileField } from '../types';
import ProfileFieldList from './ProfileFieldList';

interface ProfileGoalCardProps {
    fields: ProfileField[];
    className?: string;
}

export default function ProfileGoalCard({ fields, className }: ProfileGoalCardProps) {
    return (
        <Card
            role="region"
            aria-labelledby="profile-goal-title"
            className={cn(
                'gap-0 bg-card shadow-sm hover:shadow-md py-0 border border-sub2/30 ring-0 text-main transition-shadow',
                className,
            )}
        >
            <CardHeader className="px-5 pt-5">
                <div className="flex items-start gap-3">
                    <span className="flex justify-center items-center bg-main rounded-lg size-11 text-sub3 shrink-0">
                        <LuTarget className="size-5" aria-hidden="true" />
                    </span>
                    <div className="flex flex-col gap-0.5">
                        <h2 id="profile-goal-title" className="font-semibold text-main text-lg">
                            Mục tiêu luyện thi
                        </h2>
                        <CardDescription className="font-medium text-subText">
                            Điểm mục tiêu và lịch thi theo lộ trình học hiện tại.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="px-5 pt-2 pb-2">
                <ProfileFieldList fields={fields} />
            </CardContent>

            <CardFooter className="justify-end bg-sub1/30 px-5 py-3 border-sub2/20">
                <Link href="/schedule" className={cn(buttonVariants({ variant: 'third', size: 'sm' }), 'gap-2 bg-white')}>
                    <span>Xem lộ trình</span>
                    <LuArrowRight className="size-4" aria-hidden="true" />
                </Link>
            </CardFooter>
        </Card>
    );
}

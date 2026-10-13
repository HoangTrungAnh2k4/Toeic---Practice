import { ProfileField } from '../types';

interface ProfileFieldListProps {
    fields: ProfileField[];
}

export default function ProfileFieldList({ fields }: ProfileFieldListProps) {
    return (
        <dl className="flex flex-col divide-y divide-sub2/20">
            {fields.map(({ id, label, value, hint, Icon }) => (
                <div key={id} className="flex flex-wrap justify-between items-center gap-x-4 gap-y-1 py-3">
                    <dt className="flex items-center gap-3 font-medium text-subText text-sm">
                        <span className="flex justify-center items-center bg-sub1 rounded-lg size-9 text-main shrink-0">
                            <Icon className="size-4" aria-hidden="true" />
                        </span>
                        {label}
                    </dt>
                    <dd className="flex flex-col items-end ml-auto text-right">
                        <span className="font-semibold text-main text-sm">{value}</span>
                        {hint && <span className="font-medium text-subText text-xs">{hint}</span>}
                    </dd>
                </div>
            ))}
        </dl>
    );
}

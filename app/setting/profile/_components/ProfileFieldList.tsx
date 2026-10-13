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
                        <Icon className="size-4 shrink-0" aria-hidden="true" />
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

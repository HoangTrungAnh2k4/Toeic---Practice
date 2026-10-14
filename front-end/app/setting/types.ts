import type { IconType } from 'react-icons';

export interface SettingSection {
    id: string;
    title: string;
    description: string;
    href: string;
    actionLabel: string;
    Icon: IconType;
}

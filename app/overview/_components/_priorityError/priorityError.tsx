import FrequencyMeter from './_components/FrequencyMeter';
import { ERRORS } from './types';
import Header from './_components/Header';
import Button from '@/components/ui/button';
import { MdError } from 'react-icons/md';
import { BiErrorAlt } from 'react-icons/bi';

export default function PriorityError() {
    return (
        <section className="flex flex-col gap-4">
            {/* Header */}
            <Header />

            {/* Cards */}
            <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                {ERRORS.map((err) => {
                    const isSpeaking = err.skill === 'Speaking';

                    return (
                        <article
                            key={err.title}
                            className="relative flex flex-col justify-between gap-5 bg-white shadow-sm p-6 pl-7 border border-[#E8E5F5] rounded-xl overflow-hidden"
                        >
                            {/* Accent bar */}
                            <span
                                aria-hidden
                                className={`absolute inset-y-0 left-0 w-1.5 ${isSpeaking ? 'bg-[#3C3454]' : 'bg-sub2'}`}
                            />

                            <div className="flex flex-col gap-3">
                                <div className="flex flex-wrap justify-between items-center gap-2">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`px-2 py-0.5 rounded-md font-semibold text-[0.6875rem] leading-3.5 tracking-wider ${
                                                isSpeaking
                                                    ? 'bg-[#3C3454] text-white'
                                                    : 'bg-[#E8E5F5] text-[#3C3454] ring-1 ring-sub2/60'
                                            }`}
                                        >
                                            {err.skill} {err.part}
                                        </span>
                                        <span className="font-medium text-sub2 text-xs tracking-wider">{err.task}</span>
                                    </div>
                                    <FrequencyMeter hit={err.frequency.hit} total={err.frequency.total} />
                                </div>

                                <h4 className="font-semibold text-[#3C3454] text-[1.125rem] leading-6 tracking-[-0.01em]">
                                    {err.title}
                                </h4>
                                <p className="font-medium text-[0.875rem] text-subText leading-5.5">
                                    {err.description}
                                </p>
                            </div>

                            <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-3 pt-4 border-[#E8E5F5] border-t">
                                <div className="flex items-center gap-1.5 font-semibold text-[#3C3454] text-[0.6875rem] leading-3.5 tracking-wider">
                                    <BiErrorAlt className="text-sub3" size={20} />
                                    <span>{err.impact}</span>
                                </div>
                                <Button type="button" size={'sm'} variant={'primary'}>
                                    <span>{err.ctaLabel}</span>
                                </Button>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

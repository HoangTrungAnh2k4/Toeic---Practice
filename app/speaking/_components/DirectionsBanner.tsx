import { LuInfo } from 'react-icons/lu';

export default function DirectionsBanner() {
    return (
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
            <div className="flex items-start gap-3">
                <LuInfo className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <div className="flex flex-col gap-1">
                    <h2 className="text-sm font-semibold text-foreground sm:text-base">
                        Question 3 of 11: Describe a Picture
                    </h2>
                    <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                        <strong className="font-semibold text-foreground">Directions:</strong> In this part of the
                        test, you will describe the picture on your screen in as much detail as you can. You will have
                        45 seconds to prepare your response. Then you will have 30 seconds to speak about the picture.
                    </p>
                </div>
            </div>
        </div>
    );
}

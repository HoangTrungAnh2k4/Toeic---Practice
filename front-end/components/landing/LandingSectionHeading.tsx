type LandingSectionHeadingProps = {
    id: string;
    eyebrow: string;
    title: [string, string];
    children: React.ReactNode;
};

/** Tiêu đề section landing: nhãn nhỏ, tiêu đề hai dòng, một câu mô tả. */
export default function LandingSectionHeading({ id, eyebrow, title, children }: LandingSectionHeadingProps) {
    return (
        <div className="flex flex-col gap-3 mx-auto w-full max-w-300">
            <p className="font-semibold text-white text-xs uppercase tracking-wider">{eyebrow}</p>
            <h2 id={id} className="font-bold text-sub3 text-4xl sm:text-5xl leading-[1.05] tracking-tight">
                {title[0]}
                <br />
                {title[1]}
            </h2>
            <p className="max-w-xl text-white leading-relaxed">{children}</p>
        </div>
    );
}

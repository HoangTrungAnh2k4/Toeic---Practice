type Props = { compact?: boolean };

export default function DirectionsBanner({ compact = false }: Props) {
    return (
        <section aria-labelledby="directions-title" className="pl-4 border-[#F5B841] border-l-4">
            <p className="font-medium text-[#8B84B8] text-xs uppercase tracking-wider">Question 3 of 11</p>
            <h2 id="directions-title" className="font-semibold text-[#3C3454] text-lg sm:text-xl">
                Describe a Picture
            </h2>

            {!compact && (
                <p className="mt-2 max-w-3xl text-[#3C3454]/75 text-sm leading-relaxed">
                    <strong className="font-semibold text-[#3C3454]">Directions:</strong> In this part of the test, you
                    will describe the picture on your screen in as much detail as you can. You will have 45 seconds to
                    prepare your response. Then you will have 30 seconds to speak about the picture.
                </p>
            )}
        </section>
    );
}

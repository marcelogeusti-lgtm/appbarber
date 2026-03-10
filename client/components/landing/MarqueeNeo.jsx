'use client';

export default function MarqueeNeo() {
    const brands = ['ACME CORP', 'GLOBEX', 'SOYLENT', 'INITECH', 'UMBRELLA', 'Hooli', 'Stark Ind.'];
    return (
        <div className="bg-[#171e19] border-y-2 border-black py-8 overflow-hidden flex whitespace-nowrap">
            <div className="flex animate-marquee gap-24 items-center">
                {[...brands, ...brands].map((brand, i) => (
                    <span
                        key={i}
                        className="font-cabinet font-extrabold text-[#b7c6c2] text-4xl opacity-50 tracking-tighter uppercase"
                    >
                        {brand}
                    </span>
                ))}
            </div>

            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
            `}</style>
        </div>
    );
}

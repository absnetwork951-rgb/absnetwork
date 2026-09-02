import Image from 'next/image';

export default function NetworkImageMosaic() {
  return (
    <section className="bg-white">
      <div className="page-container py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] overflow-hidden rounded-2xl border border-slate-200 shadow-xl">
          <div className="relative min-h-[300px] md:row-span-2 md:min-h-[540px]">
            <Image
              src="/net.jpg"
              alt="ABS Network high-speed fiber optic broadband network infrastructure"
              fill
              sizes="(max-width: 768px) 100vw, 66vw"
              quality={85}
              className="object-cover"
            />
          </div>
          <div className="relative min-h-[300px] md:min-h-[270px]">
            <Image
              src="/net1.jpg"
              alt="ABS Network fiber optic broadband connectivity for homes and businesses"
              fill
              sizes="(max-width: 768px) 100vw, 34vw"
              className="object-cover"
            />
          </div>
          <div className="relative min-h-[300px] md:min-h-[270px]">
            <Image
              src="/net2.jpg"
              alt="ABS Network reliable internet networking technology"
              fill
              sizes="(max-width: 768px) 100vw, 34vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

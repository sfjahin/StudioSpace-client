const steps = [
  {
    number: "01",
    title: "Discover Spaces",
    description: "Browse studios by craft, location and budget.",
  },
  {
    number: "02",
    title: "Select Shoot Hours",
    description: "Pick your date and hours. See exactly what's included.",
  },
  {
    number: "03",
    title: "Book Instantly",
    description: "Transparent pricing and a real host, confirmed in a click.",
  },
  {
    number: "04",
    title: "Create & Produce",
    description: "Walk in, settle in, and make something that matters.",
  },
];

export default function StepsSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 pb-16">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
        How booking works
      </p>
      <h2 className="mt-4 text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl">
        Less logistics. More creating.
      </h2>

      <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step) => (
          <div key={step.number}>
            <p className="text-3xl font-normal text-brand">{step.number}</p>
            <div className="mt-5 border-t border-zinc-200 pt-5">
              <h3 className="text-base font-bold text-zinc-950">
                {step.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-zinc-500">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

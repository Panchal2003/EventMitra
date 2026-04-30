export function SectionHeader({ action, description, eyebrow, title }) {
  return (
    <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.26em] text-primary-700">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="section-title">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">{description}</p>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}


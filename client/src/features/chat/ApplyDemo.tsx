import { useState, type ReactNode } from 'react';
import { Button, Modal } from '../../components';

const STEPS: { title: string; detail: ReactNode }[] = [
  {
    title: 'Claude drafts a change to the map',
    detail: 'Add, reword or retire a requirement, record an intent, set a status.',
  },
  {
    title: 'You see it as a proposal card — nothing is written yet',
    detail: 'Apply changes or Discard; the map is untouched until you pick one.',
  },
  {
    title: 'Apply writes it to data/project.json tagged AI-inferred',
    detail: 'The same provenance every other inferred entry carries — never human-verified.',
  },
  {
    title: "The card shows 'Chat edit · review' until a human verifies it",
    detail: (
      <>
        <span className="apply-demo-pill">Chat edit · review</span> sits on the edited card, so the
        map never hides where a change came from.
      </>
    ),
  },
  {
    title: 'validate:data and the advisories gate every write',
    detail: 'A draft that breaks the schema or trips an advisory never reaches the file.',
  },
];

const FOOTNOTE =
  'Not built in this prototype — the read side is; see docs/ONBOARDING.md for the capture workflow.';

/** The walkthrough itself, so the steps can be rendered (and tested) without opening anything. */
export function ApplyDemoDialog({ onClose }: { onClose: () => void }) {
  return (
    <Modal
      title="What happens when you apply"
      onClose={onClose}
      footer={
        <>
          <p className="apply-demo-note">{FOOTNOTE}</p>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </>
      }
    >
      <ol className="apply-demo-steps">
        {STEPS.map((step, i) => (
          <li key={step.title} className="apply-demo-step">
            <span className="apply-demo-num" aria-hidden="true">
              {i + 1}
            </span>
            <div>
              <p className="apply-demo-title">{step.title}</p>
              <p className="apply-demo-detail">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </Modal>
  );
}

/** The ghost link under a reply that shows the write side the prototype stops short of. */
export function ApplyDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="ghost" className="apply-demo-open" onClick={() => setOpen(true)}>
        See what Apply would do ›
      </Button>
      {open && <ApplyDemoDialog onClose={() => setOpen(false)} />}
    </>
  );
}

import { useState } from 'react';
import { Button, Modal } from '../../components';

const STEPS: { title: string; details: string[] }[] = [
  {
    title: 'This tool is an extension to Claude — think of it as the Claude Code UI',
    details: [
      'Normal chat messages, with the addition of pointing at a specific part of the code.',
      'You can tag features, requirements, intents and systems that you want to change.',
    ],
  },
  {
    title: "The AI gets more context on what you're trying to change and goes and attacks the work",
    details: [],
  },
  {
    title:
      'Before applying the final change, it checks the changes against your intent for verification',
    details: ['The AI chat transcripts become a short summary of intent, verified by the user.'],
  },
  {
    title: 'Human intent, product requirements and features all live side by side',
    details: [
      'Now we have a forever capture of the overall system architecture, intent, features and product requirements.',
    ],
  },
];

const FOOTNOTE =
  'Not built in this prototype — the read side is; see docs/ONBOARDING.md for the capture workflow.';

/** The walkthrough itself, so the steps can be rendered (and tested) without opening anything. */
export function ApplyDemoDialog({ onClose }: { onClose: () => void }) {
  return (
    <Modal
      title="What happens during the chat experience"
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
              {step.details.map((detail) => (
                <p key={detail} className="apply-demo-detail">
                  {detail}
                </p>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </Modal>
  );
}

/** The ghost link under a reply that shows what the chat experience is for. */
export function ApplyDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="ghost" className="apply-demo-open" onClick={() => setOpen(true)}>
        See how the chat experience works ›
      </Button>
      {open && <ApplyDemoDialog onClose={() => setOpen(false)} />}
    </>
  );
}

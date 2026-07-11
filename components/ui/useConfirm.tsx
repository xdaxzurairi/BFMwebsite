'use client';

import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

export function useConfirm(labels: { confirm: string; cancel: string }) {
  const [state, setState] = useState<{ msg: string; onYes: () => void } | null>(null);
  const ask = (msg: string, onYes: () => void) => setState({ msg, onYes });
  const node = state && (
    <Modal
      title="Confirm"
      onClose={() => setState(null)}
      footer={
        <>
          <Button variant="ghost" onClick={() => setState(null)}>
            {labels.cancel}
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              state.onYes();
              setState(null);
            }}
          >
            {labels.confirm}
          </Button>
        </>
      }
    >
      <p style={{ fontSize: 15, lineHeight: 1.5 }}>{state.msg}</p>
    </Modal>
  );
  return { ask, node };
}

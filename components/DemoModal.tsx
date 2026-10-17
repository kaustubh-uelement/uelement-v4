'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Icon } from './Icon';
import { ContactForm } from './ContactForm';

export function triggerDemoModal() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('uelement:open-demo-modal'));
  }
}

export interface DemoModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function DemoModal({ isOpen: controlledIsOpen, onClose }: DemoModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    }
    if (!isControlled) {
      setInternalIsOpen(false);
    }
  }, [onClose, isControlled]);

  useEffect(() => {
    const handleTrigger = () => {
      setInternalIsOpen(true);
    };
    window.addEventListener('uelement:open-demo-modal', handleTrigger);
    return () => {
      window.removeEventListener('uelement:open-demo-modal', handleTrigger);
    };
  }, []);

  // Keyboard accessibility (Escape key to close)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClose]);

  // Lock background scroll when open
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="demo-modal-overlay is-visible" role="presentation">
      {/* Backdrop overlay */}
      <div
        className="demo-modal-backdrop is-visible"
        onClick={handleClose}
        aria-hidden="true"
        style={{
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      />

      {/* Dialog container */}
      <div className="demo-modal-container">
        <div
          className="demo-modal is-visible"
          role="dialog"
          aria-modal="true"
          aria-labelledby="demo-modal-title"
          aria-describedby="demo-modal-desc"
          style={{
            backdropFilter: 'blur(36px) saturate(190%)',
            WebkitBackdropFilter: 'blur(36px) saturate(190%)',
          }}
        >
          {/* Header */}
          <div className="demo-modal__header">
            <div className="demo-modal__title-group">
              <span className="demo-modal__kicker">LIVE INTERACTIVE DEMO</span>
              <h2 id="demo-modal-title" className="demo-modal__title">
                Book a Demo
              </h2>
              <p id="demo-modal-desc" className="demo-modal__desc">
                Select your platform or product of interest. Our engineering team will prepare an environment tailored to your requirements.
              </p>
            </div>
            <button
              type="button"
              className="demo-modal__close-btn"
              onClick={handleClose}
              aria-label="Close demo modal"
            >
              <Icon name="close" />
            </button>
          </div>

          {/* Form */}
          <div className="demo-modal__body">
            <ContactForm
              kind="demo"
              submitBtnClass="btn btn--metal"
              doneAction={
                <button
                  type="button"
                  className="btn btn--glass"
                  onClick={handleClose}
                  style={{ marginTop: 14 }}
                >
                  Close
                </button>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

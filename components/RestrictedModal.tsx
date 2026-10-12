'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Icon } from './Icon';

export function triggerRestrictedNotice() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('uelement:restricted-notice'));
  }
}

interface RestrictedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function RestrictedButton({
  children,
  className,
  style,
  onClick,
  ...props
}: RestrictedButtonProps) {
  return (
    <button
      type="button"
      className={className}
      style={style}
      onClick={(e) => {
        if (onClick) onClick(e);
        triggerRestrictedNotice();
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export function RestrictedModal() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const handleTrigger = () => {
      setIsOpen(true);
    };
    window.addEventListener('uelement:restricted-notice', handleTrigger);
    return () => {
      window.removeEventListener('uelement:restricted-notice', handleTrigger);
    };
  }, []);

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

  if (!isOpen) return null;

  return (
    <div className="restricted-overlay-wrap is-visible" role="presentation">
      {/* Backdrop overlay */}
      <div
        className="restricted-backdrop is-visible"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Dialog container */}
      <div className="restricted-modal-container">
        <div
          className="restricted-modal is-visible"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="restricted-modal-title"
          aria-describedby="restricted-modal-desc"
        >
          {/* Header */}
          <div className="restricted-modal__header">
            <div className="restricted-modal__badge">
              <Icon name="shield" />
            </div>
            <div className="restricted-modal__title-group">
              <span className="restricted-modal__kicker">AUTHORIZATION POLICY</span>
              <h2 id="restricted-modal-title" className="restricted-modal__title">
                Access Restricted
              </h2>
            </div>
            <button
              type="button"
              className="restricted-modal__close-btn"
              onClick={handleClose}
              aria-label="Close restricted notice"
            >
              <Icon name="close" />
            </button>
          </div>

          {/* Body Content with exact user text */}
          <div className="restricted-modal__content">
            <p id="restricted-modal-desc" className="restricted-modal__body">
              Access to this material is currently restricted in your region due to Authorization policies. If you require access, please contact your designated UElement SPOC for assistance.
            </p>
          </div>

          {/* Action Button */}
          <div className="restricted-modal__actions">
            <button
              type="button"
              className="btn btn--metal btn--sm restricted-modal__btn"
              onClick={handleClose}
            >
              Acknowledge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

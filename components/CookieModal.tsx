'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon } from './Icon';

const COOKIE_CONSENT_KEY = 'uelement_cookie_consent';

export function CookieModal() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if the user has already accepted/declined cookies
    const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!storedConsent) {
      setMounted(true);
      // Small timeout for smooth entrance after page load
      const timer = setTimeout(() => {
        setVisible(true);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (choice: 'all' | 'essential') => {
    localStorage.setItem(COOKIE_CONSENT_KEY, choice);
    setVisible(false);
    setTimeout(() => {
      setMounted(false);
    }, 350);
  };

  const handleDismiss = () => {
    // If dismissed without choosing, record essential to prevent spamming
    localStorage.setItem(COOKIE_CONSENT_KEY, 'essential');
    setVisible(false);
    setTimeout(() => {
      setMounted(false);
    }, 350);
  };

  if (!mounted) return null;

  return (
    <div className={`cookie-overlay-wrap ${visible ? 'is-visible' : ''}`}>
      {/* 1. Backdrop overlay - dim background page */}
      <div
        className={`cookie-backdrop ${visible ? 'is-visible' : ''}`}
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* 2. Dialog container */}
      <div className="cookie-modal-container">
        <div
          className={`cookie-modal ${visible ? 'is-visible' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-modal-title"
          style={{
            backdropFilter: 'blur(34px) saturate(190%)',
            WebkitBackdropFilter: 'blur(34px) saturate(190%)',
          }}
        >
          {/* Header */}
          <div className="cookie-modal__header">
            <div className="cookie-modal__badge">
              <Icon name="shield" />
            </div>
            <div className="cookie-modal__title-group">
              <h2 id="cookie-modal-title" className="cookie-modal__title">
                Privacy & Security First
              </h2>
              <p className="cookie-modal__subtitle">
                UElement — Sovereign Systems & Data Protection
              </p>
            </div>
            <button
              type="button"
              className="cookie-modal__close-btn"
              onClick={handleDismiss}
              aria-label="Close cookie notice"
            >
              <Icon name="close" />
            </button>
          </div>

          {/* Body Description */}
          <p className="cookie-modal__body">
            We use essential cookies and telemetry technologies to enhance your browsing experience,
            safeguard cryptographic security, and analyze platform telemetry. Your enterprise sovereignty
            matters to us — we only gather telemetry that helps protect and serve your mission.
          </p>

          {/* Details Toggle */}
          <div className="cookie-modal__accordion">
            <button
              type="button"
              className="cookie-modal__accordion-btn"
              onClick={() => setShowDetails(!showDetails)}
              aria-expanded={showDetails}
            >
              <span className={`cookie-modal__accordion-chev ${showDetails ? 'is-open' : ''}`}>
                <Icon name="chev" />
              </span>
              <span>{showDetails ? 'Hide cookie details' : 'View cookie details'}</span>
            </button>

            {showDetails && (
              <div className="cookie-modal__details">
                <div className="cookie-modal__detail-item">
                  <div className="cookie-modal__detail-title">
                    <span>Essential & Security Cookies</span>
                    <span className="cookie-modal__tag">Always Active</span>
                  </div>
                  <p className="cookie-modal__detail-desc">
                    Required for core platform integrity, cryptographic state verification, CSRF defence, and session persistence.
                  </p>
                </div>
                <div className="cookie-modal__detail-item">
                  <div className="cookie-modal__detail-title">
                    <span>Telemetry & Analytics</span>
                    <span className="cookie-modal__tag">Optional</span>
                  </div>
                  <p className="cookie-modal__detail-desc">
                    Anonymized metrics to evaluate latency, server load, and enhance the responsiveness of our deeptech platform.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="cookie-modal__actions">
            <button
              type="button"
              className="btn btn--metal cookie-modal__btn-primary"
              onClick={() => handleConsent('all')}
            >
              <span>Accept All Cookies</span>
              <span className="cookie-modal__btn-icon">
                <Icon name="arrow" />
              </span>
            </button>

            <button
              type="button"
              className="btn btn--glass cookie-modal__btn-secondary"
              onClick={() => handleConsent('essential')}
            >
              <span>Essential Only</span>
              <span className="cookie-modal__btn-icon">
                <Icon name="arrow" />
              </span>
            </button>
          </div>

          {/* Legal Disclaimer */}
          <p className="cookie-modal__legal">
            By continuing to use our site, you agree to our{' '}
            <Link href="/privacy/" className="cookie-modal__legal-link">
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link href="/terms/" className="cookie-modal__legal-link">
              Terms of Service
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { useT } from '../i18n/I18nContext.jsx';
import {
  buildAbayaPrompt,
  downloadVideoBlob,
  extractVideoData,
  geminiConfigured,
  pollUntilDone,
  startVeoGeneration,
  videoSrc,
} from '../services/gemini.js';

export default function CinematicVideoModal({ open, onClose, payload }) {
  const t = useT();
  const [stage, setStage] = useState('idle');
  const [err, setErr] = useState('');
  const [videoData, setVideoData] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const aliveRef = useRef(true);
  const startedRef = useRef(false);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  async function start() {
    if (!geminiConfigured()) return;
    setStage('starting');
    setErr('');
    setVideoData(null);
    setElapsed(0);
    try {
      const p = buildAbayaPrompt(payload || {});
      setPrompt(p);
      const opName = await startVeoGeneration({ prompt: p });
      if (!aliveRef.current) return;
      setStage('rendering');
      const result = await pollUntilDone(opName, {
        onTick: ({ elapsedMs }) => {
          if (aliveRef.current) setElapsed(elapsedMs);
        },
      });
      if (!aliveRef.current) return;
      const data = extractVideoData(result);
      if (!data || (!data.uri && !data.bytes)) {
        throw new Error('No video returned by Veo');
      }
      setVideoData(data);
      setStage('done');
    } catch (e) {
      if (aliveRef.current) {
        setErr(e.message || 'Failed');
        setStage('error');
      }
    }
  }

  useEffect(() => {
    if (open) {
      if (!startedRef.current && geminiConfigured()) {
        startedRef.current = true;
        start();
      }
    } else {
      startedRef.current = false;
      setStage('idle');
      setVideoData(null);
      setErr('');
      setElapsed(0);
      setPrompt('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function onDownload() {
    if (!videoData) return;
    try {
      const blob = await downloadVideoBlob(videoData);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `abaya-preview-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      alert(e.message || 'Download failed');
    }
  }

  if (!open) return null;

  const seconds = Math.floor(elapsed / 1000);
  const playing = stage === 'done' && videoData;
  const src = playing ? videoSrc(videoData) : null;

  return (
    <div className="cine-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="cine-modal" onClick={(e) => e.stopPropagation()}>
        <header className="cine-modal__header">
          <div>
            <h3 className="mb-1">{t('ai_video.title')}</h3>
            <p className="small text-muted mb-0">{t('ai_video.subtitle')}</p>
          </div>
          <button type="button" className="cine-modal__close" onClick={onClose} aria-label={t('ai_video.close')}>
            <i className="fas fa-times" aria-hidden="true" />
          </button>
        </header>

        <div className="cine-modal__body">
          {!geminiConfigured() ? (
            <div className="cine-empty">
              <i className="fas fa-key cine-empty__icon" aria-hidden="true" />
              <h4>{t('ai_video.not_configured_title')}</h4>
              <p className="text-muted">{t('ai_video.not_configured_body')}</p>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="btn btn-brand mt-2"
              >
                {t('ai_video.not_configured_link')}
              </a>
            </div>
          ) : playing ? (
            <div className="cine-video">
              <video src={src} controls autoPlay loop playsInline poster="" />
              <div className="cine-video__actions">
                <button type="button" className="btn btn-outline-secondary" onClick={onDownload}>
                  <i className="fas fa-download mr-2" aria-hidden="true" />
                  {t('ai_video.download')}
                </button>
                <button type="button" className="btn btn-brand" onClick={start}>
                  <i className="fas fa-redo mr-2" aria-hidden="true" />
                  {t('ai_video.regenerate')}
                </button>
              </div>
            </div>
          ) : stage === 'error' ? (
            <div className="cine-error">
              <i className="fas fa-exclamation-triangle cine-empty__icon" aria-hidden="true" />
              <h4 className="text-danger">{t('ai_video.error_title')}</h4>
              <p className="text-muted small" style={{ whiteSpace: 'pre-wrap', maxHeight: 180, overflow: 'auto' }}>
                {err}
              </p>
              <button type="button" className="btn btn-brand" onClick={start}>
                {t('ai_video.retry')}
              </button>
            </div>
          ) : (
            <div className="cine-loading">
              <div className="cine-spinner" aria-hidden="true">
                <div />
                <div />
                <div />
              </div>
              <h4>{t('ai_video.generating')}</h4>
              <p className="text-muted small">{t('ai_video.generating_hint')}</p>
              <p className="text-muted small mb-0">{t('ai_video.elapsed', { s: seconds })}</p>
            </div>
          )}
        </div>

        {prompt ? (
          <details className="cine-prompt">
            <summary>{t('ai_video.prompt_label')}</summary>
            <pre>{prompt}</pre>
          </details>
        ) : null}
      </div>
    </div>
  );
}

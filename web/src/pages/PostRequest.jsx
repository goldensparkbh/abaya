import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ConfigBanner from '../components/ConfigBanner.jsx';
import AbayaBuilder from '../components/AbayaBuilder.jsx';
import { defaultSizes, hexForColor } from '../components/abayaModel.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useT } from '../i18n/I18nContext.jsx';
import { createRequest } from '../services/bidding.js';
import { db } from '../firebase.js';

export default function PostRequest() {
  const t = useT();
  const { user, profile, firebaseReady } = useAuth();
  const nav = useNavigate();

  const [color, setColor] = useState('Black');
  const [customHex, setCustomHex] = useState('#7a5a8a');
  const [fabric, setFabric] = useState('Crepe');
  const [fabricOther, setFabricOther] = useState('');
  const [sizes, setSizes] = useState(defaultSizes());
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  if (!firebaseReady || !db) {
    return (
      <div className="container content-page">
        <ConfigBanner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container content-page">
        <div className="empty-state">
          <h2 className="h4 mb-3">{t('post.sign_in_title')}</h2>
          <Link to="/login" className="btn btn-brand px-4">
            {t('login.submit')}
          </Link>
        </div>
      </div>
    );
  }

  if (profile?.role && profile.role !== 'customer') {
    return (
      <div className="container content-page">
        <div className="empty-state">
          <h2 className="h4 mb-3">{t('post.customer_only_title')}</h2>
          <p className="text-muted">{t('post.customer_only_body')}</p>
          <Link to="/browse" className="btn btn-brand px-4 mt-2">
            {t('hero.cta_browse')}
          </Link>
        </div>
      </div>
    );
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    if (!title.trim() || !description.trim()) {
      setErr(t('post.err_title_desc'));
      return;
    }
    setBusy(true);
    try {
      const resolvedHex = color === 'Custom' ? customHex : hexForColor(color);
      const id = await createRequest({
        customerId: user.uid,
        customerName: profile?.displayName || user.displayName || user.email,
        title: title.trim(),
        description: description.trim(),
        color,
        colorHex: resolvedHex,
        fabric,
        fabricOther: fabric === 'Other' ? fabricOther.trim() : '',
        quantity: Math.max(1, Number(quantity) || 1),
        sizes: { ...sizes },
        budgetMin: budgetMin ? Number(budgetMin) : null,
        budgetMax: budgetMax ? Number(budgetMax) : null,
      });
      nav(`/requests/${id}`);
    } catch (e2) {
      setErr(e2.message || t('post.err_failed'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container content-page px-3 px-md-4" style={{ maxWidth: 1180 }}>
      <header className="section-header text-center text-md-left mb-4">
        <p className="section-header__eyebrow">{t('post.eyebrow')}</p>
        <h1 className="section-header__title">{t('post.title')}</h1>
        <p className="section-header__subtitle">{t('post.subtitle')}</p>
      </header>

      <form onSubmit={onSubmit}>
        <AbayaBuilder
          color={color}
          setColor={setColor}
          customHex={customHex}
          setCustomHex={setCustomHex}
          fabric={fabric}
          setFabric={setFabric}
          fabricOther={fabricOther}
          setFabricOther={setFabricOther}
          sizes={sizes}
          setSizes={setSizes}
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          quantity={quantity}
          setQuantity={setQuantity}
          budgetMin={budgetMin}
          setBudgetMin={setBudgetMin}
          budgetMax={budgetMax}
          setBudgetMax={setBudgetMax}
        />

        {err ? <div className="alert alert-danger mt-3 py-2 small">{err}</div> : null}

        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-md-between mt-4">
          <p className="small text-muted mb-3 mb-md-0" style={{ maxWidth: 560 }}>{t('post.footer_note')}</p>
          <button type="submit" className="btn btn-brand px-4 py-2" disabled={busy}>
            {busy ? t('post.submitting') : t('post.submit')}
          </button>
        </div>
      </form>
    </div>
  );
}

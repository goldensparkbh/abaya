import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ConfigBanner from '../components/ConfigBanner.jsx';
import AbayaPreview from '../components/AbayaPreview.jsx';
import CinematicVideoModal from '../components/CinematicVideoModal.jsx';
import { SIZE_KEYS, defaultSizes, hexForColor } from '../components/abayaModel.js';
import StatusBadge from '../components/StatusBadge.jsx';

const Abaya3DScene = React.lazy(() => import('../components/Abaya3DScene.jsx'));
import { useAuth } from '../context/AuthContext.jsx';
import { useT } from '../i18n/I18nContext.jsx';
import { db } from '../firebase.js';
import {
  ACTIVE_STATUSES,
  awardBid,
  cancelRequest,
  fundEscrow,
  openDispute,
  placeBid,
  releaseEscrow,
  sendMessage,
  shopMarkDelivered,
  shopStart,
  simulateDummyCardCharge,
  subscribeBids,
  subscribeDisputes,
  subscribeMessages,
  subscribePayment,
  subscribeRequest,
  withdrawBid,
} from '../services/bidding.js';

const TABS = [
  { id: 'overview', key: 'tabs_overview' },
  { id: 'bids', key: 'tabs_bids' },
  { id: 'chat', key: 'tabs_chat' },
  { id: 'payment', key: 'tabs_payment' },
  { id: 'dispute', key: 'tabs_dispute' },
];

function useTimeAgo() {
  const t = useT();
  return (ts) => {
    if (!ts?.toDate) return '';
    const ms = Date.now() - ts.toDate().getTime();
    if (ms < 60_000) return t('common.just_now');
    const m = Math.floor(ms / 60_000);
    if (m < 60) return t('common.minutes_ago', { n: m });
    const h = Math.floor(m / 60);
    if (h < 24) return t('common.hours_ago', { n: h });
    const d = Math.floor(h / 24);
    return t('common.days_ago', { n: d });
  };
}

function digitsOnly(s) {
  return (s || '').replace(/\D/g, '');
}

function formatCard(raw) {
  return digitsOnly(raw).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

export default function RequestDetail() {
  const t = useT();
  const timeAgo = useTimeAgo();
  const { id: requestId } = useParams();
  const { user, profile, firebaseReady } = useAuth();

  const [request, setRequest] = useState(null);
  const [bids, setBids] = useState([]);
  const [messages, setMessages] = useState([]);
  const [payment, setPayment] = useState(null);
  const [disputes, setDisputes] = useState([]);
  const [tab, setTab] = useState('overview');
  const [videoOpen, setVideoOpen] = useState(false);

  const [bidPrice, setBidPrice] = useState('');
  const [bidLead, setBidLead] = useState('');
  const [bidNote, setBidNote] = useState('');
  const [bidBusy, setBidBusy] = useState(false);
  const [bidErr, setBidErr] = useState('');

  const [chatText, setChatText] = useState('');
  const chatScroll = useRef(null);

  const [card, setCard] = useState('');
  const [cardName, setCardName] = useState('');
  const [exp, setExp] = useState('');
  const [cvv, setCvv] = useState('');
  const [payBusy, setPayBusy] = useState(false);
  const [payErr, setPayErr] = useState('');

  const [disputeReason, setDisputeReason] = useState('');

  useEffect(() => {
    if (!user || !db || !requestId) return undefined;
    const u1 = subscribeRequest(requestId, setRequest);
    const u2 = subscribeBids(requestId, setBids);
    const u3 = subscribeMessages(requestId, setMessages);
    const u4 = subscribePayment(requestId, setPayment);
    const u5 = subscribeDisputes(requestId, setDisputes);
    return () => {
      u1?.();
      u2?.();
      u3?.();
      u4?.();
      u5?.();
    };
  }, [user, requestId]);

  useEffect(() => {
    if (tab === 'chat' && chatScroll.current) {
      chatScroll.current.scrollTop = chatScroll.current.scrollHeight;
    }
  }, [tab, messages]);

  const role = profile?.role || 'customer';
  const isShop = role === 'shop' || role === 'business';
  const isAdmin = role === 'admin';
  const isCustomer = user && request && request.customerId === user.uid;
  const isAwardedShop = user && request && request.awardedShopId === user.uid;
  const myBid = useMemo(() => (user ? bids.find((b) => b.shopId === user.uid) : null), [bids, user]);

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
          <h2 className="h4 mb-3">{t('request.sign_in_title')}</h2>
          <Link to="/login" className="btn btn-brand px-4">
            {t('login.submit')}
          </Link>
        </div>
      </div>
    );
  }

  if (!request) {
    return <div className="container content-page text-muted">{t('common.loading')}</div>;
  }

  async function onPlaceBid(e) {
    e.preventDefault();
    setBidErr('');
    const p = Number(bidPrice);
    const l = Number(bidLead);
    if (!p || p <= 0) {
      setBidErr(t('request.bid_err_price'));
      return;
    }
    if (!l || l <= 0) {
      setBidErr(t('request.bid_err_lead'));
      return;
    }
    setBidBusy(true);
    try {
      await placeBid(requestId, {
        shopId: user.uid,
        shopName: profile?.displayName || profile?.shopName || user.email,
        price: p,
        leadTimeDays: l,
        note: bidNote,
      });
      setBidPrice('');
      setBidLead('');
      setBidNote('');
    } catch (e2) {
      setBidErr(e2.message || t('request.bid_err_generic'));
    } finally {
      setBidBusy(false);
    }
  }

  async function onAward(bid) {
    if (!isCustomer) return;
    if (!window.confirm(t('request.award_confirm', { shop: bid.shopName, price: bid.price }))) return;
    try {
      await awardBid(requestId, bid, user.uid);
      setTab('payment');
    } catch (e) {
      alert(e.message || t('request.award_err'));
    }
  }

  async function onPay(e) {
    e.preventDefault();
    setPayErr('');
    if (digitsOnly(card).length !== 16) {
      setPayErr(t('request.pay_err_card'));
      return;
    }
    if (!cardName.trim()) {
      setPayErr(t('request.pay_err_name'));
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(exp.trim())) {
      setPayErr(t('request.pay_err_exp'));
      return;
    }
    const c = digitsOnly(cvv);
    if (c.length < 3 || c.length > 4) {
      setPayErr(t('request.pay_err_cvv'));
      return;
    }
    setPayBusy(true);
    try {
      const result = await simulateDummyCardCharge({ amount: request.awardedPrice, currency: request.currency || 'BHD' });
      await fundEscrow(requestId, user.uid, {
        ...result,
        cardLast4: digitsOnly(card).slice(-4),
        cardholder: cardName.trim(),
      });
      setCard('');
      setCardName('');
      setExp('');
      setCvv('');
    } catch (e2) {
      setPayErr(e2.message || t('request.pay_err_generic'));
    } finally {
      setPayBusy(false);
    }
  }

  async function onRelease() {
    if (!window.confirm(t('request.release_confirm'))) return;
    try {
      await releaseEscrow(requestId, user.uid);
    } catch (e) {
      alert(e.message || t('request.release_err'));
    }
  }

  async function onSendMessage(e) {
    e.preventDefault();
    if (!chatText.trim()) return;
    try {
      await sendMessage(requestId, {
        senderId: user.uid,
        senderRole: role,
        senderName: profile?.displayName || profile?.shopName || user.email,
        text: chatText,
      });
      setChatText('');
    } catch (e2) {
      alert(e2.message || t('request.chat_err'));
    }
  }

  async function onRaiseDispute(e) {
    e.preventDefault();
    if (!disputeReason.trim()) {
      alert(t('request.dispute_err_reason'));
      return;
    }
    try {
      await openDispute(requestId, {
        uid: user.uid,
        role,
        name: profile?.displayName || profile?.shopName || user.email,
        reason: disputeReason,
      });
      setDisputeReason('');
    } catch (e2) {
      alert(e2.message || t('request.dispute_err'));
    }
  }

  async function onCancel() {
    if (!window.confirm(t('request.cancel_confirm'))) return;
    try {
      await cancelRequest(requestId, user.uid);
    } catch (e) {
      alert(e.message || t('common.error_generic'));
    }
  }

  const activeStep = (() => {
    const order = ['open', 'awarded', 'paid', 'in_progress', 'delivered', 'completed'];
    const idx = order.indexOf(request.status);
    return idx >= 0 ? idx : 0;
  })();

  const STEPS = [
    t('pipeline.open'),
    t('pipeline.awarded'),
    t('pipeline.paid'),
    t('pipeline.in_progress'),
    t('pipeline.delivered'),
    t('pipeline.completed'),
  ];

  return (
    <div className="container content-page px-3 px-md-4" style={{ maxWidth: 1080 }}>
      <ConfigBanner />
      <div className="d-flex flex-column flex-md-row align-items-start justify-content-between mb-3">
        <div>
          <p className="small text-muted mb-1">{t('request.request_id', { id: request.id.slice(0, 8) })}</p>
          <h1 className="cart-page-title mb-1">{request.title}</h1>
          <p className="small text-muted mb-0">
            {t('request.posted_by', { name: request.customerName })} · {t(`fabric.${request.fabric}`)} · {t(`color.${request.color}`)} · {t('common.qty')} {request.quantity}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <nav className="request-pipeline mb-4" aria-label={t('request.pipeline_title')}>
        {STEPS.map((s, i) => (
          <div key={s} className={`request-pipeline__step ${i === activeStep ? 'is-active' : ''} ${i < activeStep ? 'is-done' : ''}`}>
            <span className="num">{i + 1}</span>
            <span className="label">{s}</span>
          </div>
        ))}
      </nav>

      <nav className="tab-nav mb-4">
        {TABS.map((tabDef) => (
          <button
            key={tabDef.id}
            type="button"
            className={`tab-nav__btn ${tab === tabDef.id ? 'is-active' : ''}`}
            onClick={() => setTab(tabDef.id)}
          >
            {t(`request.${tabDef.key}`)}
            {tabDef.id === 'bids' ? <span className="ml-2 small text-muted">{bids.length}</span> : null}
            {tabDef.id === 'chat' ? <span className="ml-2 small text-muted">{messages.length}</span> : null}
          </button>
        ))}
      </nav>

      {tab === 'overview' && (
        <div className="row">
          <div className="col-lg-7 mb-4 mb-lg-0">
            <div className="panel-card mb-4">
              <h2 className="h6 font-weight-bold mb-2">{t('request.section_description')}</h2>
              <p style={{ whiteSpace: 'pre-wrap' }} className="mb-0">
                {request.description}
              </p>
            </div>
            <div className="panel-card">
              <h2 className="h6 font-weight-bold mb-3">{t('request.section_specs')}</h2>
              <div className="row small">
                <div className="col-6 mb-2">
                  <span className="text-muted">{t('request.label_fabric')}</span>
                  <div className="font-weight-bold">{t(`fabric.${request.fabric}`)}</div>
                </div>
                <div className="col-6 mb-2">
                  <span className="text-muted">{t('request.label_color')}</span>
                  <div className="font-weight-bold">{t(`color.${request.color}`)}</div>
                </div>
                <div className="col-6 mb-2">
                  <span className="text-muted">{t('request.label_qty')}</span>
                  <div className="font-weight-bold">{request.quantity}</div>
                </div>
                <div className="col-6 mb-2">
                  <span className="text-muted">{t('request.label_budget')}</span>
                  <div className="font-weight-bold">
                    {(request.budgetMin || request.budgetMax)
                      ? `${request.budgetMin ?? '—'} – ${request.budgetMax ?? '—'} ${t('common.bhd')}`
                      : t('request.budget_open')}
                  </div>
                </div>
                {request.awardedShopName ? (
                  <div className="col-12 mb-2 mt-2 pt-2 border-top" style={{ borderColor: 'var(--color-border)' }}>
                    <span className="text-muted">{t('request.label_awarded')}</span>
                    <div className="font-weight-bold">
                      {t('request.awarded_value', { shop: request.awardedShopName, price: request.awardedPrice, days: request.awardedLeadTimeDays })}
                    </div>
                  </div>
                ) : null}
              </div>
              {isCustomer && request.status === 'open' ? (
                <button type="button" className="btn btn-outline-danger btn-sm mt-3" onClick={onCancel}>
                  {t('request.cancel_btn')}
                </button>
              ) : null}
            </div>
          </div>
          <div className="col-lg-5">
            <div className="panel-card mb-4">
              <h2 className="h6 font-weight-bold mb-3">{t('builder.preview_title')}</h2>
              <div className="request-detail-preview">
                <React.Suspense
                  fallback={
                    <div style={{ height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AbayaPreview
                        color={request.color || 'Black'}
                        colorHex={request.colorHex}
                        fabric={request.fabric || 'Crepe'}
                        sizes={request.sizes || {}}
                      />
                    </div>
                  }
                >
                  <Abaya3DScene
                    color={request.color || 'Black'}
                    colorHex={request.colorHex || hexForColor(request.color || 'Black')}
                    fabric={request.fabric || 'Crepe'}
                    sizes={{ ...defaultSizes(), ...(request.sizes || {}) }}
                    autoRotate
                    height={380}
                  />
                </React.Suspense>
              </div>
              <button type="button" className="btn-pill btn-pill--accent w-100 mt-3" onClick={() => setVideoOpen(true)}>
                <i className="fas fa-film mr-2" aria-hidden="true" />
                {t('builder.cinematic_cta')}
              </button>
            </div>
            <div className="panel-card">
              <h2 className="h6 font-weight-bold mb-3">{t('request.measurements_title')}</h2>
              <ul className="list-unstyled small mb-0 measurement-list">
                {SIZE_KEYS.map((k) => (
                  <li key={k} className="d-flex justify-content-between py-1">
                    <span className="text-muted">{t(`size_guide.${k}`)}</span>
                    <strong>{request.sizes?.[k] ?? '—'} {t('common.cm')}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <CinematicVideoModal
        open={videoOpen}
        onClose={() => setVideoOpen(false)}
        payload={{
          color: request.color || 'Black',
          colorHex: request.colorHex || hexForColor(request.color || 'Black'),
          fabric: request.fabric || 'Crepe',
          sizes: { ...defaultSizes(), ...(request.sizes || {}) },
          description: request.description,
          title: request.title,
        }}
      />

      {tab === 'bids' && (
        <div className="row">
          <div className="col-lg-7">
            {!bids.length ? (
              <p className="text-muted">{t('request.no_bids')}</p>
            ) : (
              <ul className="list-unstyled bid-list">
                {bids.map((b) => (
                  <li key={b.id} className={`bid-row ${b.status === 'awarded' ? 'is-winner' : ''}`}>
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center mb-1">
                        <strong>{b.shopName}</strong>
                        <span className={`status-badge ml-2 ${b.status === 'awarded' ? 'badge-awarded' : b.status === 'withdrawn' ? 'badge-muted' : 'badge-progress'}`}>
                          {t(`status.${b.status}`)}
                        </span>
                        <span className="ml-auto small text-muted">{timeAgo(b.createdAt)}</span>
                      </div>
                      <p className="mb-1">
                        <span className="bid-price">{b.price} {t('common.bhd')}</span>
                        <span className="text-muted small ml-2">{t('request.bid_in_days', { n: b.leadTimeDays })}</span>
                      </p>
                      {b.note ? <p className="small text-muted mb-0">{b.note}</p> : null}
                    </div>
                    <div className="bid-actions">
                      {isCustomer && request.status === 'open' && b.status !== 'withdrawn' ? (
                        <button type="button" className="btn btn-brand btn-sm" onClick={() => onAward(b)}>
                          {t('request.award_btn')}
                        </button>
                      ) : null}
                      {user && b.shopId === user.uid && b.status === 'pending' ? (
                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => withdrawBid(requestId, b.id, user.uid)}>
                          {t('request.withdraw_btn')}
                        </button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="col-lg-5">
            {isShop && request.status === 'open' ? (
              <form onSubmit={onPlaceBid} className="panel-card">
                <h2 className="h6 font-weight-bold mb-3">{myBid ? t('request.bid_form_update') : t('request.bid_form_place')}</h2>
                {bidErr ? <div className="alert alert-danger py-2 small">{bidErr}</div> : null}
                <div className="form-group">
                  <label className="size-input__label" htmlFor="bid-price">
                    {t('request.bid_price')}
                  </label>
                  <input id="bid-price" type="number" min={1} className="form-control" value={bidPrice} onChange={(e) => setBidPrice(e.target.value)} placeholder={myBid ? String(myBid.price) : '40'} />
                </div>
                <div className="form-group">
                  <label className="size-input__label" htmlFor="bid-lead">
                    {t('request.bid_lead')}
                  </label>
                  <input id="bid-lead" type="number" min={1} className="form-control" value={bidLead} onChange={(e) => setBidLead(e.target.value)} placeholder={myBid ? String(myBid.leadTimeDays) : '7'} />
                </div>
                <div className="form-group">
                  <label className="size-input__label" htmlFor="bid-note">
                    {t('request.bid_note')}
                  </label>
                  <textarea id="bid-note" rows={3} className="form-control" value={bidNote} onChange={(e) => setBidNote(e.target.value)} placeholder={t('request.bid_note_ph')} />
                </div>
                <button type="submit" className="btn btn-brand btn-block" disabled={bidBusy}>
                  {bidBusy ? t('request.bid_send') : myBid ? t('request.bid_submit_update') : t('request.bid_submit_new')}
                </button>
              </form>
            ) : null}
            {!isShop && request.status === 'open' ? (
              <div className="panel-card text-center">
                <p className="text-muted small mb-0">{t('request.bids_placeholder_customer')}</p>
              </div>
            ) : null}
            {request.status !== 'open' ? (
              <div className="panel-card text-center">
                <p className="text-muted small mb-0">
                  {t('request.bids_closed', { status: t(`status.${request.status}`) })}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {tab === 'chat' && (
        <div className="panel-card chat-panel">
          <div className="chat-messages" ref={chatScroll}>
            {!messages.length ? (
              <p className="text-muted small text-center py-4">{t('request.chat_empty')}</p>
            ) : (
              messages.map((m) => {
                const mine = m.senderId === user.uid;
                return (
                  <div key={m.id} className={`chat-bubble ${mine ? 'is-mine' : ''}`}>
                    <div className="chat-meta">
                      <strong>{mine ? t('common.you') : m.senderName}</strong>
                      <span className="text-muted small ml-2">{timeAgo(m.createdAt)}</span>
                    </div>
                    <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                      {m.text}
                    </p>
                  </div>
                );
              })
            )}
          </div>
          <form onSubmit={onSendMessage} className="chat-input">
            <input
              type="text"
              className="form-control"
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              placeholder={t('request.chat_placeholder')}
            />
            <button type="submit" className="btn btn-brand">
              {t('request.chat_send')}
            </button>
          </form>
        </div>
      )}

      {tab === 'payment' && (
        <div className="row">
          <div className="col-lg-7 mb-4 mb-lg-0">
            {!request.awardedShopId ? (
              <p className="text-muted">{t('request.pay_no_award')}</p>
            ) : request.status === 'awarded' && isCustomer ? (
              <form onSubmit={onPay} className="panel-card">
                <div className="alert flash-success border-0 small mb-3" role="status">
                  <strong>{t('request.pay_banner_title')}</strong> {t('request.pay_banner_body')}
                </div>
                <h2 className="h6 font-weight-bold mb-3">
                  {t('request.pay_title', { amount: request.awardedPrice, currency: request.currency || t('common.bhd') })}
                </h2>
                {payErr ? <div className="alert alert-danger py-2 small">{payErr}</div> : null}
                <div className="form-group">
                  <label className="size-input__label" htmlFor="pay-card">
                    {t('request.pay_card')}
                  </label>
                  <input id="pay-card" inputMode="numeric" className="form-control" value={card} onChange={(e) => setCard(formatCard(e.target.value))} placeholder={t('request.pay_card_ph')} />
                </div>
                <div className="form-group">
                  <label className="size-input__label" htmlFor="pay-cardname">
                    {t('request.pay_cardname')}
                  </label>
                  <input id="pay-cardname" className="form-control" value={cardName} onChange={(e) => setCardName(e.target.value)} />
                </div>
                <div className="form-row">
                  <div className="col-6 form-group">
                    <label className="size-input__label" htmlFor="pay-exp">
                      {t('request.pay_exp')}
                    </label>
                    <input id="pay-exp" className="form-control" value={exp} onChange={(e) => setExp(e.target.value)} placeholder={t('request.pay_exp_ph')} />
                  </div>
                  <div className="col-6 form-group">
                    <label className="size-input__label" htmlFor="pay-cvv">
                      {t('request.pay_cvv')}
                    </label>
                    <input id="pay-cvv" inputMode="numeric" className="form-control" value={cvv} onChange={(e) => setCvv(digitsOnly(e.target.value).slice(0, 4))} placeholder={t('request.pay_cvv_ph')} />
                  </div>
                </div>
                <button type="submit" className="btn btn-brand btn-block py-2" disabled={payBusy}>
                  {payBusy ? t('request.pay_busy') : t('request.pay_btn', { amount: request.awardedPrice, currency: request.currency || t('common.bhd') })}
                </button>
              </form>
            ) : (
              <div className="panel-card">
                <h2 className="h6 font-weight-bold mb-3">{t('request.escrow_title')}</h2>
                {payment ? (
                  <ul className="list-unstyled small mb-3">
                    <li className="mb-1">
                      {t('request.escrow_state')} <strong>{payment.state}</strong>
                    </li>
                    <li className="mb-1">
                      {t('request.escrow_amount')} <strong>{payment.amount} {payment.currency || t('common.bhd')}</strong>
                    </li>
                    {payment.cardLast4 ? <li className="mb-1">{t('request.escrow_card')} {payment.cardLast4}</li> : null}
                    {payment.reference ? (
                      <li className="mb-1">
                        {t('request.escrow_ref')} <code>{payment.reference}</code>
                      </li>
                    ) : null}
                  </ul>
                ) : (
                  <p className="text-muted small">{t('request.escrow_empty')}</p>
                )}
                {isAwardedShop && request.status === 'paid' ? (
                  <button type="button" className="btn btn-brand" onClick={() => shopStart(requestId, user.uid)}>
                    {t('request.shop_start_btn')}
                  </button>
                ) : null}
                {isAwardedShop && request.status === 'in_progress' ? (
                  <button type="button" className="btn btn-brand" onClick={() => shopMarkDelivered(requestId, user.uid)}>
                    {t('request.shop_deliver_btn')}
                  </button>
                ) : null}
                {isCustomer && request.status === 'delivered' ? (
                  <button type="button" className="btn btn-brand" onClick={onRelease}>
                    {t('request.release_btn')}
                  </button>
                ) : null}
              </div>
            )}
          </div>
          <div className="col-lg-5">
            <div className="panel-card">
              <h2 className="h6 font-weight-bold mb-3">{t('request.how_title')}</h2>
              <ol className="small pl-3 mb-0" style={{ lineHeight: 1.7 }}>
                <li>{t('request.how_1')}</li>
                <li>{t('request.how_2')}</li>
                <li>{t('request.how_3')}</li>
                <li>{t('request.how_4')}</li>
                <li>{t('request.how_5')}</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {tab === 'dispute' && (
        <div className="row">
          <div className="col-lg-7 mb-4 mb-lg-0">
            {disputes.length ? (
              <div className="panel-card mb-3">
                <h2 className="h6 font-weight-bold mb-3">{t('request.dispute_history')}</h2>
                <ul className="list-unstyled small mb-0">
                  {disputes.map((d) => (
                    <li key={d.id} className="mb-3 pb-3 border-bottom" style={{ borderColor: 'var(--color-border)' }}>
                      <div className="d-flex justify-content-between">
                        <strong>{d.raisedByName}</strong>
                        <span className={`status-badge ${d.status === 'open' ? 'badge-warn' : 'badge-done'}`}>
                          {d.status === 'open' ? t('status.open') : d.status === 'resolved_release' ? t('admin.resolve_release') : t('admin.resolve_refund')}
                        </span>
                      </div>
                      <p className="mb-1">{d.reason}</p>
                      {d.resolution ? <p className="text-muted small mb-0">{t('request.dispute_resolution', { note: d.resolution })}</p> : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {(isCustomer || isAwardedShop) && ACTIVE_STATUSES.includes(request.status) ? (
              <form onSubmit={onRaiseDispute} className="panel-card">
                <h2 className="h6 font-weight-bold mb-2">{t('request.dispute_open_title')}</h2>
                <p className="small text-muted mb-3">{t('request.dispute_open_sub')}</p>
                <textarea
                  className="form-control mb-3"
                  rows={4}
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder={t('request.dispute_placeholder')}
                />
                <button type="submit" className="btn btn-outline-danger">
                  {t('request.dispute_submit')}
                </button>
              </form>
            ) : (
              <p className="text-muted small">{t('request.dispute_restriction')}</p>
            )}
          </div>
          <div className="col-lg-5">
            <div className="panel-card">
              <h2 className="h6 font-weight-bold mb-3">{t('request.dispute_help_title')}</h2>
              <p className="small text-muted mb-2">{t('request.dispute_help_body')}</p>
              {isAdmin ? (
                <Link to="/admin" className="btn btn-brand btn-sm mt-2">
                  {t('request.open_admin')}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

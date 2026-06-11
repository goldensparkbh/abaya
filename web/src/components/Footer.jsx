import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useT } from '../i18n/I18nContext.jsx';

export default function Footer() {
  const t = useT();
  const { role } = useAuth();
  const isShop = role === 'shop' || role === 'business';
  return (
    <footer className="site-footer text-light pt-5 pb-3 mt-auto">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-4 mb-md-0">
            <img src="/img/logo-01.svg" alt="" className="mb-3" style={{ maxWidth: 140, height: 'auto', opacity: 0.95 }} />
            <h4 className="text-uppercase mb-2" style={{ fontSize: '0.95rem', letterSpacing: '0.12em' }}>
              {t('app.name')}
            </h4>
            <p className="small text-white-50 mb-0" style={{ maxWidth: 260, lineHeight: 1.65 }}>
              {t('footer.tagline')}
            </p>
          </div>
          <div className="col-6 col-md-4 mb-4 mb-md-0">
            <h5 className="text-uppercase">{t('footer.explore')}</h5>
            <ul className="list-unstyled mb-0">
              <li className="mb-2">
                <Link to="/about" className="footer-link">
                  {t('footer.about')}
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/contact" className="footer-link">
                  {t('footer.contact')}
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/shop" className="footer-link">
                  {t('nav.shop')}
                </Link>
              </li>
              {!isShop ? (
                <li className="mb-2">
                  <Link to="/custom-design" className="footer-link">
                    {t('nav.custom_design')}
                  </Link>
                </li>
              ) : null}
            </ul>
          </div>
          <div className="col-6 col-md-4">
            <h5 className="text-uppercase">{t('footer.follow')}</h5>
            <div className="d-flex flex-wrap">
              <a href="https://facebook.com" className="social-link" target="_blank" rel="noreferrer" aria-label="Facebook">
                <i className="fab fa-facebook-f" />
              </a>
              <a href="https://instagram.com" className="social-link" target="_blank" rel="noreferrer" aria-label="Instagram">
                <i className="fab fa-instagram" />
              </a>
              <a href="https://twitter.com" className="social-link" target="_blank" rel="noreferrer" aria-label="Twitter">
                <i className="fab fa-twitter" />
              </a>
              <a href="https://wa.me/" className="social-link" target="_blank" rel="noreferrer" aria-label="WhatsApp">
                <i className="fab fa-whatsapp" />
              </a>
            </div>
          </div>
        </div>
        <div className="row mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="col text-center copyright">{t('footer.copyright', { year: new Date().getFullYear() })}</div>
        </div>
      </div>
    </footer>
  );
}

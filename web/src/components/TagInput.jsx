import React, { useState } from 'react';

export default function TagInput({ tags = [], onChange, placeholder, label }) {
  const [input, setInput] = useState('');

  function addTag(value) {
    const next = value.trim();
    if (!next || tags.includes(next)) return;
    onChange([...tags, next]);
    setInput('');
  }

  function removeTag(tag) {
    onChange(tags.filter((t) => t !== tag));
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    }
  }

  return (
    <div className="tag-input">
      {label ? <label className="tag-input__label">{label}</label> : null}
      <div className="tag-input__box">
        {tags.map((tag) => (
          <span key={tag} className="tag-input__chip">
            {tag}
            <button type="button" className="tag-input__remove" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
              ×
            </button>
          </span>
        ))}
        <input
          className="tag-input__field"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => input.trim() && addTag(input)}
          placeholder={tags.length ? '' : placeholder}
        />
      </div>
    </div>
  );
}

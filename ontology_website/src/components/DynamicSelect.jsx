import React from 'react';

const DynamicSelect = ({ label, options, value, onChange }) => {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DynamicSelect;

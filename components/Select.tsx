import AsyncSelect from "react-select/async";

const styles = {
  control: (provided, state) => ({
    ...provided,
    border: '1px solid',
    borderColor: state.isFocused ? 'var(--room-accent)' : 'var(--border-color)',
    borderRadius: '6px',
    boxShadow: state.isFocused ? '0 0 0 1px rgba(201,164,97,0.15)' : 'none',
    transition: 'all 0.2s ease',
    backgroundColor: 'var(--surface-bg)',
    '&:hover': {
      borderColor: state.isFocused ? 'var(--room-accent)' : 'var(--border-strong)',
      cursor: 'text',
    },
    padding: '2px 8px 2px 12px',
    margin: 0,
    minHeight: '44px',
  }),
  dropdownIndicator: () => ({
    display: 'none',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  input: (provided) => ({
    ...provided,
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontFamily: 'var(--font-body), JetBrains Mono, monospace',
    letterSpacing: '-0.01em',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: 'var(--text-muted)',
    fontSize: '14px',
    fontFamily: 'var(--font-body), JetBrains Mono, monospace',
    letterSpacing: '-0.01em',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'var(--text-primary)',
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: '2px 4px',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? 'var(--surface-raised)' : 'transparent',
    color: state.isFocused ? 'var(--room-accent)' : 'var(--text-primary)',
    padding: '10px 14px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    borderBottom: '1px solid var(--border-color)',
    '&:last-child': {
      borderBottom: 'none',
    },
    '&:active': {
      backgroundColor: 'var(--surface-raised)',
    },
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: 'var(--surface-bg)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--border-color)',
    border: 'none',
    borderRadius: '6px',
    padding: '4px 0',
    fontSize: '14px',
    fontFamily: 'var(--font-body), JetBrains Mono, monospace',
    marginTop: '6px',
    overflow: 'hidden',
    zIndex: 9999,
  }),
  menuList: (provided) => ({
    ...provided,
    padding: 0,
  }),
  noOptionsMessage: (provided) => ({
    ...provided,
    color: 'var(--text-muted)',
    fontSize: '13px',
    fontFamily: 'var(--font-body), JetBrains Mono, monospace',
  }),
  loadingMessage: (provided) => ({
    ...provided,
    color: 'var(--text-muted)',
    fontSize: '13px',
  }),
  clearIndicator: (provided) => ({
    ...provided,
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '4px',
    '&:hover': {
      color: 'var(--text-primary)',
    },
  }),
};

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const Select = ({ handleChange, loadOptions, noOptionsMessage, option, isDisabled = false }) => {
  return (
    <div className="w-full">
      <AsyncSelect
        value={option}
        onChange={handleChange}
        loadOptions={loadOptions}
        defaultOptions={false}
        isClearable={true}
        placeholder="search tracks, artists..."
        noOptionsMessage={noOptionsMessage}
        components={{
          DropdownIndicator: () => <SearchIcon />,
        }}
        styles={styles}
        cacheOptions
        classNamePrefix="react-select"
        className="w-full"
        instanceId="search-select"
        isDisabled={isDisabled}
      />
    </div>
  );
};

export default Select;

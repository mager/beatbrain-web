import AsyncSelect from "react-select/async";

const styles = {
  control: (provided, state) => ({
    ...provided,
    border: '1px solid',
    borderColor: state.isFocused ? '#c9a461' : '#23233a',
    borderRadius: '6px',
    boxShadow: state.isFocused ? '0 0 0 1px rgba(201,164,97,0.15)' : 'none',
    transition: 'all 0.2s ease',
    backgroundColor: '#15151c',
    '&:hover': {
      borderColor: state.isFocused ? '#c9a461' : '#2e2e44',
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
    color: '#bfc0cb',
    fontSize: '14px',
    fontFamily: 'var(--font-body), JetBrains Mono, monospace',
    letterSpacing: '-0.01em',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#52526e',
    fontSize: '14px',
    fontFamily: 'var(--font-body), JetBrains Mono, monospace',
    letterSpacing: '-0.01em',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#bfc0cb',
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: '2px 4px',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? '#1e1e2a' : 'transparent',
    color: state.isFocused ? '#c9a461' : '#bfc0cb',
    padding: '10px 14px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    borderBottom: '1px solid #1a1a28',
    '&:last-child': {
      borderBottom: 'none',
    },
    '&:active': {
      backgroundColor: '#1e1e2a',
    },
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#15151c',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px #23233a',
    border: 'none',
    borderRadius: '6px',
    padding: '4px 0',
    fontSize: '14px',
    fontFamily: 'var(--font-body), JetBrains Mono, monospace',
    marginTop: '6px',
    overflow: 'hidden',
  }),
  menuList: (provided) => ({
    ...provided,
    padding: 0,
  }),
  noOptionsMessage: (provided) => ({
    ...provided,
    color: '#52526e',
    fontSize: '13px',
    fontFamily: 'var(--font-body), JetBrains Mono, monospace',
  }),
  loadingMessage: (provided) => ({
    ...provided,
    color: '#52526e',
    fontSize: '13px',
  }),
  clearIndicator: (provided) => ({
    ...provided,
    color: '#52526e',
    cursor: 'pointer',
    padding: '4px',
    '&:hover': {
      color: '#bfc0cb',
    },
  }),
};

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#52526e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
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

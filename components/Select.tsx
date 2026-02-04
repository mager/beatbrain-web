import AsyncSelect from "react-select/async";
import Box from "./Box";

const styles = {
  control: (provided, state) => ({
    ...provided,
    border: 'none',
    borderBottom: state.isFocused ? '2px solid #c9a461' : '2px solid #23233a',
    borderRadius: '0px',
    boxShadow: 'none',
    transition: 'border-color 0.25s ease',
    backgroundColor: 'transparent',
    '&:hover': {
      borderBottomColor: '#52526e',
      cursor: 'text',
    },
    padding: '4px 0',
    margin: 0,
    minHeight: '48px',
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
    fontSize: '16px',
    fontFamily: 'var(--font-body), JetBrains Mono, monospace',
    letterSpacing: '-0.01em',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#52526e',
    fontSize: '16px',
    fontFamily: 'var(--font-body), JetBrains Mono, monospace',
    letterSpacing: '-0.01em',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#bfc0cb',
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
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px #23233a',
    border: 'none',
    borderRadius: '4px',
    padding: '4px 0',
    fontSize: '14px',
    fontFamily: 'var(--font-body), JetBrains Mono, monospace',
    marginTop: '8px',
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
    '&:hover': {
      color: '#bfc0cb',
    },
  }),
};

const Select = ({ handleChange, loadOptions, noOptionsMessage, option, isDisabled = false }) => {
  return (
    <Box className="px-0 mx-0 w-full">
      <AsyncSelect
        value={option}
        onChange={handleChange}
        loadOptions={loadOptions}
        defaultOptions={false}
        isClearable={true}
        placeholder="search tracks..."
        noOptionsMessage={noOptionsMessage}
        components={{ DropdownIndicator: () => null }}
        styles={styles}
        cacheOptions
        classNamePrefix="react-select"
        className="w-full"
        instanceId="search-select"
        isDisabled={isDisabled}
      />
    </Box>
  );
};

export default Select;

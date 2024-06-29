import AsyncSelect from "react-select/async";

const styles = {
  control: (provided, state) => ({
    ...provided,
    border: state.isFocused ? "1px solid #ccc" : "1px solid #ccc",
    boxShadow: "none",
    "&:hover": {
      border: "1px solid #ccc",
      cursor: "text",
    },
    paddingTop: "8px",
    paddingBottom: "8px",
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    padding: 0,
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    display: "none",
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    display: "none",
  }),
  option: (provided, state) => ({
    ...provided,
    "&:hover": {
      cursor: "pointer",
    },
  }),
};

const DropdownIndicator = () => {
  return null;
};

const Select = ({ handleChange, loadOptions, noOptionsMessage, sourceId }) => {
  return (
    <div className="py-4">
      <AsyncSelect
        value={sourceId}
        onChange={handleChange}
        loadOptions={loadOptions}
        defaultOptions={false}
        isClearable={true}
        placeholder="Search for a song..."
        noOptionsMessage={noOptionsMessage}
        cacheOptions
        components={{ DropdownIndicator }}
        styles={styles}
      />
    </div>
  );
};

export default Select;

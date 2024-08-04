import AsyncSelect from "react-select/async";

const styles = {
  control: (provided, state) => ({
    ...provided,
    border: state.isFocused ? "1px solid #6b7280" : "1px solid #ccc",
    boxShadow: "none",
    "&:hover": {
      cursor: "text",
    },
    paddingTop: "8px",
    paddingBottom: "8px",
    paddingLeft: "4px",
    paddingRight: "4px",
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
  placeholder: (provided) => ({
    ...provided,
    color: "#999",
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

const Select = ({ handleChange, loadOptions, noOptionsMessage, option }) => {
  return (
    <div className="py-4 pb-2 text-md focus:outline-none focus:ring-gray-500 focus:border-gray-500">
      <AsyncSelect
        value={option}
        onChange={handleChange}
        loadOptions={loadOptions}
        defaultOptions={false}
        isClearable={true}
        placeholder="Search for a song..."
        noOptionsMessage={noOptionsMessage}
        components={{ DropdownIndicator }}
        styles={styles}
        cacheOptions
      />
    </div>
  );
};

export default Select;

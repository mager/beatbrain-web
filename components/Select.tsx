import AsyncSelect from "react-select/async";
import Box from "./Box";

const styles = {
  control: (provided, state) => ({
    ...provided,
    borderTop: "none",
    borderLeft: "none",
    borderRight: "none",
    borderBottom: state.isFocused ? "4px solid #4ade80" : "4px solid #d1d5db",
    borderRadius: "0px",
    boxShadow: state.isFocused ? "0 3px 9px rgba(74, 222, 128, 0.15)" : "none",
    transition: "all 0.2s ease",
    backgroundColor: "white",
    "&:hover": {
      borderColor: "#4ade80",
      cursor: "text",
    },
    padding: "0px 4px",
    margin: 0,
  }),
  dropdownIndicator: () => ({
    display: "none",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#9ca3af",
    fontSize: "24px",
    letterSpacing: "-0.05em",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? "#f3f4f6" : "white",
    color: state.isFocused ? "#4ade80" : "#374151",
    padding: "12px",
    "&:hover": {
      backgroundColor: "#dcfce7",
      cursor: "pointer",
    },
  }),
  // Style dropdown menu
  menu: (provided) => ({
    ...provided,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    border: "2px solid #e5e7eb",
    padding: "8px",
    fontSize: "24px",
    letterSpacing: "-0.05em",
  }),
};

const Select = ({ handleChange, loadOptions, noOptionsMessage, option }) => {
  return (
    <Box className="px-0 mx-0 w-full">
      <AsyncSelect
        value={option}
        onChange={handleChange}
        loadOptions={loadOptions}
        defaultOptions={false}
        isClearable={true}
        placeholder="Search for a track..."
        noOptionsMessage={noOptionsMessage}
        components={{ DropdownIndicator: () => null }}
        styles={styles}
        cacheOptions
        classNamePrefix="react-select"
        className="w-full"
      />
    </Box>
  );
};

export default Select;

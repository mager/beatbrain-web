export default {
    control: (provided, state) => ({
        ...provided,
        border: state.isFocused ? "1px solid #ccc" : "1px solid #ccc",
        boxShadow: "none",
        "&:hover": {
            border: "1px solid #ccc",
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
};
function FilterPanel({
    filters,
    options,
    onChange,
    onSearch,
    onReset
}) {
    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            onSearch();
        }
    };

    return (
        <div className="filter-panel">

            {/* Crop */}
            <div className="filter-group">
                <label>Crop</label>

                <select
                    name="crop"
                    value={filters.crop}
                    onChange={onChange}
                >
                    <option value="">
                        All Crops
                    </option>

                    {options.crops.map((crop) => (
                        <option
                            key={crop}
                            value={crop}
                        >
                            {crop}
                        </option>
                    ))}
                </select>
            </div>

            {/* Product */}
            <div className="filter-group">
                <label>Product</label>

                <select
                    name="product"
                    value={filters.product}
                    onChange={onChange}
                >
                    <option value="">
                        All Products
                    </option>

                    {options.products.map((product) => (
                        <option
                            key={product}
                            value={product}
                        >
                            {product}
                        </option>
                    ))}
                </select>
            </div>

            {/* Country */}
            <div className="filter-group">
                <label>Country</label>

                <select
                    name="country"
                    value={filters.country}
                    onChange={onChange}
                >
                    <option value="">
                        All Countries
                    </option>

                    {options.countries.map((country) => (
                        <option
                            key={country}
                            value={country}
                        >
                            {country}
                        </option>
                    ))}
                </select>
            </div>

            {/* Year */}
            <div className="filter-group">
                <label>Year</label>

                <select
                    name="year"
                    value={filters.year}
                    onChange={onChange}
                >
                    <option value="">
                        All Years
                    </option>

                    {options.years.map((year) => (
                        <option
                            key={year}
                            value={year}
                        >
                            {year}
                        </option>
                    ))}
                </select>
            </div>

            {/* Trial Type */}
            <div className="filter-group">
                <label>Trial Type</label>

                <select
                    name="trialType"
                    value={filters.trialType}
                    onChange={onChange}
                >
                    <option value="">
                        All Trial Types
                    </option>

                    {options.trialTypes.map(
                        (trialType) => (
                            <option
                                key={trialType}
                                value={trialType}
                            >
                                {trialType}
                            </option>
                        )
                    )}
                </select>
            </div>

            <div className="filter-actions">

                <button
                    className="search-button"
                    onClick={onSearch}
                >
                    Search
                </button>

                <button
                    className="reset-button"
                    onClick={onReset}
                >
                    Reset
                </button>

            </div>

        </div>
    );
}

export default FilterPanel;